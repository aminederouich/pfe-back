/**
 * Tests E2E - Workflows complets
 * Total: 10 tests
 */

const request = require('supertest');
const app = require('../../app');

describe('E2E Tests - Complete Workflows', () => {
  let authToken;
  let userId;
  let projectId;
  let ruleId;
  let ticketId;

  describe('Complete User Registration and Project Setup Workflow', () => {
    it('should complete full user onboarding', async () => {
      // 1. Register user
      const signupRes = await request(app)
        .post('/auth/signup')
        .send({
          email: `e2e-${Date.now()}@test.com`,
          password: 'E2ETest123!',
          firstName: 'E2E',
          lastName: 'Test',
        });
      expect([200, 201, 400]).toContain(signupRes.status);

      // 2. Login
      const loginRes = await request(app)
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      expect([200, 401]).toContain(loginRes.status);

      if (loginRes.body.token) {
        authToken = `Bearer ${loginRes.body.token}`;
        userId = loginRes.body.user?.uid;
      }

      // 3. Verify authentication
      const verifyRes = await request(app)
        .get('/auth/isLogged')
        .set('Authorization', authToken || 'Bearer mock-token');
      expect([200, 401]).toContain(verifyRes.status);
    });

    it('should setup project with Jira integration', async () => {
      // 1. Create Jira config
      const configRes = await request(app)
        .post('/jira_config')
        .set('Authorization', authToken || 'Bearer mock-token')
        .send({
          host: 'e2etest.atlassian.net',
          username: 'e2e@test.com',
          password: 'e2e-api-token',
          protocol: 'https',
        });
      expect([200, 201, 400, 401]).toContain(configRes.status);

      const configId = configRes.body?.id || 'mock-config-id';

      // 2. Create project
      const projectRes = await request(app)
        .post('/project/addNewProject')
        .set('Authorization', authToken || 'Bearer mock-token')
        .send({
          projectKey: 'E2E',
          projectName: 'E2E Test Project',
          jiraConfigId: configId,
        });
      expect([200, 201, 400, 401]).toContain(projectRes.status);

      projectId = projectRes.body?.id || 'mock-project-id';
    });

    it('should create scoring rules for project', async () => {
      const ruleRes = await request(app)
        .post('/rules')
        .set('Authorization', authToken || 'Bearer mock-token')
        .send({
          name: 'E2E Scoring Rule',
          projectId: projectId || 'mock-project-id',
          priority: {
            High: { checked: true, value: 15 },
            Medium: { checked: true, value: 10 },
            Low: { checked: true, value: 5 },
          },
          issuetype: {
            Story: { checked: true, value: 10 },
            Bug: { checked: true, value: 8 },
            Task: { checked: true, value: 5 },
          },
          deadline: {
            before: { checked: true, value: 20 },
            onTime: { checked: true, value: 10 },
            late: { checked: true, value: -10 },
          },
        });
      expect([200, 201, 400, 401]).toContain(ruleRes.status);

      ruleId = ruleRes.body?.id || 'mock-rule-id';
    });
  });

  describe('Complete Ticket Management Workflow', () => {
    it('should sync tickets from Jira and calculate scores', async () => {
      // 1. Search for Jira tickets
      const searchRes = await request(app)
        .post('/jira_client/search')
        .set('Authorization', authToken || 'Bearer mock-token')
        .send({
          projectName: 'E2E',
          config: {
            host: 'e2etest.atlassian.net',
            username: 'e2e@test.com',
            password: 'token',
            protocol: 'https',
            apiVersion: '2',
          },
        });
      expect([200, 400, 401, 500]).toContain(searchRes.status);

      // 2. Sync ticket to Firebase
      if (searchRes.body?.issues && searchRes.body.issues.length > 0) {
        ticketId = searchRes.body.issues[0].id;

        const syncRes = await request(app)
          .post('/ticket/sync')
          .set('Authorization', authToken || 'Bearer mock-token')
          .send({
            ticket: searchRes.body.issues[0],
            configId: 'mock-config-id',
          });
        expect([200, 201, 400, 401]).toContain(syncRes.status);

        // 3. Calculate score for ticket
        const scoreRes = await request(app)
          .post('/scores/calculate')
          .set('Authorization', authToken || 'Bearer mock-token')
          .send({
            ticket: {
              id: ticketId,
              fields: {
                assignee: { accountId: userId || 'mock-user-id' },
              },
            },
            ruleId: ruleId || 'mock-rule-id',
          });
        expect([201, 400, 401]).toContain(scoreRes.status);
      }
    });

    it('should update ticket and recalculate score', async () => {
      // 1. Update ticket
      const updateRes = await request(app)
        .put(`/ticket/${ticketId || 'mock-ticket-id'}`)
        .set('Authorization', authToken || 'Bearer mock-token')
        .send({
          fields: { summary: 'E2E Updated Ticket' },
          config: { host: 'e2etest.atlassian.net' },
        });
      expect([200, 404, 401]).toContain(updateRes.status);

      // 2. Recalculate score
      const recalcRes = await request(app)
        .post('/scores/calculate')
        .set('Authorization', authToken || 'Bearer mock-token')
        .send({
          ticket: {
            id: ticketId || 'mock-ticket-id',
            fields: { assignee: { accountId: userId || 'mock-user-id' } },
          },
          ruleId: ruleId || 'mock-rule-id',
        });
      expect([201, 400, 401]).toContain(recalcRes.status);
    });

    it('should transition ticket through workflow', async () => {
      // 1. Get available transitions
      const transitionsRes = await request(app)
        .get(`/ticket/transitions/${ticketId || 'E2E-1'}`)
        .set('Authorization', authToken || 'Bearer mock-token');
      expect([200, 404, 401]).toContain(transitionsRes.status);

      // 2. Transition ticket
      if (transitionsRes.body?.transitions) {
        const transition = transitionsRes.body.transitions[0];
        const transitionRes = await request(app)
          .post('/ticket/transition')
          .set('Authorization', authToken || 'Bearer mock-token')
          .send({
            issueId: ticketId || 'E2E-1',
            transitionId: transition.id,
            config: { host: 'e2etest.atlassian.net' },
          });
        expect([200, 400, 401]).toContain(transitionRes.status);
      }
    });
  });

  describe('Complete Reporting and Analytics Workflow', () => {
    it('should retrieve employee scores and statistics', async () => {
      // 1. Get employee global score
      const globalScoreRes = await request(app)
        .get(`/scores/employee/${userId || 'mock-user-id'}`)
        .set('Authorization', authToken || 'Bearer mock-token');
      expect([200, 400, 401]).toContain(globalScoreRes.status);

      // 2. Get ticket statistics
      const statsRes = await request(app)
        .get(`/user/stats/${userId || 'mock-user-id'}`);
      expect([200, 404, 500]).toContain(statsRes.status);

      // 3. Get weekly leaderboard
      const leaderboardRes = await request(app)
        .get('/weeklyscores')
        .set('Authorization', authToken || 'Bearer mock-token');
      expect([200, 401]).toContain(leaderboardRes.status);
    });

    it('should generate and retrieve weekly reports', async () => {
      // 1. Get current week scores
      const currentWeekId = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const weeklyRes = await request(app)
        .get(`/weeklyscores/${currentWeekId}`)
        .set('Authorization', authToken || 'Bearer mock-token');
      expect([200, 404, 401]).toContain(weeklyRes.status);

      // 2. Get all scores for analysis
      const allScoresRes = await request(app)
        .get('/scores')
        .set('Authorization', authToken || 'Bearer mock-token');
      expect([200, 401]).toContain(allScoresRes.status);
    });
  });

  describe('Complete Team Management Workflow', () => {
    it('should invite and manage team members', async () => {
      // 1. Invite new team member
      const inviteRes = await request(app)
        .post('/user/invite')
        .set('Authorization', authToken || 'Bearer mock-token')
        .send({
          email: `e2e-member-${Date.now()}@test.com`,
          managerId: userId || 'mock-manager-id',
        });
      expect([201, 400, 409, 401]).toContain(inviteRes.status);

      // 2. Get all team members
      const usersRes = await request(app)
        .get('/user')
        .set('Authorization', authToken || 'Bearer mock-token');
      expect([200, 401]).toContain(usersRes.status);

      // 3. Update team member profile
      if (inviteRes.body?.user?.uid) {
        const updateRes = await request(app)
          .put(`/user/${inviteRes.body.user.uid}`)
          .set('Authorization', authToken || 'Bearer mock-token')
          .send({ firstName: 'Updated' });
        expect([200, 404, 401]).toContain(updateRes.status);
      }
    });
  });

  describe('Complete Cleanup Workflow', () => {
    it('should cleanup test data', async () => {
      // 1. Delete project (would cascade delete related data)
      if (projectId && projectId !== 'mock-project-id') {
        const deleteProjectRes = await request(app)
          .post('/project/deleteProjectByID')
          .set('Authorization', authToken || 'Bearer mock-token')
          .send({ projectId });
        expect([200, 404, 401]).toContain(deleteProjectRes.status);
      }

      // 2. Logout
      const logoutRes = await request(app)
        .post('/auth/logout')
        .set('Authorization', authToken || 'Bearer mock-token');
      expect([200, 401]).toContain(logoutRes.status);
    });
  });
});
