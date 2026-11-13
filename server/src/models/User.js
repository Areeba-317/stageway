const mongoose = require('mongoose');

// Must match the roles on the frontend RoleCards. Ask Areeba and edit this list.
const ROLES = ['actor', 'director'];

const userSchema = new mongoose.Schema({
     fullName: { type: String, required: true, trim: true },
     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
     phone: { type: String, required: true, unique: true, trim: true },
     passwordHash: { type: String, required: true, select: false },
     role: { type: String, enum: ROLES, required: true },
     isVerified: { type: Boolean, default: false },
     otpHash: { type: String, select: false },
     otpExpiresAt: Date,
     otpAttempts: { type: Number, default: 0 },
     otpLastSentAt: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
User.ROLES = ROLES;
module.exports = User;