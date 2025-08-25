const ScoreModel = require('../models/score.model');
const TicketModel = require('../models/ticket.model');
const TicketScoreModel = require('../models/ticketScore.model');

class ScoreService {
  /**
   * Calcule le score d'un ticket selon une règle
   * @param {string} ticketId - ID du ticket
   * @param {string} ruleId - ID de la règle
   * @returns {Promise<Object>} Résultat du calcul
   */
  static async calculateTicketScore(ticketId, ruleId) {
    if (!ticketId || !ruleId) {
      throw new Error('Les paramètres ticketId et ruleId sont requis');
    }

    // Récupérer la règle
    const rule = await ScoreModel.getScoreById(ruleId);
    if (!rule) {
      throw new Error(`Règle avec l'ID ${ruleId} introuvable`);
    }

    // Récupérer le ticket
    const ticket = await TicketModel.getTicketById(ticketId);
    if (!ticket) {
      throw new Error(`Ticket avec l'ID ${ticketId} introuvable`);
    }

    // Calculer le score
    const calculatedScore = this.applyRule(ticket, rule);

    // Préparer les données à sauvegarder
    const scoreData = {
      ticketId,
      ruleId,
      score: calculatedScore,
      ruleName: rule.name || 'Règle sans nom',
      ticketKey: ticket.key || ticket.title || 'Ticket sans clé',
    };

    // Sauvegarder ou mettre à jour le score
    const savedScore = await TicketScoreModel.upsertTicketScore(scoreData);

    return {
      success: true,
      data: savedScore,
      message: 'Score calculé et sauvegardé avec succès',
    };
  }

  /**
   * Calcule les scores pour plusieurs tickets avec la même règle
   * @param {Array} ticketIds - Liste des IDs de tickets
   * @param {string} ruleId - ID de la règle
   * @returns {Promise<Array>} Liste des résultats
   */
  static async calculateMultipleTicketScores(ticketIds, ruleId) {
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0 || !ruleId) {
      throw new Error('Les paramètres ticketIds (array) et ruleId sont requis');
    }

    const results = [];

    for (const ticketId of ticketIds) {
      try {
        const result = await this.calculateTicketScore(ticketId, ruleId);
        results.push({
          ticketId,
          ...result,
        });
      } catch (error) {
        results.push({
          ticketId,
          success: false,
          error: error.message,
          message: 'Erreur lors du calcul du score',
        });
      }
    }

