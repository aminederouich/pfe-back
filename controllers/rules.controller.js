const HTTP_STATUS = require('../constants/httpStatus');
const authMiddleware = require('../middleware/auth');
const RulesModel = require('../models/rules.model');

/**
   * Créer ou mettre à jour une règle
   */
exports.addRule = [
  authMiddleware,
  async(req, res) => {
    try {
      const result = await RulesModel.create(req.body);

      // Déterminer le status code selon l'opération
      const statusCode = result.operation === 'created' ? HTTP_STATUS.CREATED : HTTP_STATUS.OK;

      res.status(statusCode).json({
        success: true,
        data: result.rule,
        message: result.message,
        operation: result.operation,
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la création/mise à jour de la règle',
      });
    }
  },
];

exports.getRuleByIdOwner = [
  authMiddleware,
  async(req, res) => {
    try {
      const { ownerId } = req.params;
      const rule = await RulesModel.findByOwnerId(ownerId);
      if (!rule) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: `Règle avec l'ID ${ownerId} introuvable`,
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: rule,
        message: 'Règle récupérée avec succès',
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération de la règle',
      });
    }
  },
];
