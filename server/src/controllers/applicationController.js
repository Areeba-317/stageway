const mongoose = require('mongoose');
const Vacancy = require('../models/Vacancy');
const Application = require('../models/Application');
const Portfolio = require('../models/Portfolio');

// POST /api/vacancies/:id/apply   body: { note? }
exports.apply = async (req, res) => {
     if (!mongoose.isValidObjectId(req.params.id))
          return res.status(400).json({ message: 'Invalid vacancy id' });
     const v = await Vacancy.findById(req.params.id);
     if (!v) return res.status(404).json({ message: 'Vacancy not found' });
     if (v.status !== 'open' || (v.deadline && v.deadline < new Date()))
          return res.status(400).json({ message: 'This vacancy is no longer open' });

     // Remove this check if actors may apply without a portfolio
     if (!(await Portfolio.exists({ user: req.user._id })))
          return res.status(400).json({ message: 'Create your portfolio before applying' });

     if (await Application.exists({ vacancy: v._id, actor: req.user._id }))
          return res.status(409).json({ message: 'You already applied to this vacancy' });

     const note = typeof req.body.note === 'string' ? req.body.note.trim() : '';
     if (note.length > 500) return res.status(400).json({ message: 'Note must be 500 characters or fewer' });

     const application = await Application.create({ vacancy: v._id, actor: req.user._id, note });
     res.status(201).json({ message: 'Application sent', application });
};

// GET /api/applications/mine
exports.mine = async (req, res) => {
     const applications = await Application.find({ actor: req.user._id })
          .populate('vacancy', 'title status deadline location tone')
          .sort({ createdAt: -1 });
     res.json({ applications });
};

// GET /api/vacancies/:id/applicants   (the director who owns the vacancy)
exports.applicants = async (req, res) => {
     if (!mongoose.isValidObjectId(req.params.id))
          return res.status(400).json({ message: 'Invalid vacancy id' });
     const v = await Vacancy.findById(req.params.id);
     if (!v) return res.status(404).json({ message: 'Vacancy not found' });
     if (String(v.director) !== String(req.user._id))
          return res.status(403).json({ message: 'You can only view applicants of your own vacancies' });

     const apps = (await Application.find({ vacancy: v._id })
          .populate('actor', 'fullName email phone')
          .sort({ createdAt: -1 })
          .lean()).filter((a) => a.actor);

     const portfolios = await Portfolio.find({ user: { $in: apps.map((a) => a.actor._id) } }).lean();
     const byUser = new Map(portfolios.map((p) => [String(p.user), p]));

     res.json({
          vacancy: { id: v._id, title: v.title, status: v.status },
          count: apps.length,
          applicants: apps.map((a) => ({
               applicationId: a._id,
               appliedAt: a.createdAt,
               note: a.note,
               actor: a.actor,
               portfolio: byUser.get(String(a.actor._id)) || null,
          })),
     });
};