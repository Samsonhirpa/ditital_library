// Debug endpoint - check purchase status
router.get('/debug/check/:contentId', authMiddleware, async (req, res) => {
    try {
        const { contentId } = req.params;
        const userId = req.user.id;
        
        const purchase = await pool.query(
            'SELECT * FROM purchases WHERE user_id = $1 AND content_id = $2',
            [userId, contentId]
        );
        
        const receipts = await pool.query(
            'SELECT * FROM payment_receipts WHERE user_id = $1 AND content_id = $2',
            [userId, contentId]
        );
        
        res.json({
            hasPurchase: purchase.rows.length > 0,
            purchase: purchase.rows,
            receipts: receipts.rows,
            userId: userId,
            contentId: contentId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});