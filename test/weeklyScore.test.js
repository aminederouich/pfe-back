const { processWeeklyTopScores } = require('../services/weeklyScore.service');

// On mock firebase/firestore pour contrôler les retours
jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    ...actual,
    collection: jest.fn((name) => ({ name })),
    query: jest.fn((col) => ({ col })),
    where: jest.fn(() => ({})),
    getDocs: jest.fn(),
  };
});

// Mock User.findByjiraId + getDocs(users)
jest.mock('../models/user.model', () => {
  return class User {
    constructor(data) { Object.assign(this, data); }
    static async findByjiraId(jiraId) {
      const map = {
        jiraA: { firstName: 'Alice', email: 'alice@test.dev', jiraId: 'jiraA' },
        jiraB: { firstName: 'Bob', email: 'bob@test.dev', jiraId: 'jiraB' },
        jiraC: { firstName: 'Charly', email: 'charly@test.dev', jiraId: 'jiraC' },
      };
      return map[jiraId];
    }
  };
});

// Mock email util
jest.mock('../utils/email.util', () => ({
  sendWeeklyLeaderboardEmail: jest.fn(async () => true),
}));

const { getDocs, collection } = require('firebase/firestore');
const { sendWeeklyLeaderboardEmail } = require('../utils/email.util');

beforeEach(() => {
  // Première appel: scores
  getDocs
    .mockResolvedValueOnce({
      docs: [
        { data: () => ({ ownerId: 'jiraA', score: 10 }) },
        { data: () => ({ ownerId: 'jiraB', score: 30 }) },
        { data: () => ({ ownerId: 'jiraC', score: 20 }) },
        { data: () => ({ ownerId: 'jiraA', score: 15 }) },
      ],
    })
    // Deuxième appel: utilisateurs
    .mockResolvedValueOnce({
      docs: [
        { data: () => ({ firstName: 'Alice', email: 'alice@test.dev', jiraId: 'jiraA' }) },
        { data: () => ({ firstName: 'Bob', email: 'bob@test.dev', jiraId: 'jiraB' }) },
        { data: () => ({ firstName: 'Charly', email: 'charly@test.dev', jiraId: 'jiraC' }) },
      ],
    });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('processWeeklyTopScores', () => {
  it('calcule le top 3 et envoie des emails à tous les utilisateurs', async () => {
    const result = await processWeeklyTopScores();

    expect(result.leaderboard).toHaveLength(3);
    expect(result.leaderboard[0].name).toBeDefined();
    expect(sendWeeklyLeaderboardEmail).toHaveBeenCalledTimes(3); // 3 utilisateurs
    // Vérifie qu'un appel contient userScore correct (jiraA total 25)
    const aliceCall = sendWeeklyLeaderboardEmail.mock.calls.find(call => call[0].user.jiraId === 'jiraA');
    expect(aliceCall[0].userScore).toBe(25);
  });
});
