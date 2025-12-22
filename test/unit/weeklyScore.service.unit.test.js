/**
 * Tests unitaires pour weeklyScore.service.js
 * Total: 10 tests
 */

const { processWeeklyTopScores } = require('../../services/weeklyScore.service');
const User = require('../../models/user.model');
const WeeklyTopScores = require('../../models/WeeklyTopScores.model');
const { sendWeeklyLeaderboardEmail } = require('../../utils/email.util');
const { getDocs, collection, query, where } = require('firebase/firestore');
const { mockUsers, mockWeeklyLeaderboard } = require('../helpers/mockData');

jest.mock('../../models/user.model');
jest.mock('../../models/WeeklyTopScores.model');
jest.mock('../../utils/email.util');
jest.mock('firebase/firestore');
jest.mock('node-cron');

describe('weeklyScore.service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processWeeklyTopScores', () => {
    it('should process weekly scores and send emails successfully', async () => {
      const mockScoresDocs = [
        { data: () => ({ ownerId: 'jira-123', score: 50, dateAffection: new Date() }) },
        { data: () => ({ ownerId: 'jira-123', score: 100, dateAffection: new Date() }) },
        { data: () => ({ ownerId: 'jira-456', score: 120, dateAffection: new Date() }) },
      ];

      getDocs.mockResolvedValueOnce({ docs: mockScoresDocs })
        .mockResolvedValueOnce({ docs: mockUsers.map(u => ({ data: () => u })) });

      User.findByjiraId.mockImplementation(async (jiraId) => {
        return mockUsers.find(u => u.jiraId === jiraId);
      });

      WeeklyTopScores.create.mockResolvedValue({ id: 'weekly-123' });
      sendWeeklyLeaderboardEmail.mockResolvedValue();

      const result = await processWeeklyTopScores();

      expect(result.leaderboard).toBeDefined();
      expect(result.leaderboard.length).toBeGreaterThan(0);
      expect(result.sent).toBeGreaterThan(0);
      expect(WeeklyTopScores.create).toHaveBeenCalled();
      expect(sendWeeklyLeaderboardEmail).toHaveBeenCalled();
    });

    it('should return empty leaderboard when no scores', async () => {
      getDocs.mockResolvedValueOnce({ docs: [] });

      const result = await processWeeklyTopScores();

      expect(result.leaderboard).toEqual([]);
      expect(result.sent).toBe(0);
      expect(WeeklyTopScores.create).not.toHaveBeenCalled();
    });

    it('should handle users without email', async () => {
      const mockScoresDocs = [
        { data: () => ({ ownerId: 'jira-123', score: 150, dateAffection: new Date() }) },
      ];

      const usersWithoutEmail = [{ ...mockUsers[0], email: null }];

      getDocs.mockResolvedValueOnce({ docs: mockScoresDocs })
        .mockResolvedValueOnce({ docs: usersWithoutEmail.map(u => ({ data: () => u })) });

      User.findByjiraId.mockResolvedValue(mockUsers[0]);
      WeeklyTopScores.create.mockResolvedValue({ id: 'weekly-123' });

      const result = await processWeeklyTopScores();

      expect(result.sent).toBe(0); // No emails sent because no valid email
    });

    it('should continue on individual email failure', async () => {
      const mockScoresDocs = [
        { data: () => ({ ownerId: 'jira-123', score: 150, dateAffection: new Date() }) },
      ];

      getDocs.mockResolvedValueOnce({ docs: mockScoresDocs })
        .mockResolvedValueOnce({ docs: [mockUsers[0], mockUsers[1]].map(u => ({ data: () => u })) });

      User.findByjiraId.mockResolvedValue(mockUsers[0]);
      WeeklyTopScores.create.mockResolvedValue({ id: 'weekly-123' });
      
      sendWeeklyLeaderboardEmail
        .mockRejectedValueOnce(new Error('Email failed'))
        .mockResolvedValueOnce();

      const result = await processWeeklyTopScores();

      expect(result.sent).toBe(1); // One email sent successfully
    });

    it('should limit leaderboard to top 3 users', async () => {
      const mockScoresDocs = [
        { data: () => ({ ownerId: 'jira-123', score: 150, dateAffection: new Date() }) },
        { data: () => ({ ownerId: 'jira-456', score: 140, dateAffection: new Date() }) },
        { data: () => ({ ownerId: 'jira-789', score: 130, dateAffection: new Date() }) },
        { data: () => ({ ownerId: 'jira-999', score: 120, dateAffection: new Date() }) },
      ];

      getDocs.mockResolvedValueOnce({ docs: mockScoresDocs })
        .mockResolvedValueOnce({ docs: mockUsers.map(u => ({ data: () => u })) });

      User.findByjiraId.mockImplementation(async (jiraId) => {
        return mockUsers.find(u => u.jiraId === jiraId) || { email: 'other@example.com' };
      });

      WeeklyTopScores.create.mockResolvedValue({ id: 'weekly-123' });
      sendWeeklyLeaderboardEmail.mockResolvedValue();

      const result = await processWeeklyTopScores();

      expect(result.leaderboard.length).toBe(3);
      expect(result.leaderboard[0].rank).toBe(1);
      expect(result.leaderboard[1].rank).toBe(2);
      expect(result.leaderboard[2].rank).toBe(3);
    });

    it('should handle scores without ownerId', async () => {
      const mockScoresDocs = [
        { data: () => ({ score: 50, dateAffection: new Date() }) }, // No ownerId
        { data: () => ({ ownerId: 'jira-123', score: 100, dateAffection: new Date() }) },
      ];

      getDocs.mockResolvedValueOnce({ docs: mockScoresDocs })
        .mockResolvedValueOnce({ docs: mockUsers.map(u => ({ data: () => u })) });

      User.findByjiraId.mockResolvedValue(mockUsers[0]);
      WeeklyTopScores.create.mockResolvedValue({ id: 'weekly-123' });
      sendWeeklyLeaderboardEmail.mockResolvedValue();

      const result = await processWeeklyTopScores();

      expect(result.leaderboard.length).toBeGreaterThan(0);
    });

    it('should aggregate multiple scores per user', async () => {
      const mockScoresDocs = [
        { data: () => ({ ownerId: 'jira-123', score: 50, dateAffection: new Date() }) },
        { data: () => ({ ownerId: 'jira-123', score: 100, dateAffection: new Date() }) },
        { data: () => ({ ownerId: 'jira-123', score: 50, dateAffection: new Date() }) },
      ];

      getDocs.mockResolvedValueOnce({ docs: mockScoresDocs })
        .mockResolvedValueOnce({ docs: mockUsers.map(u => ({ data: () => u })) });

      User.findByjiraId.mockResolvedValue(mockUsers[0]);
      WeeklyTopScores.create.mockResolvedValue({ id: 'weekly-123' });
      sendWeeklyLeaderboardEmail.mockResolvedValue();

      const result = await processWeeklyTopScores();

      expect(result.leaderboard[0].score).toBe(200); // 50 + 100 + 50
    });

    it('should handle WeeklyTopScores.create failure gracefully', async () => {
      const mockScoresDocs = [
        { data: () => ({ ownerId: 'jira-123', score: 150, dateAffection: new Date() }) },
      ];

      getDocs.mockResolvedValueOnce({ docs: mockScoresDocs })
        .mockResolvedValueOnce({ docs: mockUsers.map(u => ({ data: () => u })) });

      User.findByjiraId.mockResolvedValue(mockUsers[0]);
      WeeklyTopScores.create.mockRejectedValue(new Error('Database error'));
      sendWeeklyLeaderboardEmail.mockResolvedValue();

      // Should not throw, should continue sending emails
      const result = await processWeeklyTopScores();

      expect(result.leaderboard).toBeDefined();
      expect(sendWeeklyLeaderboardEmail).toHaveBeenCalled();
    });

    it('should use correct week boundaries', async () => {
      const mockScoresDocs = [
        { data: () => ({ ownerId: 'jira-123', score: 150, dateAffection: new Date() }) },
      ];

      getDocs.mockResolvedValueOnce({ docs: mockScoresDocs })
        .mockResolvedValueOnce({ docs: mockUsers.map(u => ({ data: () => u })) });

      User.findByjiraId.mockResolvedValue(mockUsers[0]);
      WeeklyTopScores.create.mockResolvedValue({ id: 'weekly-123' });
      sendWeeklyLeaderboardEmail.mockResolvedValue();

      await processWeeklyTopScores();

      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('dateAffection', '>=', expect.any(Date));
    });

    it('should handle empty users snapshot', async () => {
      const mockScoresDocs = [
        { data: () => ({ ownerId: 'jira-123', score: 150, dateAffection: new Date() }) },
      ];

      getDocs.mockResolvedValueOnce({ docs: mockScoresDocs })
        .mockResolvedValueOnce(null); // Null snapshot

      User.findByjiraId.mockResolvedValue(mockUsers[0]);
      WeeklyTopScores.create.mockResolvedValue({ id: 'weekly-123' });

      const result = await processWeeklyTopScores();

      expect(result.sent).toBe(0); // No users to send emails to
    });
  });
});
