const ScoreModel = require('../models/score.model');

const ScoreController = {
  async createScore(req, res) {
    try {
      const score = await ScoreModel.addScore(req.body);
      res.status(201).json(score);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllScores(req, res) {
    try {
      const scores = await ScoreModel.getScores();
      res.status(200).json(scores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = ScoreController;
