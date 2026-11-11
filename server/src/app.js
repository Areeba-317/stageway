const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler
app.use((err, req, res, next) => {
     if (err.code === 11000) return res.status(409).json({ message: 'Email or phone already registered' });
     if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
     console.error(err);
     res.status(500).json({ message: 'Server error' });
});

module.exports = app;