const mongoose = require('mongoose');

const vacancySchema = new mongoose.Schema({
     director: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
     title: { type: String, required: true, trim: true, maxlength: 120 },
     description: { type: String, required: true, trim: true, maxlength: 3000 },
     roleType: { type: String, trim: true },
     gender: { type: String, enum: ['any', 'male', 'female'], default: 'any' },
     ageMin: { type: Number, min: 0, max: 120 },
     ageMax: { type: Number, min: 0, max: 120 },
     location: { type: String, trim: true },
     compensation: { type: String, trim: true },
     deadline: { type: Date },
     status: { type: String, enum: ['open', 'closed'], default: 'open' },
     closedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Vacancy', vacancySchema);