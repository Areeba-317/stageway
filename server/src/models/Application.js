const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
     vacancy: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy', required: true },
     actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
     note: { type: String, trim: true, maxlength: 500, default: '' },
}, { timestamps: true });

// One application per actor per vacancy, enforced by the database
applicationSchema.index({ vacancy: 1, actor: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);