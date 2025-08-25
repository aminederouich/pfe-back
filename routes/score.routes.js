const express = require('express');
const router = express.Router();
const ScoreController = require('../controllers/score.controller');

// Routes pour les règles de score
router.post('/add', ScoreController.createScore);
router.get('/getAll', ScoreController.getAllScores);
router.get('/getScoreById/:scoreId', ScoreController.getScoreById);
router.get('/users/score/:uid', ScoreController.getEmployeeGlobalScore);
// Routes pour le calcul des scores
router.post('/calculate', ScoreController.calculateTicketScore);
router.post('/calculate-multiple', ScoreController.calculateMultipleTicketScores);

// Routes pour la récupération des scores de tickets
router.get('/tickets', ScoreController.getAllTicketScores);
router.get('/tickets/:ticketId', ScoreController.getScoresByTicketId);

module.exports = router;
