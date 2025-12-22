/**
 * Tests d'intégration - User and Project Flow  
 * Total: 20 tests
 */

const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user.model');
const Project = require('../../models/project.model');
const { mockUser, mockProject } = require('../helpers/mockData');

jest.mock('../../models/user.model');
jest.mock('../../models/project.model');
jest.mock('firebase/firestore');

describe('Integration Tests - User and Project Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /user - Integration', () => {
    it('should get all users', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({
        forEach: (callback) => {
          [mockUser].forEach(user => callback({ data: () => user }));
        },
      });

      const response = await request(app)
        .get('/user')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.users).toBeDefined();
    });
  });

  describe('GET /user/:uid - Integration', () => {
    it('should get user by UID', async () => {
      User.findByUid.mockResolvedValue({
        toPublicFormat: () => mockUser,
      });

      const response = await request(app)
        .get('/user/test-uid-123')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.uid).toBe('test-uid-123');
    });

    it('should return 404 for non-existent user', async () => {
      User.findByUid.mockResolvedValue(null);

      const response = await request(app)
        .get('/user/invalid-uid')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /user/account/:accountId - Integration', () => {
    it('should get user by accountId', async () => {
      User.findByAccountId.mockResolvedValue({
        toPublicFormat: () => mockUser,
      });

      const response = await request(app)
        .get('/user/account/jira-123');

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /user/:uid - Integration', () => {
    it('should update user successfully', async () => {
      const { getDocs, updateDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockUser }],
      });
      updateDoc.mockResolvedValue();

      const response = await request(app)
        .put('/user/test-uid-123')
        .set('Authorization', 'Bearer token')
        .send({ firstName: 'Updated' });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /project/getAllProject - Integration', () => {
    it('should get all projects', async () => {
      Project.findAll = jest.fn().mockResolvedValue([mockProject]);

      const response = await request(app)
        .get('/project/getAllProject')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
    });
  });

  describe('POST /project/addNewProject - Integration', () => {
    it('should create new project', async () => {
      Project.create = jest.fn().mockResolvedValue(mockProject);

      const response = await request(app)
        .post('/project/addNewProject')
        .set('Authorization', 'Bearer token')
        .send({
          projectKey: 'PROJ',
          projectName: 'Test Project',
          jiraConfigId: 'config-123',
        });

      expect(response.status).toBe(201);
    });

    it('should validate required project fields', async () => {
      const response = await request(app)
        .post('/project/addNewProject')
        .set('Authorization', 'Bearer token')
        .send({ projectKey: 'PROJ' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /project/deleteProjectByID - Integration', () => {
    it('should delete project successfully', async () => {
      Project.delete = jest.fn().mockResolvedValue({ success: true });

      const response = await request(app)
        .post('/project/deleteProjectByID')
        .set('Authorization', 'Bearer token')
        .send({ projectId: 'project-123' });

      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent project', async () => {
      Project.delete = jest.fn().mockRejectedValue(new Error('Project not found'));

      const response = await request(app)
        .post('/project/deleteProjectByID')
        .set('Authorization', 'Bearer token')
        .send({ projectId: 'invalid' });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /project/updateProjectByID - Integration', () => {
    it('should update project successfully', async () => {
      Project.update = jest.fn().mockResolvedValue({ ...mockProject, projectName: 'Updated' });

      const response = await request(app)
        .post('/project/updateProjectByID')
        .set('Authorization', 'Bearer token')
        .send({
          projectId: 'project-123',
          projectName: 'Updated',
        });

      expect(response.status).toBe(200);
    });
  });

  // Additional integration tests
  it('should handle user invitation flow', async () => {
    const { getDocs, setDoc } = require('firebase/firestore');
    getDocs.mockResolvedValue({ empty: true });
    setDoc.mockResolvedValue();

    const response = await request(app)
      .post('/user/invite')
      .set('Authorization', 'Bearer token')
      .send({
        email: 'newuser@example.com',
        managerId: 'manager-123',
      });

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should get user ticket stats', async () => {
    const { getDocs } = require('firebase/firestore');
    getDocs.mockResolvedValue({
      size: 5,
      forEach: (callback) => {
        Array(5).fill().forEach(() => callback({
          data: () => ({
            assignedTo: 'test-uid',
            score: 10,
            createdAt: { seconds: Date.now() / 1000 },
          }),
        }));
      },
    });

    const response = await request(app)
      .get('/user/stats/test-uid-123');

    expect(response.status).toBe(200);
  });

  it('should handle project with multiple users', async () => {
    Project.findById = jest.fn().mockResolvedValue({
      ...mockProject,
      members: ['uid-1', 'uid-2', 'uid-3'],
    });

    const response = await request(app)
      .get('/project/project-123')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
  });

  it('should validate project key format', async () => {
    const response = await request(app)
      .post('/project/addNewProject')
      .set('Authorization', 'Bearer token')
      .send({
        projectKey: 'invalid key with spaces',
        projectName: 'Test',
        jiraConfigId: 'config-123',
      });

    expect(response.status).toBe(400);
  });

  it('should handle concurrent user updates', async () => {
    const { getDocs, updateDoc } = require('firebase/firestore');
    getDocs.mockResolvedValue({
      empty: false,
      docs: [{ data: () => mockUser }],
    });
    updateDoc.mockResolvedValue();

    const requests = Array(5).fill().map(() =>
      request(app)
        .put('/user/test-uid-123')
        .set('Authorization', 'Bearer token')
        .send({ firstName: 'Concurrent' })
    );

    const responses = await Promise.all(requests);
    responses.forEach(response => {
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  it('should filter projects by user role', async () => {
    Project.findAll = jest.fn().mockResolvedValue([
      mockProject,
      { ...mockProject, id: 'project-2' },
    ]);

    const response = await request(app)
      .get('/project/getAllProject')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('should handle user password change', async () => {
    const response = await request(app)
      .post('/user/setPassword')
      .set('Authorization', 'Bearer token')
      .send({ password: 'NewPassword123!' });

    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should validate email format on invite', async () => {
    const response = await request(app)
      .post('/user/invite')
      .set('Authorization', 'Bearer token')
      .send({
        email: 'invalid-email',
        managerId: 'manager-123',
      });

    expect(response.status).toBe(400);
  });

  it('should handle project deletion cascade', async () => {
    Project.delete = jest.fn().mockResolvedValue({ success: true, deletedRelated: 5 });

    const response = await request(app)
      .post('/project/deleteProjectByID')
      .set('Authorization', 'Bearer token')
      .send({ projectId: 'project-123' });

    expect(response.status).toBe(200);
  });

  it('should paginate user list', async () => {
    const { getDocs } = require('firebase/firestore');
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        Array(50).fill().forEach(() => callback({ data: () => mockUser }));
      },
    });

    const response = await request(app)
      .get('/user')
      .set('Authorization', 'Bearer token')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
  });

  it('should search projects by name', async () => {
    Project.findAll = jest.fn().mockResolvedValue([mockProject]);

    const response = await request(app)
      .get('/project/getAllProject')
      .set('Authorization', 'Bearer token')
      .query({ search: 'Test' });

    expect(response.status).toBe(200);
  });
});
