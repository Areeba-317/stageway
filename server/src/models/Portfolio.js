const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
     url: { type: String, required: true },
     name: { type: String, default: 'video' },   // original file name
     key: { type: String, required: true },      // R2 object key, never sent to the client
     mimetype: String,
     size: Number,
     duration: Number,
     uploadedAt: { type: Date, default: Date.now },
});

const portfolioSchema = new mongoose.Schema({
     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
     name: { type: String, required: true, trim: true, maxlength: 80 },
     age: { type: Number, required: true, min: 16, max: 100 },
     bio: { type: String, trim: true, maxlength: 1000, default: '' },
     languages: { type: [String], default: [] },
     skills: { type: [String], default: [] },
     videos: { type: [videoSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);