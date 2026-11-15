const mongoose = require('mongoose');
const Vacancy = require('../models/Vacancy');

const FIELDS = ['title', 'description', 'roleType', 'gender', 'ageMin', 'ageMax',
     'tone', 'location', 'compensation', 'deadline'];

const pick = (body) => {
     const o = FIELDS.reduce((acc, k) => (body[k] !== undefined ? { ...acc, [k]: body[k] } : acc), {});
     if (typeof o.tone === 'string') {
          o.tone = o.tone.trim().toLowerCase();
          if (!o.tone) delete o.tone;
     }
     return o;
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function validate(data, partial = false) {
     if (!partial || data.title !== undefined)
          if (typeof data.title !== 'string' || !data.title.trim()) return 'Title is required';
     if (!partial || data.description !== undefined)
          if (typeof data.description !== 'string' || !data.description.trim()) return 'Description is required';
     if (data.ageMin != null && data.ageMax != null && Number(data.ageMin) > Number(data.ageMax))
          return 'Minimum age cannot be greater than maximum age';
     if (data.tone && !Vacancy.TONES.includes(data.tone))
          return `Tone must be one of: ${Vacancy.TONES.join(', ')}`;
     if (data.deadline && (isNaN(new Date(data.deadline)) || new Date(data.deadline) < new Date()))
          return 'Deadline must be a valid future date';
     return null;
}

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

// GET /api/vacancies/:id  (open ones for everyone, any status for the owner)
exports.getOne = async (req, res) => {
     if (!mongoose.isValidObjectId(req.params.id))
          return res.status(400).json({ message: 'Invalid vacancy id' });
     const v = await Vacancy.findById(req.params.id).populate('director', 'fullName').lean();
     if (!v) return res.status(404).json({ message: 'Vacancy not found' });
     const isOwner = String(v.director?._id) === String(req.user._id);
     const expired = v.deadline && new Date(v.deadline) < new Date();
     if (!isOwner && (v.status !== 'open' || expired))
          return res.status(404).json({ message: 'Vacancy not found' });
     res.json({ vacancy: v });
};

// GET /api/vacancies?q=&gender=&ageMin=&ageMax=&tone=&page=&limit=
exports.listOpen = async (req, res) => {
     const { q, gender, tone } = req.query;
     const page = Math.max(parseInt(req.query.page) || 1, 1);
     const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

     const num = (v) => (v === undefined || v === '' ? null : Number(v));
     const minAge = num(req.query.ageMin);
     const maxAge = num(req.query.ageMax);
     if ((minAge !== null && isNaN(minAge)) || (maxAge !== null && isNaN(maxAge)))
          return res.status(400).json({ message: 'Age filters must be numbers' });
     if (minAge !== null && maxAge !== null && minAge > maxAge)
          return res.status(400).json({ message: 'ageMin cannot be greater than ageMax' });
     if (gender && !['any', 'male', 'female'].includes(gender))
          return res.status(400).json({ message: 'gender must be any, male or female' });

     const and = [
          { status: 'open' },
          { $or: [{ deadline: null }, { deadline: { $gt: new Date() } }] }, // hides expired
     ];
     if (q && String(q).trim()) {
          const rx = new RegExp(escapeRegex(String(q).trim().slice(0, 100)), 'i');
          and.push({ $or: [{ title: rx }, { description: rx }, { roleType: rx }, { location: rx }] });
     }
     if (gender && gender !== 'any') and.push({ gender: { $in: [gender, 'any'] } });
     // Age range overlap: a missing vacancy age means "no limit"
     if (maxAge !== null) and.push({ $or: [{ ageMin: null }, { ageMin: { $lte: maxAge } }] });
     if (minAge !== null) and.push({ $or: [{ ageMax: null }, { ageMax: { $gte: minAge } }] });
     if (tone) and.push({ tone: String(tone).toLowerCase() });

     const filter = { $and: and };
     const [total, vacancies] = await Promise.all([
          Vacancy.countDocuments(filter),
          Vacancy.find(filter)
               .populate('director', 'fullName')
               .sort({ createdAt: -1, _id: -1 })
               .skip((page - 1) * limit)
               .limit(limit)
               .lean(),
     ]);

     res.json({ vacancies, page, limit, total, totalPages: Math.ceil(total / limit) });
};