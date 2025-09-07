const HTTP_STATUS = require('../constants/httpStatus');
const authMiddleware = require('../middleware/auth');
const ScoreModel = require('../models/score.model');
const ScoreService = require('../services/score.service');


exports.getScoreById = [
  authMiddleware,
  async(req, res) => {
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
];

/**
   * Créer un nouveau score (règle)
   */
exports.createScore = [
  authMiddleware,
  async(req, res) => {
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
];

/**
 * Récupérer tous les scores (règles)
 */
exports.getAllScores = [
  authMiddleware,
  async(req, res) => {
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
];

/**
   * Calculer le score d'un ticket
   */
exports.calculateTicketScore = [
  authMiddleware,
  async(req, res) => {
    try {
      const { ticket, ruleId } = req.body;
      const result = await ScoreService.calculateTicketScore(ticket.id, ruleId, ticket.fields.assignee.accountId);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
        message: 'Erreur lors du calcul du score',
      });
    }
  },
];

/**
   * Calculer les scores de plusieurs tickets
   */
exports.calculateMultipleTicketScores = [
  authMiddleware,
  async(req, res) => {
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
];

/**
   * Récupérer tous les scores de tickets
   */
exports.getAllTicketScores = [
  authMiddleware,
  async(req, res) => {
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
];

/**
   * Récupérer les scores d'un ticket spécifique
   */
exports.getScoresByTicketId = [
  authMiddleware,
  async(req, res) => {
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
];
/**
 * Récupérer le score global d'un employé
 */
exports.getEmployeeGlobalScore = [
  authMiddleware,
  async(req, res) => {
    try {
      const { uid } = req.params;
      const globalScore = await ScoreService.getEmployeeGlobalScore(uid);

      res.status(HTTP_STATUS.OK).json(globalScore);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération du score global de l\'employé',
      });
    }
  },
];
