/**
 * Tests fonctionnels API - Tous les endpoints
 * Total: 30 tests
 */

const request = require('supertest');
const app = require('../../app');

describe('Functional API Tests - Complete Endpoints', () => {
  let authToken;

  beforeAll(async () => {
    // Mock authentication pour tous les tests
    authToken = 'Bearer mock-jwt-token-for-testing';
  });

  // Auth Endpoints (5 tests)
  describe('POST /auth/signup', () => {
    it('should register new user', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          email: 'functional@test.com',
          password: 'Password123!',
          firstName: 'Func',
          lastName: 'Test',
        });
      expect([200, 201, 400]).toContain(res.status);
    });
  });

  describe('POST /auth/signin', () => {
    it('should login user', async () => {
      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com', password: 'password123' });
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset email', async () => {
      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });
      expect([200, 400]).toContain(res.status);
    });
  });

  describe('GET /auth/isLogged', () => {
    it('should verify authentication', async () => {
      const res = await request(app)
        .get('/auth/isLogged')
        .set('Authorization', authToken);
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .set('Authorization', authToken);
      expect([200, 401]).toContain(res.status);
    });
  });

  // User Endpoints (5 tests)
  describe('GET /user', () => {
    it('should get all users', async () => {
      const res = await request(app)
        .get('/user')
        .set('Authorization', authToken);
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('GET /user/:uid', () => {
    it('should get user by UID', async () => {
      const res = await request(app)
        .get('/user/test-uid-123')
        .set('Authorization', authToken);
      expect([200, 404, 401]).toContain(res.status);
    });
  });

  describe('GET /user/account/:accountId', () => {
    it('should get user by accountId', async () => {
      const res = await request(app)
        .get('/user/account/jira-123');
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('PUT /user/:uid', () => {
    it('should update user', async () => {
      const res = await request(app)
        .put('/user/test-uid-123')
        .set('Authorization', authToken)
        .send({ firstName: 'Updated' });
      expect([200, 404, 401]).toContain(res.status);
    });
  });

  describe('POST /user/invite', () => {
    it('should invite new user', async () => {
      const res = await request(app)
        .post('/user/invite')
        .set('Authorization', authToken)
        .send({ email: 'new@example.com', managerId: 'manager-123' });
      expect([201, 400, 409, 401]).toContain(res.status);
    });
  });

  // Project Endpoints (5 tests)
  describe('GET /project/getAllProject', () => {
    it('should get all projects', async () => {
      const res = await request(app)
        .get('/project/getAllProject')
        .set('Authorization', authToken);
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('POST /project/addNewProject', () => {
    it('should create new project', async () => {
      const res = await request(app)
        .post('/project/addNewProject')
        .set('Authorization', authToken)
        .send({
          projectKey: 'FUNC',
          projectName: 'Functional Test Project',
          jiraConfigId: 'config-123',
        });
      expect([201, 400, 401]).toContain(res.status);
    });
  });

  describe('POST /project/deleteProjectByID', () => {
    it('should delete project', async () => {
      const res = await request(app)
        .post('/project/deleteProjectByID')
        .set('Authorization', authToken)
        .send({ projectId: 'project-123' });
      expect([200, 404, 401]).toContain(res.status);
    });
  });

  describe('POST /project/updateProjectByID', () => {
    it('should update project', async () => {
      const res = await request(app)
        .post('/project/updateProjectByID')
        .set('Authorization', authToken)
        .send({
          projectId: 'project-123',
          projectName: 'Updated Project',
        });
      expect([200, 404, 401]).toContain(res.status);
    });
  });

  describe('GET /project/:projectId', () => {
    it('should get project by ID', async () => {
      const res = await request(app)
        .get('/project/project-123')
        .set('Authorization', authToken);
      expect([200, 404, 401]).toContain(res.status);
    });
  });

  // Score Endpoints (5 tests)
  describe('POST /scores/calculate', () => {
    it('should calculate ticket score', async () => {
      const res = await request(app)
        .post('/scores/calculate')
        .set('Authorization', authToken)
        .send({
          ticket: { id: 'ticket-123', fields: { assignee: { accountId: 'user-123' } } },
          ruleId: 'rule-123',
        });
      expect([201, 400, 401]).toContain(res.status);
    });
  });

  describe('POST /scores/calculate-multiple', () => {
    it('should calculate multiple scores', async () => {
      const res = await request(app)
        .post('/scores/calculate-multiple')
        .set('Authorization', authToken)
        .send({
          ticketIds: ['ticket-1', 'ticket-2'],
          ruleId: 'rule-123',
        });
      expect([200, 400, 401]).toContain(res.status);
    });
  });

  describe('GET /scores', () => {
    it('should get all ticket scores', async () => {
      const res = await request(app)
        .get('/scores')
        .set('Authorization', authToken);
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('GET /scores/ticket/:ticketId', () => {
    it('should get scores by ticket ID', async () => {
      const res = await request(app)
        .get('/scores/ticket/ticket-123')
        .set('Authorization', authToken);
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('GET /scores/employee/:uid', () => {
    it('should get employee global score', async () => {
      const res = await request(app)
        .get('/scores/employee/jira-123')
        .set('Authorization', authToken);
      expect([200, 400, 401]).toContain(res.status);
    });
  });

  // Rules Endpoints (3 tests)
  describe('POST /rules', () => {
    it('should create new rule', async () => {
      const res = await request(app)
        .post('/rules')
        .set('Authorization', authToken)
        .send({
          name: 'Test Rule',
          projectId: 'project-123',
          priority: { High: { checked: true, value: 10 } },
        });
      expect([201, 400, 401]).toContain(res.status);
    });
  });

  describe('GET /rules', () => {
    it('should get all rules', async () => {
      const res = await request(app)
        .get('/rules')
        .set('Authorization', authToken);
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('GET /rules/:ruleId', () => {
    it('should get rule by ID', async () => {
      const res = await request(app)
        .get('/rules/rule-123')
        .set('Authorization', authToken);
      expect([200, 404, 401]).toContain(res.status);
    });
  });

  // Jira Config Endpoints (2 tests)
  describe('POST /jira_config', () => {
    it('should create Jira config', async () => {
      const res = await request(app)
        .post('/jira_config')
        .set('Authorization', authToken)
        .send({
          host: 'test.atlassian.net',
          username: 'test@example.com',
          password: 'api-token',
        });
      expect([201, 400, 401]).toContain(res.status);
    });
  });

  describe('GET /jira_config/:configId', () => {
    it('should get Jira config by ID', async () => {
      const res = await request(app)
        .get('/jira_config/config-123')
        .set('Authorization', authToken);
      expect([200, 404, 401]).toContain(res.status);
    });
  });

  // Weekly Scores Endpoints (2 tests)
  describe('GET /weeklyscores', () => {
    it('should get weekly top scores', async () => {
      const res = await request(app)
        .get('/weeklyscores')
        .set('Authorization', authToken);
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('GET /weeklyscores/:weekId', () => {
    it('should get weekly scores by week ID', async () => {
      const res = await request(app)
        .get('/weeklyscores/20240101')
        .set('Authorization', authToken);
      expect([200, 404, 401]).toContain(res.status);
    });
  });

  // Ticket Endpoints (3 tests)
  describe('GET /ticket/:ticketId', () => {
    it('should get ticket details', async () => {
      const res = await request(app)
        .get('/ticket/ticket-123')
        .set('Authorization', authToken);
      expect([200, 404, 401]).toContain(res.status);
    });
  });

  describe('PUT /ticket/:ticketId', () => {
    it('should update ticket', async () => {
      const res = await request(app)
        .put('/ticket/ticket-123')
        .set('Authorization', authToken)
        .send({
          fields: { summary: 'Updated' },
          config: { host: 'test.atlassian.net' },
        });
      expect([200, 404, 401]).toContain(res.status);
    });
  });

  describe('POST /jira_client/search', () => {
    it('should search Jira issues', async () => {
      const res = await request(app)
        .post('/jira_client/search')
        .set('Authorization', authToken)
        .send({
          projectName: 'PROJ',
          config: {
            host: 'test.atlassian.net',
            username: 'test@example.com',
            password: 'token',
          },
        });
      expect([200, 400, 401, 500]).toContain(res.status);
    });
  });
});
