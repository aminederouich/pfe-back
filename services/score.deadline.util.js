/**
 * Checks whether the ticket resolution is "Terminé" (accent-insensitive)
 * @param {Object} ticket
 * @returns {boolean}
 */
function isResolutionDone(ticket) {
  const resolutionName = ticket.fields?.resolution?.name || ticket.resolution;
  if (!resolutionName) {
    return false;
  }

  const normalized = resolutionName
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return normalized === 'termine';
}

/**
 * Extracts and validates the dates needed for deadline scoring
 * @param {Object} ticket
 * @returns {{deadlineDate: Date, statusChangedDate: Date} | null}
 */
function getDeadlineDates(ticket) {
  const deadline = ticket.fields?.duedate || ticket.duedate || ticket.dueDate || ticket.deadline;
  const statusCategoryChangeAt =
    ticket.fields?.statuscategorychangedate || ticket.statuscategorychangedate;

  if (!deadline || !statusCategoryChangeAt) {
    return null;
  }

  const deadlineDate = new Date(deadline);
  const statusChangedDate = new Date(statusCategoryChangeAt);

  if (Number.isNaN(deadlineDate.getTime()) || Number.isNaN(statusChangedDate.getTime())) {
    return null;
  }

  return { deadlineDate, statusChangedDate };
}

/**
 * Computes the score using deadline rules (rule1/rule2)
 * @param {{ rule1?: {checked:boolean, score:string|number}, rule2?: {checked:boolean, score:string|number} }} deadlineRule
 * @param {Date} deadlineDate
 * @param {Date} statusChangedDate
 * @returns {number}
 */
function computeDeadlineRuleScore(deadlineRule, deadlineDate, statusChangedDate) {
  const { rule1, rule2 } = deadlineRule || {};

  if (statusChangedDate < deadlineDate) {
    if (rule1 && rule1.checked) {
      return parseInt(rule1.score, 10) || 0;
    }
    return 0;
  }

  if (statusChangedDate.toDateString() === deadlineDate.toDateString()) {
    if (rule2 && rule2.checked) {
      return parseInt(rule2.score, 10) || 0;
    }
    return 0;
  }

  return 0;
}

/**
 * Public API used by ScoreService to calculate the deadline score
 * @param {Object} ticket
 * @param {Object} rule
 * @returns {number}
 */
function calculateDeadlineScore(ticket, rule) {
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

module.exports = {
  isResolutionDone,
  getDeadlineDates,
  computeDeadlineRuleScore,
  calculateDeadlineScore,
};
