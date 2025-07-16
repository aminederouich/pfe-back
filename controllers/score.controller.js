const HTTP_STATUS = require('../constants/httpStatus');
const ScoreModel = require('../models/score.model');

const ScoreController = {
  async createScore(req, res) {
    try {
      const score = await ScoreModel.addScore(req.body);
      res.status(HTTP_STATUS.CREATED).json(score);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  },

  async getAllScores(req, res) {
    try {
      const scores = await ScoreModel.getScores();
      res.status(HTTP_STATUS.OK).json(scores);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  },
};

module.exports = ScoreController;
