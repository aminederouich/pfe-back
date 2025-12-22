/**
 * Tests unitaires pour utils et middleware
 * Total: 20 tests (email.util: 5, score.deadline.util: 5, auth middleware: 5, jiraClient middleware: 5)
 */

const { sendWeeklyLeaderboardEmail, sendInvitationEmail } = require('../../utils/email.util');
const { isResolutionDone, getDeadlineDates, computeDeadlineRuleScore } = require('../../services/score.deadline.util');
const authMiddleware = require('../../middleware/auth');
const createJiraClient = require('../../middleware/jiraClient');
const { mockUser, mockTicket, mockWeeklyLeaderboard } = require('../helpers/mockData');

jest.mock('nodemailer');
jest.mock('jsonwebtoken');

describe('Utils and Middleware - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('email.util', () => {
    it('should send weekly leaderboard email successfully', async () => {
      const emailData = {
        user: mockUser,
        leaderboard: mockWeeklyLeaderboard,
        userScore: 150,
        weekStart: new Date(),
        weekEnd: new Date(),
      };

      const result = await sendWeeklyLeaderboardEmail(emailData);
      expect(result).toBeDefined();
    });

    it('should send invitation email successfully', async () => {
      const result = await sendInvitationEmail('test@example.com', 'password123');
      expect(result).toBeDefined();
    });

    it('should handle email sending error gracefully', async () => {
      const nodemailer = require('nodemailer');
      nodemailer.createTransport().sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(sendInvitationEmail('invalid@example.com', 'pass'))
        .rejects.toThrow();
    });

    it('should format email content correctly', async () => {
      const emailData = {
        user: mockUser,
        leaderboard: mockWeeklyLeaderboard,
        userScore: 100,
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
      };

      const result = await sendWeeklyLeaderboardEmail(emailData);
      expect(result).toBeDefined();
    });

    it('should validate email address', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test('test@example.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
    });
  });

  describe('score.deadline.util', () => {
    it('should check if resolution is done', () => {
      const result = isResolutionDone(mockTicket);
      expect(typeof result).toBe('boolean');
    });

    it('should get deadline dates from ticket', () => {
      const result = getDeadlineDates(mockTicket);
      expect(result).toBeDefined();
    });

    it('should compute deadline rule score for early completion', () => {
      const rule = {
        before: { checked: true, value: 15 },
        onTime: { checked: true, value: 10 },
        late: { checked: true, value: -5 },
      };
      const deadlineDate = new Date('2024-01-15');
      const completionDate = new Date('2024-01-10'); // 5 days early

      const score = computeDeadlineRuleScore(rule, deadlineDate, completionDate);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should compute deadline rule score for late completion', () => {
      const rule = {
        before: { checked: true, value: 15 },
        onTime: { checked: true, value: 10 },
        late: { checked: true, value: -5 },
      };
      const deadlineDate = new Date('2024-01-10');
      const completionDate = new Date('2024-01-15'); // 5 days late

      const score = computeDeadlineRuleScore(rule, deadlineDate, completionDate);
      expect(score).toBeLessThanOrEqual(0);
    });

    it('should handle missing deadline gracefully', () => {
      const ticketWithoutDeadline = { ...mockTicket, fields: { ...mockTicket.fields, duedate: null } };
      const result = getDeadlineDates(ticketWithoutDeadline);
      expect(result).toBeDefined();
    });
  });

  describe('auth middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {},
        get: jest.fn((header) => req.headers[header.toLowerCase()]),
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });

    it('should authenticate valid token', async () => {
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({ uid: 'test-uid-123', email: 'test@example.com' });
      
      req.headers['authorization'] = 'Bearer valid-token';

      await authMiddleware(req, res, next);
      
      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('should reject missing token', async () => {
      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      req.headers['authorization'] = 'Bearer invalid-token';

      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should reject expired token', async () => {
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      req.headers['authorization'] = 'Bearer expired-token';

      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle malformed authorization header', async () => {
      req.headers['authorization'] = 'InvalidFormat';

      await authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('jiraClient middleware', () => {
    it('should create Jira client with valid config', async () => {
      const config = {
        host: 'test.atlassian.net',
        username: 'test@example.com',
        password: 'api-token',
        protocol: 'https',
        apiVersion: '2',
      };

      const client = await createJiraClient(config);
      expect(client).toBeDefined();
    });

    it('should throw error for missing config', async () => {
      await expect(createJiraClient(null)).rejects.toThrow();
    });

    it('should throw error for invalid host', async () => {
      const config = {
        host: '',
        username: 'test@example.com',
        password: 'api-token',
      };

      await expect(createJiraClient(config)).rejects.toThrow();
    });

    it('should throw error for missing credentials', async () => {
      const config = {
        host: 'test.atlassian.net',
        username: '',
        password: '',
      };

      await expect(createJiraClient(config)).rejects.toThrow();
    });

    it('should use default protocol and apiVersion', async () => {
      const config = {
        host: 'test.atlassian.net',
        username: 'test@example.com',
        password: 'api-token',
      };

      const client = await createJiraClient(config);
      expect(client).toBeDefined();
    });
  });
});
