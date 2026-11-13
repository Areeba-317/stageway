const mongoose = require('mongoose');
const Vacancy = require('../models/Vacancy');

// Only these fields can be set by the client
const FIELDS = ['title', 'description', 'roleType', 'gender', 'ageMin', 'ageMax',
     'location', 'compensation', 'deadline'];

const pick = (body) =>
     FIELDS.reduce((o, k) => (body[k] !== undefined ? { ...o, [k]: body[k] } : o), {});

function validate(data, partial = false) {
     if (!partial || data.title !== undefined)
          if (typeof data.title !== 'string' || !data.title.trim()) return 'Title is required';
     if (!partial || data.description !== undefined)
          if (typeof data.description !== 'string' || !data.description.trim()) return 'Description is required';
     if (data.ageMin != null && data.ageMax != null && Number(data.ageMin) > Number(data.ageMax))
          return 'Minimum age cannot be greater than maximum age';
     if (data.deadline && (isNaN(new Date(data.deadline)) || new Date(data.deadline) < new Date()))
          return 'Deadline must be a valid future date';
     return null;
}

// Loads a vacancy and confirms the logged-in director owns it
async function getOwned(req, res) {
     if (!mongoose.isValidObjectId(req.params.id)) {
          res.status(400).json({ message: 'Invalid vacancy id' });
          return null;
     }
     const v = await Vacancy.findById(req.params.id);
     if (!v) { res.status(404).json({ message: 'Vacancy not found' }); return null; }
     if (String(v.director) !== String(req.user._id)) {
          res.status(403).json({ message: 'You can only change your own vacancies' });
          return null;
     }
     return v;
}

// POST /api/vacancies
exports.create = async (req, res) => {
     const data = pick(req.body);
     const error = validate(data);
     if (error) return res.status(400).json({ message: error });

     const vacancy = await Vacancy.create({ ...data, director: req.user._id });
     res.status(201).json({ message: 'Vacancy posted', vacancy });
};

// GET /api/vacancies/mine
exports.mine = async (req, res) => {
     const vacancies = await Vacancy.find({ director: req.user._id }).sort({ createdAt: -1 });
     res.json({ vacancies });
};

// PUT /api/vacancies/:id
exports.update = async (req, res) => {
     const v = await getOwned(req, res);
     if (!v) return;
     if (v.status === 'closed')
          return res.status(400).json({ message: 'Closed vacancies cannot be edited' });

     const data = pick(req.body);
     const error = validate(data, true);
     if (error) return res.status(400).json({ message: error });

     Object.assign(v, data);
     await v.save();
     res.json({ message: 'Vacancy updated', vacancy: v });
};

// PATCH /api/vacancies/:id/close
exports.close = async (req, res) => {
     const v = await getOwned(req, res);
     if (!v) return;
     if (v.status === 'closed')
          return res.status(400).json({ message: 'Vacancy is already closed' });

     v.status = 'closed';
     v.closedAt = new Date();
     await v.save();
     res.json({ message: 'Vacancy closed', vacancy: v });
};

// GET /api/vacancies  (any logged-in user: browse open vacancies)
exports.listOpen = async (req, res) => {
     const vacancies = await Vacancy.find({ status: 'open' })
          .populate('director', 'fullName')
          .sort({ createdAt: -1 });
     res.json({ vacancies });
};