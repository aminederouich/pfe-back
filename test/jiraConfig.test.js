const request = require('supertest');
const express = require('express');

const mockSave = jest.fn();
const mockJiraConfigModel = jest
  .fn()
  .mockImplementation(() => ({
    save: mockSave,
  }));

mockJiraConfigModel.findAll = jest.fn();
mockJiraConfigModel.findByHost = jest.fn();
mockJiraConfigModel.deleteById = jest.fn();
mockJiraConfigModel.updateById = jest.fn();
mockJiraConfigModel.validateConfigData = jest.fn();
mockJiraConfigModel.testConnection = jest.fn();
mockJiraConfigModel.findById = jest.fn();
mockJiraConfigModel.findEnabledConfigs = jest.fn();

// Mock simple du middleware d'authentification
const mockAuthMiddleware = (req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
};

// Mocks définis avant l'importation des modules
jest.mock('../models/jiraConfig.model', () => mockJiraConfigModel);
jest.mock('../middleware/auth', () => mockAuthMiddleware);

// Import des routes après les mocks
const jiraConfigRoutes = require('../routes/jira_config.routes');
const JiraConfig = require('../models/jiraConfig.model');

describe('Jira Config Routes Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/jira-config', jiraConfigRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockJiraConfigModel.mockClear();
    mockSave.mockReset();
    mockJiraConfigModel.mockImplementation(() => ({
      save: mockSave,
    }));
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

      JiraConfig.findAll.mockResolvedValue(mockConfigs);

      const response = await request(app)
        .get('/jira-config/getAllConfig')
        .expect(200);

      expect(response.body).toEqual({
        error: false,
        message: 'Jira client configuration retrieved successfully',
        data: mockConfigs
      });
      expect(JiraConfig.findAll).toHaveBeenCalled();
    });

    test('should handle errors when retrieving configurations', async () => {
      JiraConfig.findAll.mockRejectedValue(new Error('Database error'));

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

      JiraConfig.validateConfigData.mockReturnValue(null);
      JiraConfig.findByHost.mockResolvedValue(false);
      mockSave.mockResolvedValue(mockNewConfig);

      const response = await request(app)
        .post('/jira-config/addConfig')
        .send(configData)
        .expect(201);

      expect(response.body).toEqual({
        error: false,
        message: 'Jira client configuration added successfully',
        data: mockNewConfig
      });
      expect(JiraConfig.validateConfigData).toHaveBeenCalledWith(configData);
      expect(JiraConfig.findByHost).toHaveBeenCalledWith(configData.host);
      expect(mockJiraConfigModel).toHaveBeenCalledWith(configData);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('POST /jira-config/deleteConfigByID', () => {
    test('should delete configurations successfully', async () => {
      const configIds = [1, 2, 3];

      JiraConfig.deleteById.mockResolvedValue();

      const response = await request(app)
        .post('/jira-config/deleteConfigByID')
        .send({ ids: configIds })
        .expect(200);

      expect(response.body).toEqual({
        error: false,
        message: 'Jira client configuration deleted successfully'
      });
      expect(JiraConfig.deleteById).toHaveBeenCalledTimes(configIds.length);
      configIds.forEach((id, index) => {
        expect(JiraConfig.deleteById).toHaveBeenNthCalledWith(index + 1, id);
      });
    });
  });
});
