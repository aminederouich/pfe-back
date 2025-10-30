const express = require('express');
const router = express.Router();
const WeeklyTopScores = require('../controllers/weeklyTopScores.controller');

// Routes pour les règles de score
router.get('/getAll', WeeklyTopScores.getAllWeeklyTopScores);
router.post('/calculateweeklyscores', WeeklyTopScores.calculateweeklyscores);

module.exports = router;
