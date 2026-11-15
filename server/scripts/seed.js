require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Vacancy = require('../src/models/Vacancy');

// These exist only after Part 3, so the script works before and after
const optional = (p) => { try { return require(p); } catch { return null; } };
const Portfolio = optional('../src/models/Portfolio');
const Application = optional('../src/models/Application');

const PASSWORD = 'password123';
const DAY = 24 * 60 * 60 * 1000;
const inDays = (n) => new Date(Date.now() + n * DAY);

const people = [
     { fullName: 'Sana Malik', email: 'sana.director@seed.stageway.test', phone: '+923000000001', role: 'director' },
     { fullName: 'Bilal Chaudhry', email: 'bilal.director@seed.stageway.test', phone: '+923000000002', role: 'director' },
     { fullName: 'Ayesha Khan', email: 'ayesha.actor@seed.stageway.test', phone: '+923000000003', role: 'actor' },
     { fullName: 'Hamza Raza', email: 'hamza.actor@seed.stageway.test', phone: '+923000000004', role: 'actor' },
     { fullName: 'Zainab Ahmed', email: 'zainab.actor@seed.stageway.test', phone: '+923000000005', role: 'actor' },
];

// d = which director (0 or 1), days = deadline from now
const vacancies = [
     {
          d: 0, days: 14, title: 'Overdramatic Uncle at a Wedding', roleType: 'Supporting', gender: 'male', ageMin: 45, ageMax: 60, tone: 'satire', location: 'Lahore', compensation: 'PKR 15,000 per day',
          description: 'A sketch about the uncle who cries louder than the bride. We need big energy, perfect timing and zero shame.'
     },
     {
          d: 1, days: 10, title: 'Chai Stall Philosopher', roleType: 'Lead', gender: 'any', ageMin: 25, ageMax: 60, tone: 'observational', location: 'Karachi', compensation: 'PKR 10,000 per day',
          description: 'A roadside chai seller who solves everyone\'s life problems in two minutes and overcharges them for it.'
     },
     {
          d: 0, days: 20, title: 'Sarcastic Grandmother', roleType: 'Lead', gender: 'female', ageMin: 55, ageMax: 75, tone: 'witty', location: 'Islamabad', compensation: 'PKR 20,000 per day',
          description: 'A grandmother who roasts the whole family at dinner without raising her voice. Dry delivery is a must.'
     },
     {
          d: 1, days: 7, title: 'Clumsy Wedding Photographer', roleType: 'Lead', gender: 'male', ageMin: 20, ageMax: 35, tone: 'slapstick', location: 'Lahore', compensation: 'PKR 12,000 per day',
          description: 'Everything that can go wrong at a shoot does. Physical comedy and comfort with falls (padded) required.'
     },
     {
          d: 0, days: 12, title: 'Over-Caffeinated Startup Founder', roleType: 'Lead', gender: 'any', ageMin: 25, ageMax: 40, tone: 'satire', location: 'Karachi', compensation: 'PKR 18,000 per day',
          description: 'Pitches a "Tinder for tea bags" to imaginary investors. Fast talker with excellent improv instincts.'
     },
     {
          d: 1, days: 9, title: 'Bride Who Lost Her Phone', roleType: 'Lead', gender: 'female', ageMin: 20, ageMax: 32, tone: 'slapstick', location: 'Lahore', compensation: 'PKR 14,000 per day',
          description: 'Ten minutes before the nikah, the phone is gone and so is her patience. Escalating panic, played for laughs.'
     },
     {
          d: 0, days: 16, title: 'Talking Rickshaw Driver', roleType: 'Supporting', gender: 'male', ageMin: 30, ageMax: 55, tone: 'absurd', location: 'Karachi', compensation: 'PKR 9,000 per day',
          description: 'A rickshaw driver who gives traffic advice to the universe. Surreal, fast, and very Karachi.'
     },
     {
          d: 1, days: 18, title: 'Funeral Caterer With Terrible Timing', roleType: 'Supporting', gender: 'any', ageMin: 30, ageMax: 50, tone: 'dark', location: 'Islamabad', compensation: 'PKR 16,000 per day',
          description: 'Dark comedy short. Awkward, deadpan, and always saying the wrong thing at the worst moment.'
     },
     {
          d: 0, days: 8, title: 'Exam Hall Invigilator', roleType: 'Cameo', gender: 'any', ageMin: 28, ageMax: 50, tone: 'observational', location: 'Lahore', compensation: 'Unpaid, credit and meals',
          description: 'Strict, suspicious and secretly writing his own answers. One-day shoot for a student film.'
     },
     {
          d: 1, days: 25, title: 'Kids Show Villain', roleType: 'Lead', gender: 'any', ageMin: 22, ageMax: 45, tone: 'family-friendly', location: 'Karachi', compensation: 'PKR 22,000 per day',
          description: 'A villain whose evil plans always fail because he keeps stopping to teach manners. Big voice, big gestures.'
     },
     // Hidden from browse on purpose, to demo the filtering
     {
          d: 0, days: 5, status: 'closed', title: 'Cricket Commentator Parody', roleType: 'Lead', gender: 'male', ageMin: 30, ageMax: 55, tone: 'witty', location: 'Lahore', compensation: 'PKR 13,000 per day',
          description: 'A commentator who gets more excited about the snacks than the match. (Closed.)'
     },
     {
          d: 1, days: -3, title: 'Eid Special Sketch Ensemble', roleType: 'Ensemble', gender: 'any', ageMin: 18, ageMax: 50, tone: 'family-friendly', location: 'Islamabad', compensation: 'PKR 8,000 per day',
          description: 'Ensemble for an Eid sketch show. (Deadline has passed.)'
     },
];

