const { collection, getDocs, query, where } = require('firebase/firestore');
const { db } = require('../config/firebase');
const User = require('../models/user.model');
const sendEmail = require('../utils/email.util');
const cron = require('node-cron');

const SUNDAY_OFFSET = -6; // décalage pour que lundi soit le début de la semaine
const TOP_USER_COUNT = 3; // Nombre d'utilisateurs à sélectionner pour le top


// Fonction utilitaire pour obtenir la date du début de la semaine
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? SUNDAY_OFFSET : 1); // Lundi comme début de semaine
  return new Date(d.setDate(diff));
}

// Fonction principale pour récupérer les scores et envoyer les mails
async function processWeeklyTopScores() {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  // Récupérer tous les scores de la semaine
  const scoreQuery = query(
    collection(db, 'ticketScores'),
    where('dateAffection', '>=', startOfWeek),
  );
  const snapshot = await getDocs(scoreQuery);
  const scores = snapshot.docs.map(doc => doc.data());

  // Agréger les scores par userId
  const userScores = {};
  for (const score of scores) {
    if (!userScores[score.ownerId]) {
      userScores[score.ownerId] = 0;
    }
    userScores[score.ownerId] += score.score || 0;
  }

  // Trouver le top 3
  const topUsers = Object.entries(userScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_USER_COUNT);

  // Récupérer les emails des utilisateurs
  for (const [ownerId, score] of topUsers) {
    // On suppose que User.getUserById existe et retourne un objet avec un email
    const user = await User.findByUid(ownerId);
    if (user && user.email) {
      sendEmail.sendScoreEmail(user, score);
    }
  }
}

// Planification : chaque dimanche à 23h59 '59 23 * * 0'
cron.schedule('59 23 * * 0', () => {
  processWeeklyTopScores().catch();
});
module.exports = { processWeeklyTopScores };
