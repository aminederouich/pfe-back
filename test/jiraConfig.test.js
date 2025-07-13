const request = require('supertest');
const express = require('express');

// Mock du service jiraConfig
const mockJiraConfigService = {
  testConnection: jest.fn(),
  getAllConfigs: jest.fn(),
  getEnabledConfigs: jest.fn(),
  getConfigById: jest.fn(),
  createConfig: jest.fn(),
  deleteConfigById: jest.fn(),
  updateConfigById: jest.fn(),
  validateConfigData: jest.fn()
};

// Mock simple du middleware d'authentification
const mockAuthMiddleware = (req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
};

// Mocks définis avant l'importation des modules
jest.mock('../services/jiraConfig.service', () => mockJiraConfigService);
jest.mock('../middleware/auth', () => mockAuthMiddleware);

// Import des routes après les mocks
const jiraConfigRoutes = require('../routes/jira_config.routes');

describe('Jira Config Routes Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/jira-config', jiraConfigRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /jira-config/getAllConfig', () => {
    test('should retrieve all configurations successfully', async () => {
      const mockConfigs = [
        {
          id: 1,
          host: 'https://test1.atlassian.net',
          username: 'test1@example.com',
          isEnabled: true
        }
      ];

      mockJiraConfigService.getAllConfigs.mockResolvedValue(mockConfigs);

      const response = await request(app)
        .get('/jira-config/getAllConfig')
        .expect(200);

      expect(response.body).toEqual({
        error: false,
        message: 'Jira client configuration retrieved successfully',
        data: mockConfigs
      });
      expect(mockJiraConfigService.getAllConfigs).toHaveBeenCalled();
    });

    test('should handle errors when retrieving configurations', async () => {
      mockJiraConfigService.getAllConfigs.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/jira-config/getAllConfig')
        .expect(500);

      expect(response.body).toEqual({
        error: true,
        message: 'Database error'
      });
    });
  });

  describe('POST /jira-config/addConfig', () => {
    test('should add configuration successfully', async () => {
      const configData = {
        host: 'https://test.atlassian.net',
        username: 'test@example.com',
        apiToken: 'test-api-token',
        isEnabled: true
      };

      const mockNewConfig = {
        id: 1,
        ...configData
      };

      mockJiraConfigService.validateConfigData.mockReturnValue(null);
      mockJiraConfigService.createConfig.mockResolvedValue(mockNewConfig);

      const response = await request(app)
        .post('/jira-config/addConfig')
        .send(configData)
        .expect(201);

      expect(response.body).toEqual({
        error: false,
        message: 'Jira client configuration added successfully',
        data: mockNewConfig
      });
      expect(mockJiraConfigService.validateConfigData).toHaveBeenCalledWith(configData);
      expect(mockJiraConfigService.createConfig).toHaveBeenCalledWith(configData);
    });
  });

  describe('POST /jira-config/deleteConfigByID', () => {
    test('should delete configurations successfully', async () => {
      const configIds = [1, 2, 3];

      mockJiraConfigService.deleteConfigById.mockResolvedValue();

      const response = await request(app)
        .post('/jira-config/deleteConfigByID')
        .send({ ids: configIds })
        .expect(200);

      expect(response.body).toEqual({
        error: false,
        message: 'Jira client configuration deleted successfully'
      });
      expect(mockJiraConfigService.deleteConfigById).toHaveBeenCalledWith(configIds);
    });
  });
});
