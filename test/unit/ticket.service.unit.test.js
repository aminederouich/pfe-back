/**
 * Tests unitaires pour ticket.service.js
 * Total: 10 tests
 */

const ticketService = require('../../services/ticket.service');
const TicketModel = require('../../models/ticket.model');
const createJiraClient = require('../../middleware/jiraClient');
const { mockTicket, mockJiraConfig } = require('../helpers/mockData');

jest.mock('../../models/ticket.model');
jest.mock('../../middleware/jiraClient');

describe('ticketService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncTicketWithFirebase', () => {
    it('should update existing ticket', async () => {
      const existingTicket = { id: 'existing-id', ...mockTicket };
      TicketModel.findByKeyAndConfigId.mockResolvedValue(existingTicket);
      TicketModel.updateOrSyncTicket.mockResolvedValue();

      await ticketService.syncTicketWithFirebase(mockTicket, 'config-123');

      expect(TicketModel.findByKeyAndConfigId).toHaveBeenCalledWith(mockTicket.key, 'config-123');
      expect(TicketModel.updateOrSyncTicket).toHaveBeenCalledWith(existingTicket, mockTicket, 'config-123');
      expect(TicketModel.addNewTicket).not.toHaveBeenCalled();
    });

    it('should add new ticket when not exists', async () => {
      TicketModel.findByKeyAndConfigId.mockResolvedValue(null);
      TicketModel.addNewTicket.mockResolvedValue();

      await ticketService.syncTicketWithFirebase(mockTicket, 'config-123');

      expect(TicketModel.findByKeyAndConfigId).toHaveBeenCalledWith(mockTicket.key, 'config-123');
      expect(TicketModel.addNewTicket).toHaveBeenCalledWith(mockTicket, 'config-123');
      expect(TicketModel.updateOrSyncTicket).not.toHaveBeenCalled();
    });
  });

  describe('updateIssueJiraClient', () => {
    it('should update issue summary successfully', async () => {
      const mockJira = {
        updateIssue: jest.fn().mockResolvedValue({ success: true }),
      };
      createJiraClient.mockResolvedValue(mockJira);

      const ticket = {
        key: 'PROJ-123',
        fields: { summary: 'Updated summary' },
      };

      await ticketService.updateIssueJiraClient(ticket, mockJiraConfig);

      expect(createJiraClient).toHaveBeenCalledWith(mockJiraConfig);
      expect(mockJira.updateIssue).toHaveBeenCalledWith(ticket.key, { fields: ticket.fields }, {});
    });

    it('should handle Jira update error', async () => {
      const mockJira = {
        updateIssue: jest.fn().mockRejectedValue(new Error('Jira error')),
      };
      createJiraClient.mockResolvedValue(mockJira);

      const ticket = {
        key: 'PROJ-123',
        fields: { summary: 'Updated summary' },
      };

      const result = await ticketService.updateIssueJiraClient(ticket, mockJiraConfig);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error updating ticket in Jira');
    });
  });

  describe('SearchForIssuesUsingJQLEnhancedSearch', () => {
    it('should search for issues using JQL', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          issues: [mockTicket],
          total: 1,
        }),
      });

      const result = await ticketService.SearchForIssuesUsingJQLEnhancedSearch('PROJ', mockJiraConfig);

      expect(result.issues).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle search error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(ticketService.SearchForIssuesUsingJQLEnhancedSearch('PROJ', mockJiraConfig))
        .rejects.toThrow('Failed to fetch issues');
    });
  });

  describe('getIssueDetails', () => {
    it('should get issue details successfully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockTicket,
      });

      const result = await ticketService.getIssueDetails('PROJ-123', mockJiraConfig);

      expect(result).toEqual(mockTicket);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle fetch error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(ticketService.getIssueDetails('INVALID', mockJiraConfig))
        .rejects.toThrow('Failed to fetch issue details');
    });
  });

  describe('getTransitions', () => {
    it('should get issue transitions successfully', async () => {
      const mockTransitions = {
        transitions: [
          { id: '11', name: 'To Do' },
          { id: '21', name: 'In Progress' },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockTransitions,
      });

      const result = await ticketService.getTransitions('PROJ-123', mockJiraConfig);

      expect(result.transitions).toHaveLength(2);
    });
  });

  describe('transitionIssue', () => {
    it('should transition issue successfully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await ticketService.transitionIssue('PROJ-123', '21', mockJiraConfig);

      expect(result.success).toBe(true);
    });

    it('should handle transition error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const result = await ticketService.transitionIssue('PROJ-123', 'invalid', mockJiraConfig);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error transitioning issue in Jira');
    });
  });
});
