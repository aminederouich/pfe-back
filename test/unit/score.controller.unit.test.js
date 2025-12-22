/**
 * Tests unitaires pour score.controller.js
 * Total: 8 tests
 */

const scoreController = require('../../controllers/score.controller');
const ScoreService = require('../../services/score.service');
const ScoreModel = require('../../models/score.model');
const HTTP_STATUS = require('../../constants/httpStatus');
const { mockScore, mockTicket } = require('../helpers/mockData');

jest.mock('../../services/score.service');
jest.mock('../../models/score.model');
jest.mock('../../middleware/auth', () => (req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
});

describe('score.controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getScoreById', () => {
    it('should retrieve score by ID successfully', async () => {
      req.params = { scoreId: 'score-123' };
      ScoreModel.getScoreById.mockResolvedValue(mockScore);

      await scoreController.getScoreById[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockScore,
        message: 'Score récupéré avec succès',
      });
    });

    it('should return 404 when score not found', async () => {
      req.params = { scoreId: 'invalid' };
      ScoreModel.getScoreById.mockResolvedValue(null);

      await scoreController.getScoreById[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    });
  });

  describe('createScore', () => {
    it('should create score successfully', async () => {
      req.body = mockScore;
      ScoreModel.addScore.mockResolvedValue(mockScore);

      await scoreController.createScore[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockScore,
        message: 'Score créé avec succès',
      });
    });

    it('should handle error when creating score', async () => {
      req.body = {};
      ScoreModel.addScore.mockRejectedValue(new Error('Validation error'));

      await scoreController.createScore[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getAllScores', () => {
    it('should retrieve all scores successfully', async () => {
      ScoreModel.getScores.mockResolvedValue([mockScore]);

      await scoreController.getAllScores[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockScore],
        message: 'Scores récupérés avec succès',
      });
    });
  });

  describe('calculateTicketScore', () => {
    it('should calculate ticket score successfully', async () => {
      req.body = { ticket: mockTicket, ruleId: 'rule-123' };
      ScoreService.calculateTicketScore.mockResolvedValue({
        success: true,
        data: mockScore,
      });

      await scoreController.calculateTicketScore[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(ScoreService.calculateTicketScore).toHaveBeenCalledWith(
        mockTicket.id,
        'rule-123',
        mockTicket.fields.assignee.accountId
      );
    });

    it('should handle calculation error', async () => {
      req.body = { ticket: mockTicket, ruleId: 'invalid' };
      ScoreService.calculateTicketScore.mockRejectedValue(new Error('Rule not found'));

      await scoreController.calculateTicketScore[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });
  });

  describe('calculateMultipleTicketScores', () => {
    it('should calculate multiple ticket scores successfully', async () => {
      req.body = { ticketIds: ['ticket-123', 'ticket-456'], ruleId: 'rule-123' };
      ScoreService.calculateMultipleTicketScores.mockResolvedValue([
        { ticketId: 'ticket-123', success: true },
        { ticketId: 'ticket-456', success: true },
      ]);

      await scoreController.calculateMultipleTicketScores[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
        message: 'Scores calculés pour 2 tickets',
      });
    });
  });

  describe('getAllTicketScores', () => {
    it('should retrieve all ticket scores successfully', async () => {
      ScoreService.getAllTicketScores.mockResolvedValue([mockScore]);

      await scoreController.getAllTicketScores[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockScore],
        message: 'Scores de tickets récupérés avec succès',
      });
    });
  });

  describe('getScoresByTicketId', () => {
    it('should retrieve scores by ticket ID successfully', async () => {
      req.params = { ticketId: 'ticket-123' };
      ScoreService.getScoresByTicketId.mockResolvedValue([mockScore]);

      await scoreController.getScoresByTicketId[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });
  });

  describe('getEmployeeGlobalScore', () => {
    it('should retrieve employee global score successfully', async () => {
      req.params = { uid: 'jira-123' };
      ScoreService.getEmployeeGlobalScore.mockResolvedValue([mockScore]);

      await scoreController.getEmployeeGlobalScore[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(ScoreService.getEmployeeGlobalScore).toHaveBeenCalledWith('jira-123');
    });

    it('should return 400 when uid is missing', async () => {
      req.params = {};

      await scoreController.getEmployeeGlobalScore[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });
  });
});
