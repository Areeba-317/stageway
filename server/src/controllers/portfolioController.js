const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio');
const { UPLOAD_DIR, MAX_SIZE } = require('../middleware/upload');

const MAX_VIDEOS = 3;
const MAX_SECONDS = 90;

const removeFile = (filename) =>
     fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(filename))).catch(() => { });

// Accepts an array or a comma-separated string
function cleanList(v, maxItems, label) {
     const arr = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : null;
     if (!arr) return { error: `${label} must be a list` };
     const out = [...new Set(arr.map((x) => String(x).trim()).filter(Boolean))];
     if (out.length > maxItems) return { error: `${label}: maximum ${maxItems} items` };
     if (out.some((x) => x.length > 40)) return { error: `${label}: each item must be 40 characters or fewer` };
     return { value: out };
}

function parse(body, partial) {
     const data = {};
     if (!partial || body.name !== undefined) {
          if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 80)
               return { error: 'Name is required (max 80 characters)' };
          data.name = body.name.trim();
     }
     if (!partial || body.age !== undefined) {
          const age = Number(body.age);
          if (!Number.isInteger(age) || age < 16 || age > 100)
               return { error: 'Age must be a whole number between 16 and 100' };
          data.age = age;
     }
     if (body.bio !== undefined) {
          if (typeof body.bio !== 'string' || body.bio.length > 1000)
               return { error: 'Bio must be text of 1000 characters or fewer' };
          data.bio = body.bio.trim();
     }
     if (body.languages !== undefined) {
          const r = cleanList(body.languages, 10, 'Languages');
          if (r.error) return r;
          data.languages = r.value;
     }
     if (body.skills !== undefined) {
          const r = cleanList(body.skills, 20, 'Skills');
          if (r.error) return r;
          data.skills = r.value;
     }
     return { data };
}

// GET /api/portfolio/me
exports.getMine = async (req, res) => {
     const portfolio = await Portfolio.findOne({ user: req.user._id });
     if (!portfolio) return res.status(404).json({ message: 'You have not created a portfolio yet' });
     res.json({ portfolio });
};

// POST /api/portfolio
exports.create = async (req, res) => {
     const { data, error } = parse(req.body, false);
     if (error) return res.status(400).json({ message: error });
     if (await Portfolio.exists({ user: req.user._id }))
          return res.status(409).json({ message: 'You already have a portfolio. Edit it instead.' });
     const portfolio = await Portfolio.create({ ...data, user: req.user._id });
     res.status(201).json({ message: 'Portfolio created', portfolio });
};

// PUT /api/portfolio
exports.update = async (req, res) => {
     const portfolio = await Portfolio.findOne({ user: req.user._id });
     if (!portfolio) return res.status(404).json({ message: 'Create your portfolio first' });
     const { data, error } = parse(req.body, true);
     if (error) return res.status(400).json({ message: error });
     Object.assign(portfolio, data);
     await portfolio.save();
     res.json({ message: 'Portfolio updated', portfolio });
};

// DELETE /api/portfolio
exports.remove = async (req, res) => {
     const portfolio = await Portfolio.findOne({ user: req.user._id });
     if (!portfolio) return res.status(404).json({ message: 'No portfolio to delete' });
     await Promise.all(portfolio.videos.map((v) => removeFile(v.filename)));
     await portfolio.deleteOne();
     res.json({ message: 'Portfolio deleted' });
};

// POST /api/portfolio/videos   (multipart/form-data, field name "video")
exports.addVideo = async (req, res) => {
     const file = req.file;
     if (!file) return res.status(400).json({ message: 'No video received. Send it in the "video" field.' });
     const reject = async (status, message) => { await removeFile(file.filename); return res.status(status).json({ message }); };

     const portfolio = await Portfolio.findOne({ user: req.user._id });
     if (!portfolio) return reject(400, 'Create your portfolio before uploading videos');
     if (portfolio.videos.length >= MAX_VIDEOS)
          return reject(400, `You can upload at most ${MAX_VIDEOS} videos. Delete one first.`);

     // Read the real length from the file itself (also rejects fake or corrupt files)
     let duration;
     try {
          const { parseFile } = await import('music-metadata');
          const meta = await parseFile(file.path, { duration: true });
          duration = meta.format.duration;
     } catch {
          return reject(400, 'Could not read this video. The file may be corrupt.');
     }
     if (!duration) return reject(400, 'Could not read the video length');
     if (duration > MAX_SECONDS) return reject(400, `Video must be ${MAX_SECONDS} seconds or shorter`);

     portfolio.videos.push({
          url: `/uploads/${file.filename}`,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          duration: Math.round(duration * 10) / 10,
     });
     await portfolio.save();
     res.status(201).json({ message: 'Video uploaded', video: portfolio.videos[portfolio.videos.length - 1] });
};

// DELETE /api/portfolio/videos/:videoId
exports.removeVideo = async (req, res) => {
     const portfolio = await Portfolio.findOne({ user: req.user._id });
     const video = portfolio && mongoose.isValidObjectId(req.params.videoId)
          ? portfolio.videos.id(req.params.videoId) : null;
     if (!video) return res.status(404).json({ message: 'Video not found' });
     await removeFile(video.filename);
     portfolio.videos.pull(req.params.videoId);
     await portfolio.save();
     res.json({ message: 'Video deleted' });
};

// GET /api/portfolio/:userId   (directors viewing an actor)
exports.getByUser = async (req, res) => {
     if (!mongoose.isValidObjectId(req.params.userId))
          return res.status(400).json({ message: 'Invalid user id' });
     const portfolio = await Portfolio.findOne({ user: req.params.userId });
     if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });
     res.json({ portfolio });
};

exports.limits = { MAX_VIDEOS, MAX_SECONDS, MAX_SIZE };