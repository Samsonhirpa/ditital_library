const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Digital Library API is running!' });
});

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const pool = require('./config/db');
    await pool.query('SELECT NOW()');
    res.json({ status: 'OK', database: 'connected', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: err.message });
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contents', require('./routes/contents'));
app.use('/api/borrow', require('./routes/borrow'));
app.use('/api/purchases', require('./routes/borrow'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/manager', require('./routes/manager'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/super-admin', require('./routes/superAdmin'));
app.use('/api/library-admin', require('./routes/libraryAdmin'));
app.use('/api/physical', require('./routes/physical'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});