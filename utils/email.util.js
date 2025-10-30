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

/**
 * Envoie l'email du classement hebdomadaire à un utilisateur.
 * @param {Object} user - Objet utilisateur contenant au moins email et firstName
 * @param {Array<{rank:number,name:string,score:number}>} leaderboard - Top 3 utilisateurs
 * @param {number} userScore - Score hebdomadaire de l'utilisateur courant
 * @param {Date} weekStart - Date de début de semaine
 * @param {Date} weekEnd - Date de fin de semaine
 */
const sendWeeklyLeaderboardEmail = async({ user, leaderboard, userScore, weekStart, weekEnd }) => {
  const formatDate = d => (new Date(d)).toLocaleDateString('fr-FR');
  const period = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;

  const rows = leaderboard.map(item => `
      <tr style="background:#ffffff">
        <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;">${item.rank}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;">${item.name}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:600;color:#2563eb;">${item.score}</td>
      </tr>`).join('');

  const mailOptions = {
    from: `${process.env.EMAIL_USER}`,
    to: user.email,
    subject: `Classement hebdomadaire TakeIt (${period})`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f6f8fa;padding:32px 0;">
        <div style="max-width:640px;margin:auto;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.06);padding:32px;">
          <h2 style="margin:0 0 12px;color:#1a202c;font-size:22px;">Bonjour ${user.firstName || user.displayName || 'Utilisateur'}, 👋</h2>
          <p style="margin:0 0 20px;color:#4a5568;font-size:15px;">Voici le classement hebdomadaire pour la période <strong>${period}</strong>.</p>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
            <thead>
              <tr style="background:#2563eb;color:#fff;">
                <th style="padding:10px 12px;text-align:left;font-size:14px;">Rang</th>
                <th style="padding:10px 12px;text-align:left;font-size:14px;">Utilisateur</th>
                <th style="padding:10px 12px;text-align:right;font-size:14px;">Score</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="3" style="padding:16px;text-align:center;color:#718096;border:1px solid #e2e8f0;">Aucun score cette semaine</td></tr>'}
            </tbody>
          </table>
          <div style="background:#f1f5fb;padding:16px;border-radius:8px;margin-bottom:24px;">
            <p style="margin:0;color:#2d3748;font-size:15px;">Votre score personnel cette semaine :</p>
            <p style="margin:8px 0 0;font-size:26px;font-weight:700;color:#2563eb;">${userScore}</p>
          </div>
          <p style="margin:0 0 8px;color:#4a5568;font-size:14px;">Continuez vos efforts pour grimper dans le classement ! 💪</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
          <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">Cet email est envoyé automatiquement par TakeIt.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendInvitationEmail,
  sendScoreEmail,
  sendWeeklyLeaderboardEmail,
};
