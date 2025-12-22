/**
 * Tests unitaires pour jiraConfig.service.js
 * Total: 4 tests
 */

const jiraConfigService = require('../../services/jiraConfig.service');
const JiraConfig = require('../../models/jiraConfig.model');
const { mockJiraConfig } = require('../helpers/mockData');

jest.mock('../../models/jiraConfig.model');

describe('jiraConfig.service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createConfig', () => {
    it('should create jira config successfully', async () => {
      JiraConfig.create = jest.fn().mockResolvedValue(mockJiraConfig);

      const configData = {
        host: 'test.atlassian.net',
        username: 'test@example.com',
        password: 'test-token',
        protocol: 'https',
      };

      const result = await jiraConfigService.createConfig(configData);

      expect(result).toEqual(mockJiraConfig);
      expect(JiraConfig.create).toHaveBeenCalledWith(configData);
    });
  });

  describe('getConfigById', () => {
    it('should retrieve config by ID', async () => {
      JiraConfig.findById = jest.fn().mockResolvedValue(mockJiraConfig);

      const result = await jiraConfigService.getConfigById('config-123');

      expect(result).toEqual(mockJiraConfig);
      expect(JiraConfig.findById).toHaveBeenCalledWith('config-123');
    });
  });

  describe('updateConfig', () => {
    it('should update config successfully', async () => {
      const updatedConfig = { ...mockJiraConfig, host: 'updated.atlassian.net' };
      JiraConfig.update = jest.fn().mockResolvedValue(updatedConfig);

      const result = await jiraConfigService.updateConfig('config-123', { host: 'updated.atlassian.net' });

      expect(result).toEqual(updatedConfig);
      expect(JiraConfig.update).toHaveBeenCalled();
    });
  });

  describe('deleteConfig', () => {
    it('should delete config successfully', async () => {
      JiraConfig.delete = jest.fn().mockResolvedValue({ success: true });

      const result = await jiraConfigService.deleteConfig('config-123');

      expect(result.success).toBe(true);
      expect(JiraConfig.delete).toHaveBeenCalledWith('config-123');
    });
  });
});
