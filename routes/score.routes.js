const express = require('express');
const router = express.Router();
const ScoreController = require('../controllers/score.controller');

router.post('/add', ScoreController.createScore);
router.get('/getAll', ScoreController.getAllScores);

module.exports = router;
