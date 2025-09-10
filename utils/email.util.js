const nodemailer = require('nodemailer');
require('dotenv').config();

// Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail service
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail app password (not regular password)
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendInvitationEmail = async(toEmail, firstName) => {
  const mailOptions = {
    from: `${process.env.EMAIL_USER}`,
    to: toEmail,
    subject: 'Invitation à rejoindre TakeIt',
    html: `
      <div style="font-family:Arial,sans-serif;">
        <h2>Bonjour ${firstName},</h2>
        <p>Vous êtes invité(e) à rejoindre la plateforme <strong>TakeIt</strong>.</p>
        <p>Cliquez ci-dessous pour définir votre mot de passe :</p>
        <a href="http://localhost:3000/reset-password?email=${toEmail}" style="padding:10px 15px; background-color:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
          Définir mon mot de passe
        </a>
        <p>Merci,<br>L'équipe TakeIt</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendScoreEmail = async(user, score) => {
  const mailOptions = {
    from: `${process.env.EMAIL_USER}`,
    to: user.email,
    subject: 'Votre score hebdomadaire sur TakeIt',
    html: `
      <div style="font-family:Arial,sans-serif;">
        <h2>Bonjour ${user.firstName},</h2>
        <p>Voici votre score hebdomadaire sur <strong>TakeIt</strong> :</p>
        <p><strong>${score}</strong></p>
        <p>Merci,<br>L'équipe TakeIt</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendInvitationEmail,
  sendScoreEmail,
};