(async () => {
     await mongoose.connect(process.env.MONGO_URI);

     // Remove old seed data
     const old = await User.find({ email: /@seed\.stageway\.test$/ }).select('_id');
     const oldIds = old.map((u) => u._id);
     const oldVacs = await Vacancy.find({ director: { $in: oldIds } }).select('_id');
     const oldVacIds = oldVacs.map((v) => v._id);
     if (Application) await Application.deleteMany({ $or: [{ actor: { $in: oldIds } }, { vacancy: { $in: oldVacIds } }] });
     if (Portfolio) await Portfolio.deleteMany({ user: { $in: oldIds } });
     await Vacancy.deleteMany({ _id: { $in: oldVacIds } });
     await User.deleteMany({ _id: { $in: oldIds } });

     // Create users
     const passwordHash = await bcrypt.hash(PASSWORD, 10);
     const users = await User.insertMany(people.map((p) => ({ ...p, passwordHash, isVerified: true })));
     const directors = users.filter((u) => u.role === 'director');
     const actors = users.filter((u) => u.role === 'actor');

     // Create vacancies (insertMany skips the "future deadline" check, which is what we want here)
     const created = await Vacancy.insertMany(vacancies.map(({ d, days, ...v }) => ({
          ...v, director: directors[d]._id, deadline: inDays(days),
          ...(v.status === 'closed' && { closedAt: new Date() }),
     })));

     // Portfolios and sample applications (only after Part 3 exists)
     if (Portfolio) {
          await Portfolio.insertMany([
               { user: actors[0]._id, name: 'Ayesha Khan', age: 27, bio: 'Stage and sketch comedian from Lahore.', languages: ['Urdu', 'English', 'Punjabi'], skills: ['Improv', 'Mimicry', 'Stand-up'] },
               { user: actors[1]._id, name: 'Hamza Raza', age: 31, bio: 'Physical comedy and voice work.', languages: ['Urdu', 'English'], skills: ['Slapstick', 'Voice acting', 'Dance'] },
               { user: actors[2]._id, name: 'Zainab Ahmed', age: 24, bio: 'Drama student who is secretly funnier than she looks.', languages: ['Urdu', 'English', 'Sindhi'], skills: ['Improv', 'Singing'] },
          ]);
     }
     if (Application) {
          await Application.insertMany([
               { vacancy: created[0]._id, actor: actors[1]._id, note: 'I have been practicing wedding-uncle voices for years.' },
               { vacancy: created[3]._id, actor: actors[1]._id, note: 'Falling down is my specialty.' },
               { vacancy: created[3]._id, actor: actors[0]._id },
          ]);
     }

     console.log(`Seeded ${users.length} users and ${created.length} vacancies (${created.length - 2} visible in browse).`);
     console.log(`Password for all seed accounts: ${PASSWORD}`);
     people.forEach((p) => console.log(`  ${p.role.padEnd(8)} ${p.email}  ${p.phone}`));
     await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });