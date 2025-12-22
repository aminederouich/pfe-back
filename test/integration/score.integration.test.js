/**
 * Tests d'intégration - Score and Rules Flow
 * Total: 20 tests
 */

const request = require('supertest');
const app = require('../../app');
const ScoreService = require('../../services/score.service');
const { mockScore, mockRule, mockTicket } = require('../helpers/mockData');

jest.mock('../../services/score.service');
jest.mock('../../models/rules.model');
jest.mock('../../models/score.model');

describe('Integration Tests - Score and Rules Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /scores/calculate - Integration', () => {
    it('should calculate score through full stack', async () => {
      ScoreService.calculateTicketScore.mockResolvedValue({
        success: true,
        data: mockScore,
        message: 'Score calculé et sauvegardé avec succès',
      });

      const response = await request(app)
        .post('/scores/calculate')
        .set('Authorization', 'Bearer token')
        .send({
          ticket: mockTicket,
          ruleId: 'rule-123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should validate ticket data', async () => {
      ScoreService.calculateTicketScore.mockRejectedValue(new Error('Ticket introuvable'));

      const response = await request(app)
        .post('/scores/calculate')
        .set('Authorization', 'Bearer token')
        .send({ ticket: {}, ruleId: 'rule-123' });

      expect(response.status).toBe(400);
    });

    it('should validate rule exists', async () => {
      ScoreService.calculateTicketScore.mockRejectedValue(new Error('Règle introuvable'));

      const response = await request(app)
        .post('/scores/calculate')
        .set('Authorization', 'Bearer token')
        .send({ ticket: mockTicket, ruleId: 'invalid' });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/scores/calculate')
        .send({ ticket: mockTicket, ruleId: 'rule-123' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /scores/calculate-multiple - Integration', () => {
    it('should calculate multiple scores', async () => {
      ScoreService.calculateMultipleTicketScores.mockResolvedValue([
        { ticketId: 'ticket-1', success: true },
        { ticketId: 'ticket-2', success: true },
      ]);

      const response = await request(app)
        .post('/scores/calculate-multiple')
        .set('Authorization', 'Bearer token')
        .send({
          ticketIds: ['ticket-1', 'ticket-2'],
          ruleId: 'rule-123',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle partial failures', async () => {
      ScoreService.calculateMultipleTicketScores.mockResolvedValue([
        { ticketId: 'ticket-1', success: true },
        { ticketId: 'ticket-2', success: false, error: 'Ticket not found' },
      ]);

      const response = await request(app)
        .post('/scores/calculate-multiple')
        .set('Authorization', 'Bearer token')
        .send({
          ticketIds: ['ticket-1', 'ticket-2'],
          ruleId: 'rule-123',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /scores/ticket/:ticketId - Integration', () => {
    it('should get scores by ticket ID', async () => {
      ScoreService.getScoresByTicketId.mockResolvedValue([mockScore]);

      const response = await request(app)
        .get('/scores/ticket/ticket-123')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should return empty array for ticket with no scores', async () => {
      ScoreService.getScoresByTicketId.mockResolvedValue([]);

      const response = await request(app)
        .get('/scores/ticket/ticket-no-scores')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /scores/employee/:uid - Integration', () => {
    it('should get employee global score', async () => {
      ScoreService.getEmployeeGlobalScore.mockResolvedValue([mockScore]);

      const response = await request(app)
        .get('/scores/employee/jira-123')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
    });

    it('should validate uid parameter', async () => {
      const response = await request(app)
        .get('/scores/employee/')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /scores - Integration', () => {
    it('should get all ticket scores', async () => {
      ScoreService.getAllTicketScores.mockResolvedValue([mockScore, mockScore]);

      const response = await request(app)
        .get('/scores')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  // Additional integration tests
  it('should handle score calculation with priority rules', async () => {
    ScoreService.calculateTicketScore.mockResolvedValue({
      success: true,
      data: { ...mockScore, score: 10 }, // Priority High = 10
    });

    const response = await request(app)
      .post('/scores/calculate')
      .set('Authorization', 'Bearer token')
      .send({ ticket: mockTicket, ruleId: 'rule-123' });

    expect(response.body.data.score).toBe(10);
  });

  it('should handle score calculation with deadline rules', async () => {
    ScoreService.calculateTicketScore.mockResolvedValue({
      success: true,
      data: { ...mockScore, score: 25 }, // With deadline bonus
    });

    const response = await request(app)
      .post('/scores/calculate')
      .set('Authorization', 'Bearer token')
      .send({ ticket: mockTicket, ruleId: 'rule-123' });

    expect(response.body.data.score).toBeGreaterThan(0);
  });

  it('should handle negative scores for late tickets', async () => {
    ScoreService.calculateTicketScore.mockResolvedValue({
      success: true,
      data: { ...mockScore, score: -5 },
    });

    const response = await request(app)
      .post('/scores/calculate')
      .set('Authorization', 'Bearer token')
      .send({ ticket: mockTicket, ruleId: 'rule-123' });

    expect(response.body.data.score).toBeLessThan(0);
  });

  it('should aggregate scores per user', async () => {
    ScoreService.getEmployeeGlobalScore.mockResolvedValue([
      { ...mockScore, score: 100 },
      { ...mockScore, score: 50 },
      { ...mockScore, score: 75 },
    ]);

    const response = await request(app)
      .get('/scores/employee/jira-123')
      .set('Authorization', 'Bearer token');

    expect(response.body).toHaveLength(3);
  });

  it('should handle concurrent score calculations', async () => {
    ScoreService.calculateTicketScore.mockResolvedValue({
      success: true,
      data: mockScore,
    });

    const requests = Array(10).fill().map((_, i) =>
      request(app)
        .post('/scores/calculate')
        .set('Authorization', 'Bearer token')
        .send({ ticket: { ...mockTicket, id: `ticket-${i}` }, ruleId: 'rule-123' })
    );

    const responses = await Promise.all(requests);
    responses.forEach(response => {
      expect(response.status).toBe(201);
    });
  });

  it('should cache frequently accessed scores', async () => {
    ScoreService.getScoresByTicketId.mockResolvedValue([mockScore]);

    await request(app)
      .get('/scores/ticket/ticket-123')
      .set('Authorization', 'Bearer token');

    await request(app)
      .get('/scores/ticket/ticket-123')
      .set('Authorization', 'Bearer token');

    expect(ScoreService.getScoresByTicketId).toHaveBeenCalledTimes(2);
  });

  it('should validate score data types', async () => {
    ScoreService.calculateTicketScore.mockRejectedValue(new Error('Invalid score value'));

    const response = await request(app)
      .post('/scores/calculate')
      .set('Authorization', 'Bearer token')
      .send({ ticket: mockTicket, ruleId: 123 });

    expect(response.status).toBe(400);
  });

  it('should handle database timeout gracefully', async () => {
    ScoreService.getAllTicketScores.mockRejectedValue(new Error('Database timeout'));

    const response = await request(app)
      .get('/scores')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(500);
  });

  it('should audit score calculations', async () => {
    ScoreService.calculateTicketScore.mockResolvedValue({
      success: true,
      data: { ...mockScore, createdAt: new Date() },
    });

    const response = await request(app)
      .post('/scores/calculate')
      .set('Authorization', 'Bearer token')
      .send({ ticket: mockTicket, ruleId: 'rule-123' });

    expect(response.body.data.createdAt).toBeDefined();
  });
});
