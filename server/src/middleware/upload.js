const multer = require('multer');

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const TYPES = { 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov' };

const upload = multer({
     storage: multer.memoryStorage(),
     limits: { fileSize: MAX_SIZE, files: 1 },
     fileFilter: (req, file, cb) => {
          if (TYPES[file.mimetype]) return cb(null, true);
          const err = new Error('Only MP4, WebM or MOV videos are allowed');
          err.name = 'UploadError';
          cb(err);
     },
});

module.exports = { upload, TYPES, MAX_SIZE };