const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

// Ensure receipts directory exists
const receiptDir = './uploads/receipts';
if (!fs.existsSync(receiptDir)) {
    fs.mkdirSync(receiptDir, { recursive: true });
    console.log('📁 Created receipts directory');
}

// Configure receipt upload
const receiptStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, receiptDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadReceipt = multer({ 
    storage: receiptStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDF files are allowed'));
        }
    }
});

// Upload payment receipt (Member)
router.post('/upload-receipt', authMiddleware, uploadReceipt.single('receipt'), async (req, res) => {
    try {
        const { content_id, amount, transaction_id, notes } = req.body;
        const receiptUrl = `/uploads/receipts/${req.file.filename}`;
        
        console.log('📤 Receipt upload - User:', req.user.id, 'Content:', content_id);
        
        const result = await pool.query(
            `INSERT INTO payment_receipts (user_id, content_id, amount, receipt_url, transaction_id, notes, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
            [req.user.id, content_id, amount, receiptUrl, transaction_id, notes]
        );
        
        res.json({ success: true, receipt: result.rows[0] });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Failed to upload receipt' });
    }
});

// Get user's payment receipts (Member)
router.get('/my-receipts', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT pr.*, dc.title, dc.author 
             FROM payment_receipts pr
             JOIN digital_contents dc ON pr.content_id = dc.id
             WHERE pr.user_id = $1 
             ORDER BY pr.submitted_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch receipts' });
    }
});

// Check if user can download (Member)
router.get('/can-download/:contentId', authMiddleware, async (req, res) => {
    try {
        const { contentId } = req.params;
        const userId = req.user.id;
        
        // Check purchases table
        const purchase = await pool.query(
            `SELECT * FROM purchases WHERE user_id = $1 AND content_id = $2`,
            [userId, contentId]
        );
        
        res.json({ 
            canDownload: purchase.rows.length > 0,
            isPurchased: purchase.rows.length > 0,
            isBorrowed: false
        });
    } catch (err) {
        console.error('Check download error:', err);
        res.status(500).json({ message: 'Failed to check download access' });
    }
});

// Get pending payments (Manager only)
router.get('/pending-payments', authMiddleware, checkRole(['manager', 'admin']), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT pr.*, u.email, u.full_name, dc.title, dc.author 
             FROM payment_receipts pr
             JOIN users u ON pr.user_id = u.id
             JOIN digital_contents dc ON pr.content_id = dc.id
             WHERE pr.status = 'pending'
             ORDER BY pr.submitted_at ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch pending payments' });
    }
});

// Approve payment (Manager only)
router.put('/approve-payment/:id', authMiddleware, checkRole(['manager', 'admin']), async (req, res) => {
    try {
        const paymentId = req.params.id;
        
        console.log('===== APPROVING PAYMENT =====');
        console.log('Payment ID:', paymentId);
        
        // Get payment details
        const payment = await pool.query(
            `SELECT user_id, content_id, amount FROM payment_receipts WHERE id = $1`,
            [paymentId]
        );
        
        if (payment.rows.length === 0) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        
        const { user_id, content_id, amount } = payment.rows[0];
        console.log(`User: ${user_id}, Content: ${content_id}, Amount: ${amount}`);
        
        // Update payment status to approved
        await pool.query(
            `UPDATE payment_receipts 
             SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
             WHERE id = $2`,
            [req.user.id, paymentId]
        );
        
        // Check if purchase already exists in purchases table
        const existingPurchase = await pool.query(
            `SELECT id FROM purchases WHERE user_id = $1 AND content_id = $2`,
            [user_id, content_id]
        );
        
        if (existingPurchase.rows.length === 0) {
            // Add to purchases table
            const insertResult = await pool.query(
                `INSERT INTO purchases (user_id, content_id, amount, payment_intent_id, purchased_at)
                 VALUES ($1, $2, $3, $4, NOW())
                 RETURNING *`,
                [user_id, content_id, amount, `receipt_${paymentId}`]
            );
            console.log('✅ Purchase created:', insertResult.rows[0]);
        } else {
            console.log('Purchase already exists');
        }
        
        res.json({ success: true, message: 'Payment approved successfully' });
    } catch (err) {
        console.error('Approve error:', err);
        res.status(500).json({ message: 'Failed to approve payment: ' + err.message });
    }
});

// Reject payment (Manager only)
router.put('/reject-payment/:id', authMiddleware, checkRole(['manager', 'admin']), async (req, res) => {
    try {
        const { reason } = req.body;
        await pool.query(
            `UPDATE payment_receipts 
             SET status = 'rejected', rejection_reason = $1, reviewed_by = $2, reviewed_at = NOW()
             WHERE id = $3`,
            [reason, req.user.id, req.params.id]
        );
        res.json({ success: true, message: 'Payment rejected' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to reject payment' });
    }
});

module.exports = router;