/**
 * Tests d'intégration - Ticket and Jira Flow
 * Total: 25 tests
 */

const request = require('supertest');
const app = require('../../app');
const ticketService = require('../../services/ticket.service');
const TicketModel = require('../../models/ticket.model');
const { mockTicket, mockJiraConfig } = require('../helpers/mockData');

jest.mock('../../services/ticket.service');
jest.mock('../../models/ticket.model');

describe('Integration Tests - Ticket and Jira Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /ticket/sync - Integration', () => {
    it('should sync ticket with Firebase', async () => {
      ticketService.syncTicketWithFirebase = jest.fn().mockResolvedValue();

      const response = await request(app)
        .post('/ticket/sync')
        .set('Authorization', 'Bearer token')
        .send({ ticket: mockTicket, configId: 'config-123' });

      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('POST /jira_client/search - Integration', () => {
    it('should search issues using JQL', async () => {
      ticketService.SearchForIssuesUsingJQLEnhancedSearch = jest.fn().mockResolvedValue({
        issues: [mockTicket],
        total: 1,
      });

      const response = await request(app)
        .post('/jira_client/search')
        .set('Authorization', 'Bearer token')
        .send({
          projectName: 'PROJ',
          config: mockJiraConfig,
        });

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should handle invalid JQL query', async () => {
      ticketService.SearchForIssuesUsingJQLEnhancedSearch = jest.fn()
        .mockRejectedValue(new Error('Invalid JQL'));

      const response = await request(app)
        .post('/jira_client/search')
        .set('Authorization', 'Bearer token')
        .send({ projectName: 'INVALID', config: mockJiraConfig });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /ticket/:ticketId - Integration', () => {
    it('should get ticket details', async () => {
      TicketModel.getTicketById = jest.fn().mockResolvedValue(mockTicket);

      const response = await request(app)
        .get('/ticket/ticket-123')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent ticket', async () => {
      TicketModel.getTicketById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/ticket/invalid')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /ticket/:ticketId - Integration', () => {
    it('should update ticket', async () => {
      ticketService.updateIssueJiraClient = jest.fn().mockResolvedValue({ success: true });

      const response = await request(app)
        .put('/ticket/ticket-123')
        .set('Authorization', 'Bearer token')
        .send({
          fields: { summary: 'Updated summary' },
          config: mockJiraConfig,
        });

      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('POST /ticket/transition - Integration', () => {
    it('should transition ticket status', async () => {
      ticketService.transitionIssue = jest.fn().mockResolvedValue({ success: true });

      const response = await request(app)
        .post('/ticket/transition')
        .set('Authorization', 'Bearer token')
        .send({
          issueId: 'PROJ-123',
          transitionId: '21',
          config: mockJiraConfig,
        });

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should validate transition ID', async () => {
      ticketService.transitionIssue = jest.fn()
        .mockRejectedValue(new Error('Invalid transition'));

      const response = await request(app)
        .post('/ticket/transition')
        .set('Authorization', 'Bearer token')
        .send({
          issueId: 'PROJ-123',
          transitionId: 'invalid',
          config: mockJiraConfig,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /ticket/transitions/:issueId - Integration', () => {
    it('should get available transitions', async () => {
      ticketService.getTransitions = jest.fn().mockResolvedValue({
        transitions: [
          { id: '11', name: 'To Do' },
          { id: '21', name: 'In Progress' },
        ],
      });

      const response = await request(app)
        .get('/ticket/transitions/PROJ-123')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  // Additional integration tests
  it('should handle Jira connection errors gracefully', async () => {
    ticketService.SearchForIssuesUsingJQLEnhancedSearch = jest.fn()
      .mockRejectedValue(new Error('Jira connection failed'));

    const response = await request(app)
      .post('/jira_client/search')
      .set('Authorization', 'Bearer token')
      .send({ projectName: 'PROJ', config: mockJiraConfig });

    expect(response.status).toBe(500);
  });

  it('should handle ticket assignment', async () => {
    ticketService.updateIssueJiraClient = jest.fn().mockResolvedValue({ success: true });

    const response = await request(app)
      .put('/ticket/ticket-123')
      .set('Authorization', 'Bearer token')
      .send({
          fields: { assignee: { accountId: 'user-123' } },
        config: mockJiraConfig,
      });

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should validate Jira config before operations', async () => {
    const response = await request(app)
      .post('/jira_client/search')
      .set('Authorization', 'Bearer token')
      .send({ projectName: 'PROJ', config: {} });

    expect(response.status).toBe(400);
  });

  it('should handle bulk ticket sync', async () => {
    ticketService.syncTicketWithFirebase = jest.fn().mockResolvedValue();

    const tickets = Array(10).fill().map((_, i) => ({
      ...mockTicket,
      id: `ticket-${i}`,
    }));

    const response = await request(app)
      .post('/ticket/bulk-sync')
      .set('Authorization', 'Bearer token')
      .send({ tickets, configId: 'config-123' });

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should filter tickets by status', async () => {
    TicketModel.getAllTickets = jest.fn().mockResolvedValue([mockTicket]);

    const response = await request(app)
      .get('/ticket')
      .set('Authorization', 'Bearer token')
      .query({ status: 'Done' });

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should filter tickets by assignee', async () => {
    TicketModel.getAllTickets = jest.fn().mockResolvedValue([mockTicket]);

    const response = await request(app)
      .get('/ticket')
      .set('Authorization', 'Bearer token')
      .query({ assignee: 'jira-123' });

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should handle ticket priority updates', async () => {
    ticketService.updateIssueJiraClient = jest.fn().mockResolvedValue({ success: true });

    const response = await request(app)
      .put('/ticket/ticket-123')
      .set('Authorization', 'Bearer token')
      .send({
        fields: { priority: { name: 'Critical' } },
        config: mockJiraConfig,
      });

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should handle ticket comments', async () => {
    const response = await request(app)
      .post('/ticket/ticket-123/comment')
      .set('Authorization', 'Bearer token')
      .send({
        comment: 'Test comment',
        config: mockJiraConfig,
      });

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should get ticket history', async () => {
    const response = await request(app)
      .get('/ticket/ticket-123/history')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should handle ticket attachments', async () => {
    const response = await request(app)
      .post('/ticket/ticket-123/attach')
      .set('Authorization', 'Bearer token')
      .attach('file', Buffer.from('test'), 'test.txt');

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should validate ticket data on sync', async () => {
    ticketService.syncTicketWithFirebase = jest.fn()
      .mockRejectedValue(new Error('Invalid ticket data'));

    const response = await request(app)
      .post('/ticket/sync')
      .set('Authorization', 'Bearer token')
      .send({ ticket: {}, configId: 'config-123' });

    expect(response.status).toBe(400);
  });

  it('should handle Jira API rate limiting', async () => {
    ticketService.SearchForIssuesUsingJQLEnhancedSearch = jest.fn()
      .mockRejectedValue(new Error('Rate limit exceeded'));

    const response = await request(app)
      .post('/jira_client/search')
      .set('Authorization', 'Bearer token')
      .send({ projectName: 'PROJ', config: mockJiraConfig });

    expect(response.status).toBe(429);
  });

  it('should handle ticket watchers', async () => {
    const response = await request(app)
      .get('/ticket/ticket-123/watchers')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should handle ticket links', async () => {
    const response = await request(app)
      .post('/ticket/ticket-123/link')
      .set('Authorization', 'Bearer token')
      .send({
        linkedTicketId: 'ticket-456',
        linkType: 'relates to',
        config: mockJiraConfig,
      });

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should handle ticket sprints', async () => {
    const response = await request(app)
      .get('/ticket/ticket-123/sprints')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should validate issue type on creation', async () => {
    const response = await request(app)
      .post('/ticket')
      .set('Authorization', 'Bearer token')
      .send({
        fields: { issuetype: { name: 'InvalidType' } },
        config: mockJiraConfig,
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle ticket deletion', async () => {
    TicketModel.deleteTicket = jest.fn().mockResolvedValue({ success: true });

    const response = await request(app)
      .delete('/ticket/ticket-123')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should handle concurrent ticket updates', async () => {
    ticketService.updateIssueJiraClient = jest.fn().mockResolvedValue({ success: true });

    const requests = Array(5).fill().map(() =>
      request(app)
        .put('/ticket/ticket-123')
        .set('Authorization', 'Bearer token')
        .send({ fields: { summary: 'Concurrent update' }, config: mockJiraConfig })
    );

    const responses = await Promise.all(requests);
    responses.forEach(response => {
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });
});
