/**
 * Tests unitaires pour score.service.js
 * Total: 15 tests
 */

const ScoreService = require('../../services/score.service');
const TicketModel = require('../../models/ticket.model');
const TicketScoreModel = require('../../models/ticketScore.model');
const { findById } = require('../../models/rules.model');
const { mockTicket, mockRule, mockScore } = require('../helpers/mockData');

jest.mock('../../models/ticket.model');
jest.mock('../../models/ticketScore.model');
jest.mock('../../models/rules.model');

describe('ScoreService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateTicketScore', () => {
    it('should calculate and save ticket score successfully', async () => {
      findById.mockResolvedValue(mockRule);
      TicketModel.getTicketById.mockResolvedValue(mockTicket);
      TicketScoreModel.upsertTicketScore.mockResolvedValue(mockScore);

      const result = await ScoreService.calculateTicketScore('ticket-123', 'rule-123', 'jira-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockScore);
      expect(findById).toHaveBeenCalledWith('rule-123');
      expect(TicketModel.getTicketById).toHaveBeenCalledWith('ticket-123');
      expect(TicketScoreModel.upsertTicketScore).toHaveBeenCalled();
    });

    it('should throw error when ticketId is missing', async () => {
      await expect(ScoreService.calculateTicketScore(null, 'rule-123', 'jira-123'))
        .rejects.toThrow('Les paramètres ticketId et ruleId sont requis');
    });

    it('should throw error when rule not found', async () => {
      findById.mockResolvedValue(null);

      await expect(ScoreService.calculateTicketScore('ticket-123', 'invalid-rule', 'jira-123'))
        .rejects.toThrow('Règle avec l\'ID invalid-rule introuvable');
    });

    it('should throw error when ticket not found', async () => {
      findById.mockResolvedValue(mockRule);
      TicketModel.getTicketById.mockResolvedValue(null);

      await expect(ScoreService.calculateTicketScore('invalid-ticket', 'rule-123', 'jira-123'))
        .rejects.toThrow('Ticket avec l\'ID invalid-ticket introuvable');
    });

    it('should throw error when ticket is not completed', async () => {
      const incompleteTicket = {
        ...mockTicket,
        fields: {
          ...mockTicket.fields,
          resolution: { name: 'In Progress' },
        },
      };

      findById.mockResolvedValue(mockRule);
      TicketModel.getTicketById.mockResolvedValue(incompleteTicket);

      await expect(ScoreService.calculateTicketScore('ticket-123', 'rule-123', 'jira-123'))
        .rejects.toThrow('Le ticket n\'est pas terminé');
    });
  });

  describe('calculateMultipleTicketScores', () => {
    it('should calculate scores for multiple tickets', async () => {
      findById.mockResolvedValue(mockRule);
      TicketModel.getTicketById.mockResolvedValue(mockTicket);
      TicketScoreModel.upsertTicketScore.mockResolvedValue(mockScore);

      const results = await ScoreService.calculateMultipleTicketScores(['ticket-123', 'ticket-456'], 'rule-123');

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
    });

    it('should throw error when ticketIds is not an array', async () => {
      await expect(ScoreService.calculateMultipleTicketScores('not-array', 'rule-123'))
        .rejects.toThrow('Les paramètres ticketIds (array) et ruleId sont requis');
    });

    it('should handle errors for individual tickets', async () => {
      findById.mockResolvedValue(mockRule);
      TicketModel.getTicketById
        .mockResolvedValueOnce(mockTicket)
        .mockResolvedValueOnce(null);
      TicketScoreModel.upsertTicketScore.mockResolvedValue(mockScore);

      const results = await ScoreService.calculateMultipleTicketScores(['ticket-123', 'ticket-456'], 'rule-123');

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('calculatePriorityScore', () => {
    it('should calculate priority score correctly', () => {
      const score = ScoreService.calculatePriorityScore(mockTicket, mockRule);
      expect(score).toBe(10); // High priority = 10
    });

    it('should return 0 when priority not found in rule', () => {
      const ticketWithUnknownPriority = {
        ...mockTicket,
        fields: { ...mockTicket.fields, priority: { name: 'Unknown' } },
      };
      const score = ScoreService.calculatePriorityScore(ticketWithUnknownPriority, mockRule);
      expect(score).toBe(0);
    });

    it('should return 0 when priority is not checked', () => {
      const ruleWithUncheckedPriority = {
        ...mockRule,
        priority: { High: { checked: false, value: 10 } },
      };
      const score = ScoreService.calculatePriorityScore(mockTicket, ruleWithUncheckedPriority);
      expect(score).toBe(0);
    });
  });

  describe('calculateTicketTypeScore', () => {
    it('should calculate ticket type score correctly', () => {
      const score = ScoreService.calculateTicketTypeScore(mockTicket, mockRule);
      expect(score).toBe(8); // Story = 8
    });

    it('should return 0 when type not found in rule', () => {
      const ticketWithUnknownType = {
        ...mockTicket,
        fields: { ...mockTicket.fields, issuetype: { name: 'Unknown' } },
      };
      const score = ScoreService.calculateTicketTypeScore(ticketWithUnknownType, mockRule);
      expect(score).toBe(0);
    });
  });

  describe('getAllTicketScores', () => {
    it('should retrieve all ticket scores', async () => {
      TicketScoreModel.getTicketScores.mockResolvedValue([mockScore]);

      const scores = await ScoreService.getAllTicketScores();

      expect(scores).toHaveLength(1);
      expect(TicketScoreModel.getTicketScores).toHaveBeenCalled();
    });
  });

  describe('getScoresByTicketId', () => {
    it('should retrieve scores by ticket ID', async () => {
      TicketScoreModel.getTicketScoresByTicketId.mockResolvedValue([mockScore]);

      const scores = await ScoreService.getScoresByTicketId('ticket-123');

      expect(scores).toHaveLength(1);
      expect(TicketScoreModel.getTicketScoresByTicketId).toHaveBeenCalledWith('ticket-123');
    });

    it('should throw error when ticketId is missing', async () => {
      await expect(ScoreService.getScoresByTicketId(null))
        .rejects.toThrow('Le paramètre ticketId est requis');
    });
  });

  describe('getEmployeeGlobalScore', () => {
    it('should retrieve employee global score', async () => {
      TicketScoreModel.getTicketScoresByOwnerId.mockResolvedValue([mockScore]);

      const result = await ScoreService.getEmployeeGlobalScore('jira-123');

      expect(result).toHaveLength(1);
      expect(TicketScoreModel.getTicketScoresByOwnerId).toHaveBeenCalledWith('jira-123');
    });

    it('should throw error when userId is missing', async () => {
      await expect(ScoreService.getEmployeeGlobalScore(null))
        .rejects.toThrow('Le paramètre userId est requis');
    });
  });
});
