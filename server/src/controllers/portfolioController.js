const mongoose = require('mongoose');
const crypto = require('crypto');
const Portfolio = require('../models/Portfolio');
const { TYPES } = require('../middleware/upload');
const r2 = require('../services/r2');

const MAX_VIDEOS = 3;
const MAX_SECONDS = 30;

// The exact shape from the contract
const shape = (p) => ({
     bio: p.bio || '',
     age: p.age ?? null,
     languages: p.languages || [],
     skills: p.skills || [],
     videos: (p.videos || []).map((v) => ({ _id: v._id, url: v.url, name: v.name })),
});
const EMPTY = { bio: '', age: null, languages: [], skills: [], videos: [] };

function cleanList(v, maxItems, label) {
     const arr = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : null;
     if (!arr) return { error: `${label} must be a list` };
     const out = [...new Set(arr.map((x) => String(x).trim()).filter(Boolean))];
     if (out.length > maxItems) return { error: `${label}: maximum ${maxItems} items` };
     if (out.some((x) => x.length > 40)) return { error: `${label}: each item must be 40 characters or fewer` };
     return { value: out };
}

// GET /api/portfolio/me  (an empty portfolio if none saved yet)
exports.getMine = async (req, res) => {
     const p = await Portfolio.findOne({ user: req.user._id });
     res.json({ portfolio: p ? shape(p) : EMPTY });
};

// PUT /api/portfolio/me   body { bio, age, languages[], skills[], name? }
// Creates the portfolio the first time (age is required then)
exports.update = async (req, res) => {
     const { name, bio, age, languages, skills } = req.body;
     const p = (await Portfolio.findOne({ user: req.user._id }))
          || new Portfolio({ user: req.user._id, name: req.user.fullName });

     if (name !== undefined) {
          if (typeof name !== 'string' || !name.trim() || name.trim().length > 80)
               return res.status(400).json({ message: 'Name is required (max 80 characters)' });
          p.name = name.trim();
     }
     if (bio !== undefined) {
          if (typeof bio !== 'string' || bio.length > 1000)
               return res.status(400).json({ message: 'Bio must be text of 1000 characters or fewer' });
          p.bio = bio.trim();
     }
     if (age !== undefined && age !== null && age !== '') {
          const n = Number(age);
          if (!Number.isInteger(n) || n < 16 || n > 100)
               return res.status(400).json({ message: 'Age must be a whole number between 16 and 100' });
          p.age = n;
     }
     if (languages !== undefined) {
          const r = cleanList(languages, 10, 'Languages');
          if (r.error) return res.status(400).json({ message: r.error });
          p.languages = r.value;
     }
     if (skills !== undefined) {
          const r = cleanList(skills, 20, 'Skills');
          if (r.error) return res.status(400).json({ message: r.error });
          p.skills = r.value;
     }

     if (p.age == null)
          return res.status(400).json({ message: 'Age is required' });

     await p.save();
     res.json({ portfolio: shape(p) });
};

// POST /api/portfolio/me/videos   multipart field "video"
exports.addVideo = async (req, res) => {
     const file = req.file;
     if (!file) return res.status(400).json({ message: 'No video received. Send it in the "video" field.' });

     const p = await Portfolio.findOne({ user: req.user._id });
     if (!p)
          return res.status(400).json({ message: 'Save your profile (with your age) before uploading videos' });
     if (p.videos.length >= MAX_VIDEOS)
          return res.status(400).json({ message: `You can upload at most ${MAX_VIDEOS} videos. Delete one first.` });

     // Read the real length from the file itself (also rejects fake or corrupt files)
     let duration;
     try {
          const { parseBuffer } = await import('music-metadata');
          const meta = await parseBuffer(file.buffer, { mimeType: file.mimetype }, { duration: true });
          duration = meta.format.duration;
     } catch {
          return res.status(400).json({ message: 'Could not read this video. The file may be corrupt.' });
     }
     if (!duration) return res.status(400).json({ message: 'Could not read the video length' });
     if (duration > MAX_SECONDS)
          return res.status(400).json({ message: `Video must be ${MAX_SECONDS} seconds or shorter` });

     const key = `portfolios/${req.user._id}/${crypto.randomBytes(16).toString('hex')}${TYPES[file.mimetype]}`;
     const url = await r2.uploadVideo(key, file.buffer, file.mimetype);

     try {
          p.videos.push({
               url, key, name: file.originalname.slice(0, 100),
               mimetype: file.mimetype, size: file.size, duration: Math.round(duration * 10) / 10,
          });
          await p.save();
     } catch (err) {
          await r2.deleteVideo(key).catch(() => { }); // don't leave an orphan file in R2
          throw err;
     }
     res.status(201).json({ portfolio: shape(p) });
};

// DELETE /api/portfolio/me/videos/:videoId
exports.removeVideo = async (req, res) => {
     const p = await Portfolio.findOne({ user: req.user._id });
     const video = p && mongoose.isValidObjectId(req.params.videoId) ? p.videos.id(req.params.videoId) : null;
     if (!video) return res.status(404).json({ message: 'Video not found' });

     await r2.deleteVideo(video.key).catch((e) => console.error('R2 delete failed:', e.message));
     p.videos.pull(req.params.videoId);
     await p.save();
     res.json({ portfolio: shape(p) });
};

// GET /api/portfolio/:userId   (directors viewing an actor)
exports.getByUser = async (req, res) => {
     if (!mongoose.isValidObjectId(req.params.userId))
          return res.status(400).json({ message: 'Invalid user id' });
     const p = await Portfolio.findOne({ user: req.params.userId });
     if (!p) return res.status(404).json({ message: 'Portfolio not found' });
     res.json({ portfolio: shape(p) });
};

exports.shape = shape;
exports.EMPTY = EMPTY;