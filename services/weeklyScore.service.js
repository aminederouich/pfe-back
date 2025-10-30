const { collection, getDocs, query, where } = require('firebase/firestore');
const { db } = require('../config/firebase');
const User = require('../models/user.model');
const { sendWeeklyLeaderboardEmail } = require('../utils/email.util');
const cron = require('node-cron');
const WeeklyTopScores = require('../models/WeeklyTopScores.model');

const SUNDAY_OFFSET = -6; // décalage pour que lundi soit le début de la semaine
const TOP_USER_COUNT = 3; // Nombre d'utilisateurs à sélectionner pour le top
const WEEK_LENGTH_DAYS = 6; // nombre de jours à ajouter pour fin de semaine (lundi +6 => dimanche)


// Fonction utilitaire pour obtenir la date du début de la semaine
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? SUNDAY_OFFSET : 1); // Lundi comme début de semaine
  return new Date(d.setDate(diff));
}

// Fonction principale pour récupérer les scores et envoyer les mails
async function processWeeklyTopScores() {
  const { startOfWeek, endOfWeek } = computeWeekBounds();
  const scores = await fetchWeekScores(startOfWeek);
  const userScores = aggregateScores(scores);
  if (Object.keys(userScores).length === 0) {
    return { leaderboard: [], sent: 0 };
  }
  const leaderboard = await buildLeaderboard(userScores);
  const allUsers = await fetchAllUsers();
  const sent = await sendLeaderboardEmails({ allUsers, userScores, leaderboard, startOfWeek, endOfWeek });
  return { leaderboard, sent };
}

function computeWeekBounds() {
  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + WEEK_LENGTH_DAYS);
  return { startOfWeek, endOfWeek };
}

async function fetchWeekScores(startOfWeek) {
  const scoreQuery = query(
    collection(db, 'ticketScores'),
    where('dateAffection', '>=', startOfWeek),
  );
  const snapshot = await getDocs(scoreQuery);
  return snapshot.docs.map(doc => doc.data());
}

function aggregateScores(scores) {
  return scores.reduce((acc, s) => {
    if (!s.ownerId) {
      return acc;
    }
    acc[s.ownerId] = (acc[s.ownerId] || 0) + (s.score || 0);
    return acc;
  }, {});
}

async function buildLeaderboard(userScores) {
  const topUsersRaw = Object.entries(userScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_USER_COUNT);
  const leaderboard = [];
  for (let i = 0; i < topUsersRaw.length; i++) {
    const [ownerId, score] = topUsersRaw[i];
    const user = await User.findByjiraId(ownerId);
    leaderboard.push({
      rank: i + 1,
      email: user?.email || ownerId,
      id: user?.id || ownerId,
      name: user?.firstName || user?.displayName || user?.email || ownerId,
      score,
    });
  }
  return leaderboard;
}

async function fetchAllUsers() {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  if (!usersSnapshot || !Array.isArray(usersSnapshot.docs)) {
    return [];
  }
  return usersSnapshot.docs.map(doc => doc.data()).filter(u => u.email);
}

async function sendLeaderboardEmails({ allUsers, userScores, leaderboard, startOfWeek, endOfWeek }) {
  // Persist weekly leaderboard snapshot (best-effort: should not break the whole weekly process)
  await WeeklyTopScores.create({
    id: startOfWeek.toISOString().slice(0, 10).replace(/-/g, ''),
    startOfWeek,
    endOfWeek,
    leaderboard,
  }).catch(() => null); // Silently ignore persistence issues in this context
  let sent = 0;
  for (const rawUser of allUsers) {
    const user = new User(rawUser);
    const personalScore = userScores[user.jiraId] || 0;
    try {
      await sendWeeklyLeaderboardEmail({
        user,
        leaderboard,
        userScore: personalScore,
        weekStart: startOfWeek,
        weekEnd: endOfWeek,
      });
      sent++;
    } catch {
      // Erreur individuelle ignorée volontairement
    }
  }
  return sent;
}

// Planification : chaque dimanche à 23h59 '59 23 * * 0'
// Cron: chaque dimanche à 23h59 (UTC serveur) -> '59 23 * * 0'
// Ajuster selon fuseau; placeholder précédent remplacé.
cron.schedule('35 11 12 * * *', () => {
  processWeeklyTopScores().catch(() => null);
});
module.exports = { processWeeklyTopScores };
