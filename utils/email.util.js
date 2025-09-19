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

const sendInvitationEmail = async(toEmail, password) => {
  const mailOptions = {
    from: `${process.env.EMAIL_USER}`,
    to: toEmail,
    subject: 'Invitation à rejoindre TakeIt',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 40px 0;">
        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 32px;">
          <h2 style="color: #2d3748; text-align: center; margin-bottom: 16px;">Bienvenue sur TakeIt !</h2>
          <p style="color: #4a5568; font-size: 16px; text-align: center; margin-bottom: 24px;">
            Vous avez été invité(e) à rejoindre la plateforme <strong>TakeIt</strong>.
          </p>
          <div style="background: #f1f5fb; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
            <span style="color: #718096;">Votre email de connexion :</span>
            <div style="font-size: 16px; font-weight: bold; color: #2563eb; margin-top: 4px;">${toEmail}</div>
            <span style="color: #718096; display: block; margin-top: 12px;">Votre mot de passe provisoire :</span>
            <div style="font-size: 20px; font-weight: bold; color: #2563eb; margin-top: 8px;">${password}</div>
          </div>
          <p style="color: #4a5568; font-size: 15px; text-align: center;">
            Veuillez vous connecter avec votre email et ce mot de passe, puis le modifier après votre première connexion.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 16px 0;">
          <p style="color: #a0aec0; font-size: 13px; text-align: center;">
            Merci,<br>L'équipe TakeIt
          </p>
        </div>
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
