const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const vacancyRoutes = require('./routes/vacancyRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) =>
     res.json({
          status: 'ok',
          db: mongoose.connection.readyState === 1 ? 'connected' : 'not connected',
     })
);

app.use('/api/auth', authRoutes);
app.use('/api/vacancies', vacancyRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/applications', applicationRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler
app.use((err, req, res, next) => {
     if (err.code === 11000) {
          const keys = Object.keys(err.keyPattern || {});
          if (keys.includes('vacancy')) return res.status(409).json({ message: 'You already applied to this vacancy' });
          if (keys.includes('user')) return res.status(409).json({ message: 'You already have a portfolio' });
          return res.status(409).json({ message: 'Email or phone already registered' });
     }
     if (err.name === 'UploadError') return res.status(400).json({ message: err.message });
     if (err instanceof multer.MulterError) {
          const messages = {
               LIMIT_FILE_SIZE: 'Video is too large (max 50 MB)',
               LIMIT_UNEXPECTED_FILE: 'Send the video in the "video" field',
          };
          return res.status(400).json({ message: messages[err.code] || err.message });
     }
     if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0].message });
     if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
     console.error(err);
     res.status(500).json({ message: 'Server error' });
});

module.exports = app;