const HTTP_STATUS = require('../constants/httpStatus');
const authMiddleware = require('../middleware/auth');
const WeeklyTopScores = require('../models/WeeklyTopScores.model');
const WeeklyAllScores = require('../models/WeeklyAllScores.model');
const scoreModel = require('../models/score.model');
const User = require('../models/user.model');
const userModel = require('../models/user.model');
const { sendWeeklyLeaderboardEmail } = require('../utils/email.util');

const TOP_USER_COUNT = 3; // Nombre d'utilisateurs à sélectionner pour le top

/**
   * Récupérer tous les scores hebdomadaires
   */
exports.getAllWeeklyTopScores = [
  authMiddleware,
  async(req, res) => {
    try {
      const scores = await WeeklyTopScores.getAll();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: scores,
        message: 'Scores hebdomadaires récupérés avec succès',
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération des scores hebdomadaires',
      });
    }
  },
];

exports.getAllWeeklyScores = [
  authMiddleware,
  async(req, res) => {
    try {
      const scores = await WeeklyAllScores.getAll();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: scores,
        message: 'Scores hebdomadaires récupérés avec succès',
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération des scores hebdomadaires',
      });
    }
  },
];

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
    const user = await User.findByAccountId(ownerId);
    console.log(ownerId, 'Top user:', user);
    leaderboard.push({
      rank: i + 1,
      email: user?.email,
      id: user?.jiraId,
      name: user?.displayName,
      score,
    });
  }
  return leaderboard;
}
async function buildAllLeaderboard(userScores) {
  const topUsersRaw = Object.entries(userScores)
    .sort((a, b) => b[1] - a[1]);
  const leaderboard = [];
  for (let i = 0; i < topUsersRaw.length; i++) {
    const [ownerId, score] = topUsersRaw[i];
    const user = await User.findByAccountId(ownerId);
    leaderboard.push({
      rank: i + 1,
      email: user?.email,
      id: user?.jiraId,
      name: user?.displayName,
      score,
    });
  }
  return leaderboard;
}

async function sendLeaderboardEmails({ allUsers, userScores, leaderboard, startOfWeek, endOfWeek }) {
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
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email hebdomadaire à ${user.email}`, error);
    }
  }
  return sent;
}

exports.calculateweeklyscores = [
  authMiddleware,
  async(req, res) => {
    try {
      const { startOfWeek, endOfWeek } = req.body;
      if (!startOfWeek || !endOfWeek) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'ValidationError',
          message: 'Les champs startOfWeek et endOfWeek sont requis',
        });
      }

      const weeklyScore = await scoreModel.getWeekScores(new Date(startOfWeek), new Date(endOfWeek));
      const userScores = aggregateScores(weeklyScore);
      if (Object.keys(userScores).length === 0) {
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          data: { leaderboard: [], sent: 0 },
          message: 'Aucun score hebdomadaire disponible pour cette période',
        });
      }

      const leaderboard = await buildLeaderboard(userScores);
      const weeklyAllScore = await buildAllLeaderboard(userScores);
      const allUsers = await userModel.getAll();
      for (let index = allUsers.length - 1; index >= 0; index -= 1) {
        const jiraId = allUsers[index]?.jiraId;
        if (typeof jiraId !== 'string' || jiraId.trim() === '') {
          allUsers.splice(index, 1);
        }
      }
      WeeklyTopScores.create({
        id: (new Date(startOfWeek)).toISOString().slice(0, 10).replace(/-/g, ''),
        startOfWeek,
        endOfWeek,
        leaderboard,
      });
      WeeklyAllScores.create({
        id: (new Date(startOfWeek)).toISOString().slice(0, 10).replace(/-/g, ''),
        startOfWeek,
        endOfWeek,
        weeklyAllScores: weeklyAllScore,
      });
      const sent = await sendLeaderboardEmails({ allUsers, userScores, leaderboard, startOfWeek, endOfWeek });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { leaderboard, sent },
        message: 'Scores hebdomadaires calculés avec succès',
      });


    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        message: 'Erreur lors du calcul des scores hebdomadaires',
      });
    }
  },
];

