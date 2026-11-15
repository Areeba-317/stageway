const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const TYPES = { 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov' };

const storage = multer.diskStorage({
     destination: (req, file, cb) => cb(null, UPLOAD_DIR),
     filename: (req, file, cb) =>
          cb(null, crypto.randomBytes(16).toString('hex') + TYPES[file.mimetype]),
});

const upload = multer({
     storage,
     limits: { fileSize: MAX_SIZE, files: 1 },
     fileFilter: (req, file, cb) => {
          if (TYPES[file.mimetype]) return cb(null, true);
          const err = new Error('Only MP4, WebM or MOV videos are allowed');
          err.name = 'UploadError';
          cb(err);
     },
});

module.exports = { upload, UPLOAD_DIR, MAX_SIZE };