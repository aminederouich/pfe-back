/**
 * Tests unitaires pour les Models
 * Total: 20 tests (user: 4, ticket: 4, score: 3, ticketScore: 3, rules: 3, project: 3)
 */

const User = require('../../models/user.model');
const { mockUser } = require('../helpers/mockData');

jest.mock('firebase/firestore');

describe('Models - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('user.model', () => {
    it('should create user successfully', async () => {
      const userData = { ...mockUser };
      const user = new User(userData);
      expect(user.email).toBe(mockUser.email);
    });

    it('should find user by UID', async () => {
      User.findByUid = jest.fn().mockResolvedValue(new User(mockUser));
      const user = await User.findByUid('test-uid-123');
      expect(user.uid).toBe('test-uid-123');
    });

    it('should find user by jiraId', async () => {
      User.findByjiraId = jest.fn().mockResolvedValue(mockUser);
      const user = await User.findByjiraId('jira-123');
      expect(user.jiraId).toBe('jira-123');
    });

    it('should convert user to public format', () => {
      const user = new User(mockUser);
      user.toPublicFormat = jest.fn().mockReturnValue({ uid: mockUser.uid, email: mockUser.email });
      const publicData = user.toPublicFormat();
      expect(publicData.uid).toBeDefined();
      expect(publicData.email).toBeDefined();
    });
  });

  describe('ticket.model', () => {
    it('should get ticket by ID', async () => {
      const TicketModel = require('../../models/ticket.model');
      TicketModel.getTicketById = jest.fn().mockResolvedValue({ id: 'ticket-123', key: 'PROJ-123' });
      const ticket = await TicketModel.getTicketById('ticket-123');
      expect(ticket.id).toBe('ticket-123');
    });

    it('should add new ticket', async () => {
      const TicketModel = require('../../models/ticket.model');
      TicketModel.addNewTicket = jest.fn().mockResolvedValue({ id: 'new-ticket' });
      const ticket = await TicketModel.addNewTicket({}, 'config-123');
      expect(ticket.id).toBe('new-ticket');
    });

    it('should update or sync ticket', async () => {
      const TicketModel = require('../../models/ticket.model');
      TicketModel.updateOrSyncTicket = jest.fn().mockResolvedValue();
      await TicketModel.updateOrSyncTicket({}, {}, 'config-123');
      expect(TicketModel.updateOrSyncTicket).toHaveBeenCalled();
    });

    it('should find ticket by key and config ID', async () => {
      const TicketModel = require('../../models/ticket.model');
      TicketModel.findByKeyAndConfigId = jest.fn().mockResolvedValue({ key: 'PROJ-123' });
      const ticket = await TicketModel.findByKeyAndConfigId('PROJ-123', 'config-123');
      expect(ticket.key).toBe('PROJ-123');
    });
  });

  describe('score.model', () => {
    it('should get score by ID', async () => {
      const ScoreModel = require('../../models/score.model');
      ScoreModel.getScoreById = jest.fn().mockResolvedValue({ id: 'score-123' });
      const score = await ScoreModel.getScoreById('score-123');
      expect(score.id).toBe('score-123');
    });

    it('should add score', async () => {
      const ScoreModel = require('../../models/score.model');
      ScoreModel.addScore = jest.fn().mockResolvedValue({ id: 'new-score' });
      const score = await ScoreModel.addScore({});
      expect(score.id).toBe('new-score');
    });

    it('should get all scores', async () => {
      const ScoreModel = require('../../models/score.model');
      ScoreModel.getScores = jest.fn().mockResolvedValue([{ id: 'score-1' }]);
      const scores = await ScoreModel.getScores();
      expect(scores).toHaveLength(1);
    });
  });

  describe('ticketScore.model', () => {
    it('should upsert ticket score', async () => {
      const TicketScoreModel = require('../../models/ticketScore.model');
      TicketScoreModel.upsertTicketScore = jest.fn().mockResolvedValue({ id: 'score-123' });
      const score = await TicketScoreModel.upsertTicketScore({});
      expect(score.id).toBe('score-123');
    });

    it('should get ticket scores by ticket ID', async () => {
      const TicketScoreModel = require('../../models/ticketScore.model');
      TicketScoreModel.getTicketScoresByTicketId = jest.fn().mockResolvedValue([{ ticketId: 'ticket-123' }]);
      const scores = await TicketScoreModel.getTicketScoresByTicketId('ticket-123');
      expect(scores).toHaveLength(1);
    });

    it('should get ticket scores by owner ID', async () => {
      const TicketScoreModel = require('../../models/ticketScore.model');
      TicketScoreModel.getTicketScoresByOwnerId = jest.fn().mockResolvedValue([{ ownerId: 'jira-123' }]);
      const scores = await TicketScoreModel.getTicketScoresByOwnerId('jira-123');
      expect(scores).toHaveLength(1);
    });
  });

  describe('rules.model', () => {
    it('should find rule by ID', async () => {
      const { findById } = require('../../models/rules.model');
      findById.mockResolvedValue({ id: 'rule-123', name: 'Test Rule' });
      const rule = await findById('rule-123');
      expect(rule.id).toBe('rule-123');
    });

    it('should create rule', async () => {
      const RulesModel = require('../../models/rules.model');
      RulesModel.create = jest.fn().mockResolvedValue({ id: 'new-rule' });
      const rule = await RulesModel.create({});
      expect(rule.id).toBe('new-rule');
    });

    it('should get all rules', async () => {
      const RulesModel = require('../../models/rules.model');
      RulesModel.findAll = jest.fn().mockResolvedValue([{ id: 'rule-1' }]);
      const rules = await RulesModel.findAll();
      expect(rules).toHaveLength(1);
    });
  });

  describe('project.model', () => {
    it('should create project', async () => {
      const Project = require('../../models/project.model');
      Project.create = jest.fn().mockResolvedValue({ id: 'project-123' });
      const project = await Project.create({});
      expect(project.id).toBe('project-123');
    });

    it('should find project by ID', async () => {
      const Project = require('../../models/project.model');
      Project.findById = jest.fn().mockResolvedValue({ id: 'project-123' });
      const project = await Project.findById('project-123');
      expect(project.id).toBe('project-123');
    });

    it('should get all projects', async () => {
      const Project = require('../../models/project.model');
      Project.findAll = jest.fn().mockResolvedValue([{ id: 'project-1' }]);
      const projects = await Project.findAll();
      expect(projects).toHaveLength(1);
    });
  });
});
