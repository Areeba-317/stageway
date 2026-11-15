const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
     url: { type: String, required: true },       // e.g. /uploads/abc123.mp4
     filename: { type: String, required: true },
     mimetype: String,
     size: Number,                                // bytes
     duration: Number,                            // seconds
     uploadedAt: { type: Date, default: Date.now },
});

const portfolioSchema = new mongoose.Schema({
     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
     name: { type: String, required: true, trim: true, maxlength: 80 },
     bio: { type: String, trim: true, maxlength: 1000, default: '' },
     age: { type: Number, required: true, min: 16, max: 100 },
     languages: { type: [String], default: [] },
     skills: { type: [String], default: [] },
     videos: { type: [videoSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);