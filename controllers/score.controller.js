const HTTP_STATUS = require('../constants/httpStatus');
const ScoreModel = require('../models/score.model');
const ScoreService = require('../services/score.service');

const ScoreController = {
  /**
   * Créer un nouveau score (règle)
   */
  async createScore(req, res) {
    try {
      const score = await ScoreModel.addScore(req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: score,
        message: 'Score créé avec succès',
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la création du score',
      });
    }
  },

  /**
   * Récupérer tous les scores (règles)
   */
  async getAllScores(req, res) {
    try {
      const scores = await ScoreModel.getScores();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: scores,
        message: 'Scores récupérés avec succès',
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération des scores',
      });
    }
  },

  /**
   * Récupérer un score (règle) par son ID
   */
  async getScoreById(req, res) {
    try {
      const { scoreId } = req.params;
      const score = await ScoreModel.getScoreById(scoreId);
      
      if (!score) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: `Score avec l'ID ${scoreId} introuvable`,
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: score,
        message: 'Score récupéré avec succès',
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération du score',
      });
    }
  },

  /**
   * Calculer le score d'un ticket
   */
  async calculateTicketScore(req, res) {
    try {
      const { ticketId, ruleId } = req.body;
      const result = await ScoreService.calculateTicketScore(ticketId, ruleId);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
        message: 'Erreur lors du calcul du score',
      });
    }
  },

  /**
   * Calculer les scores de plusieurs tickets
   */
  async calculateMultipleTicketScores(req, res) {
    try {
      const { ticketIds, ruleId } = req.body;

      const results = await ScoreService.calculateMultipleTicketScores(ticketIds, ruleId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: results,
        message: `Scores calculés pour ${results.length} tickets`,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
        message: 'Erreur lors du calcul des scores multiples',
      });
    }
  },

  /**
   * Récupérer tous les scores de tickets
   */
  async getAllTicketScores(req, res) {
    try {
      const scores = await ScoreService.getAllTicketScores();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: scores,
        message: 'Scores de tickets récupérés avec succès',
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération des scores de tickets',
      });
    }
  },

  /**
   * Récupérer les scores d'un ticket spécifique
   */
  async getScoresByTicketId(req, res) {
    try {
      const { ticketId } = req.params;

      const scores = await ScoreService.getScoresByTicketId(ticketId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: scores,
        message: `Scores pour le ticket ${ticketId} récupérés avec succès`,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération des scores du ticket',
      });
    }
  },
};

module.exports = ScoreController;
