const mongoose = require('mongoose');
const Vacancy = require('../models/Vacancy');
const Application = require('../models/Application');
const Portfolio = require('../models/Portfolio');
const { shape } = require('./portfolioController');

// POST /api/applications   body { vacancyId, note }
exports.create = async (req, res) => {
     const { vacancyId, note } = req.body;
     if (!mongoose.isValidObjectId(vacancyId))
          return res.status(400).json({ message: 'A valid vacancyId is required' });

     const v = await Vacancy.findById(vacancyId);
     if (!v) return res.status(404).json({ message: 'Vacancy not found' });
     if (v.status !== 'open' || (v.deadline && v.deadline < new Date()))
          return res.status(400).json({ message: 'This vacancy is no longer open' });

     // A portfolio can only exist with a name and age, so this means "profile completed"
     if (!(await Portfolio.exists({ user: req.user._id })))
          return res.status(400).json({ message: 'Fill in your portfolio before applying' });

     if (await Application.exists({ vacancy: v._id, actor: req.user._id }))
          return res.status(409).json({ message: 'You already applied to this vacancy' });

     const cleanNote = typeof note === 'string' ? note.trim() : '';
     if (cleanNote.length > 500)
          return res.status(400).json({ message: 'Note must be 500 characters or fewer' });

     await Application.create({ vacancy: v._id, actor: req.user._id, note: cleanNote });
     res.status(201).json({ message: 'Application sent' });
};

// GET /api/applications/mine   (actor)
exports.mine = async (req, res) => {
     const applications = await Application.find({ actor: req.user._id })
          .populate('vacancy', 'title status deadline location tone')
          .sort({ createdAt: -1 });
     res.json({ applications });
};

// GET /api/vacancies/:id/applications   (director who owns the vacancy)
exports.forVacancy = async (req, res) => {
     if (!mongoose.isValidObjectId(req.params.id))
          return res.status(400).json({ message: 'Invalid vacancy id' });
     const v = await Vacancy.findById(req.params.id);
     if (!v) return res.status(404).json({ message: 'Vacancy not found' });
     if (String(v.director) !== String(req.user._id))
          return res.status(403).json({ message: 'You can only view applications for your own vacancies' });

     const apps = (await Application.find({ vacancy: v._id })
          .populate('actor', 'fullName email phone')
          .sort({ createdAt: -1 })
          .lean()).filter((a) => a.actor);

     const portfolios = await Portfolio.find({ user: { $in: apps.map((a) => a.actor._id) } });
     const byUser = new Map(portfolios.map((p) => [String(p.user), shape(p)]));

     res.json({
          applications: apps.map((a) => ({
               _id: a._id,
               note: a.note,
               createdAt: a.createdAt,
               actor: a.actor,
               portfolio: byUser.get(String(a.actor._id)) || null,
          })),
     });
};