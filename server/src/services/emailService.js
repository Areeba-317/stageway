const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

exports.sendOtpEmail = async (to, code) => {
     try {
          await transporter.sendMail({
               from: `"StageWay" <${process.env.EMAIL_USER}>`,
               to,
               subject: 'Your StageWay verification code',
               text: `Your StageWay verification code is ${code}. It expires in 5 minutes. If you did not request this, ignore this email.`,
          });
     } catch (err) {
          console.error('Email failed:', err.message);
          console.log(`OTP for ${to}: ${code}`); // fallback so the demo never gets stuck
     }
};