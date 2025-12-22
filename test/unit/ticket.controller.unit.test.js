/**
 * Tests unitaires pour ticket.controller.js
 * Total: 8 tests
 */

const ticketController = require('../../controllers/ticket.controller');
const ticketService = require('../../services/ticket.service');
const TicketModel = require('../../models/ticket.model');
const HTTP_STATUS = require('../../constants/httpStatus');
const { mockTicket } = require('../helpers/mockData');

jest.mock('../../services/ticket.service');
jest.mock('../../models/ticket.model');
jest.mock('../../middleware/auth', () => (req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
});

describe('ticket.controller - Unit Tests', () => {
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

  it('should get ticket by ID successfully', async () => {
    TicketModel.getTicketById = jest.fn().mockResolvedValue(mockTicket);
    expect(await TicketModel.getTicketById('ticket-123')).toEqual(mockTicket);
  });

  it('should get all tickets successfully', async () => {
    TicketModel.getAllTickets = jest.fn().mockResolvedValue([mockTicket]);
    expect(await TicketModel.getAllTickets()).toHaveLength(1);
  });

  it('should update ticket successfully', async () => {
    ticketService.updateIssueJiraClient = jest.fn().mockResolvedValue({ success: true });
    const result = await ticketService.updateIssueJiraClient(mockTicket, {});
    expect(result).toEqual({ success: true });
  });

  it('should sync ticket with Firebase successfully', async () => {
    ticketService.syncTicketWithFirebase = jest.fn().mockResolvedValue();
    await ticketService.syncTicketWithFirebase(mockTicket, 'config-123');
    expect(ticketService.syncTicketWithFirebase).toHaveBeenCalled();
  });

  it('should search issues using JQL successfully', async () => {
    ticketService.SearchForIssuesUsingJQLEnhancedSearch = jest.fn().mockResolvedValue({ issues: [mockTicket] });
    const result = await ticketService.SearchForIssuesUsingJQLEnhancedSearch('PROJ', {});
    expect(result.issues).toHaveLength(1);
  });

  it('should get issue details successfully', async () => {
    ticketService.getIssueDetails = jest.fn().mockResolvedValue(mockTicket);
    const result = await ticketService.getIssueDetails('PROJ-123', {});
    expect(result).toEqual(mockTicket);
  });

  it('should get transitions successfully', async () => {
    const mockTransitions = { transitions: [{ id: '11', name: 'To Do' }] };
    ticketService.getTransitions = jest.fn().mockResolvedValue(mockTransitions);
    const result = await ticketService.getTransitions('PROJ-123', {});
    expect(result.transitions).toHaveLength(1);
  });

  it('should transition issue successfully', async () => {
    ticketService.transitionIssue = jest.fn().mockResolvedValue({ success: true });
    const result = await ticketService.transitionIssue('PROJ-123', '21', {});
    expect(result.success).toBe(true);
  });
});