    return results;
  }

  /**
   * Applique la règle sur un ticket pour calculer le score
   * @param {Object} ticket - Le ticket
   * @param {Object} rule - La règle
   * @returns {number} Score calculé
   */
  static applyRule(ticket, rule) {
    let totalScore = 0;

    // Score basé sur la priorité
    const priorityScore = this.calculatePriorityScore(ticket, rule);
    totalScore += priorityScore;

    // Score basé sur le type de ticket
    const typeScore = this.calculateTicketTypeScore(ticket, rule);
    totalScore += typeScore;

    // Score basé sur la deadline
    const deadlineScore = this.calculateDeadlineScore(ticket, rule);
    totalScore += deadlineScore;

    // Score basé sur la résolution
    const resolutionScore = this.calculateResolutionScore(ticket, rule);
    totalScore += resolutionScore;

    // Retourner le score total arrondi (sans limitation)
    return Math.round(totalScore);
  }

  /**
   * Calcule le score basé sur la priorité
   * @param {Object} ticket - Le ticket
   * @param {Object} rule - La règle
   * @returns {number} Score de priorité
   */
  static calculatePriorityScore(ticket, rule) {
    // Extraire la priorité du ticket
    const ticketPriority = ticket.fields?.priority?.value;
    const priorityValue = ticketPriority || ticket.priority;

    if (!priorityValue) {
      return 0;
    }

    // Vérifier la configuration de priorité dans la règle
    if (rule.priority && typeof rule.priority === 'object') {
      const priorityKey = priorityValue.toLowerCase();
      if (rule.priority[priorityKey]) {
        const priorityConfig = rule.priority[priorityKey];

        // Si checked est false, retourner 0
        if (!priorityConfig.checked) {
          return 0;
        }

        // Si checked est true, retourner le score configuré
        return parseInt(priorityConfig.score, 10) || 0;
      }

      return 0;
    }

    return 0;
  }

  /**
   * Calcule le score basé sur le type de ticket
   * @param {Object} ticket - Le ticket
   * @param {Object} rule - La règle
   * @returns {number} Score de type
   */
  static calculateTicketTypeScore(ticket, rule) {
    // Extraire le type du ticket
    const ticketType = ticket.fields?.issuetype?.name || ticket.type || ticket.issueType;

    if (!ticketType) {
      return 0;
    }

    // Vérifier la configuration de type dans la règle
    if (rule.type && typeof rule.type === 'object') {
      const typeKey = ticketType.toLowerCase().replace(/\s+/g, '_');

      if (rule.type[typeKey]) {
        const typeConfig = rule.type[typeKey];

        // Si checked est false, retourner 0
        if (!typeConfig.checked) {
          return 0;
        }

        // Si checked est true, retourner le score configuré
        return parseInt(typeConfig.score, 10) || 0;
      }

      return 0;
    }

    return 0;
  }

  // Moved deadline helpers to score.deadline.util.js to keep this file concise
  /**
   * Calcule le score basé sur la deadline (avant, à temps, en retard)
   * @param {Object} ticket
   * @param {Object} rule
   * @returns {number}
   */
  static calculateDeadlineScore(ticket, rule) {
    const {
      isResolutionDone,
      getDeadlineDates,
      computeDeadlineRuleScore,
    } = require('./score.deadline.util');

    if (!isResolutionDone(ticket)) {
      return 0;
    }

    const dates = getDeadlineDates(ticket);
    if (!dates) {
      return 0;
    }

    if (!rule.deadline || typeof rule.deadline !== 'object') {
      return 0;
    }

    const { deadlineDate, statusChangedDate } = dates;
    return computeDeadlineRuleScore(rule.deadline, deadlineDate, statusChangedDate);
  }

  /**
   * Calcule le score basé sur la résolution du ticket
   * @param {Object} ticket
   * @param {Object} rule
   * @returns {number}
   */
  static calculateResolutionScore(ticket, rule) {
    // Exemples de champs : ticket.resolution, ticket.fields?.resolution?.name
    const resolution = ticket.resolution || ticket.fields?.resolution?.name;
    if (!resolution) {
      return 0;
    }

    if (rule.resolution && typeof rule.resolution === 'object') {
      const resolutionKey = resolution.toLowerCase().replace(/\s+/g, '_');
      if (rule.resolution[resolutionKey]) {
        const resConfig = rule.resolution[resolutionKey];
        if (!resConfig.checked) {
          return 0;
        }
        return parseInt(resConfig.score, 10) || 0;
      }
      return 0;
    }
    return 0;
  }

  /**
   * Récupère tous les scores
   * @returns {Promise<Array>} Liste des scores
   */
  static async getAllTicketScores() {
    return TicketScoreModel.getTicketScores();
  }

  /**
   * Récupère les scores par ticket ID
   * @param {string} ticketId - ID du ticket
   * @returns {Promise<Array>} Liste des scores pour le ticket
   */
  static async getScoresByTicketId(ticketId) {
    if (!ticketId) {
      throw new Error('Le paramètre ticketId est requis');
    }

    return TicketScoreModel.getTicketScoresByTicketId(ticketId);
  }

  /**
 * Calcule le score global d'un employé (moyenne des scores de ses tickets)
 * @param {string} userId - ID de l'employé (c'est le uid du user)
 * @returns {Promise<Object>} Statistiques de score
 */
  static async getEmployeeGlobalScore(userId) {
    if (!userId) {
      throw new Error('Le paramètre userId est requis');
    }

    // 1. Récupérer tous les scores où ownerId == userId
    const ticketScores = await TicketScoreModel.getTicketScoresByOwnerId(userId);

    if (!ticketScores || ticketScores.length === 0) {
      return {
        total: 0,
        weekly: 0,
        score: 0,
      };
    }

    let totalScore = 0;
    let count = 0;
    let weeklyCount = 0;
    const now = new Date();

    for (const score of ticketScores) {
      if (score.score !== undefined) {
        totalScore += score.score;
        count++;

        // Si le ticket a été affecté cette semaine
        const dateAffect = score.dateAffection || score.dateAffectation;
        if (dateAffect) {
          const resolvedDate = new Date(dateAffect);
          const diffDays = (now - resolvedDate) / (1000 * 60 * 60 * 24);
          if (diffDays <= 7) {
            weeklyCount++;
          }
        }
      }
    }

    return {
      total: count,
      weekly: weeklyCount,
      score: count ? Math.round(totalScore / count) : 0,
    };
  }
}


module.exports = ScoreService;
