const authMiddleware = require('../middleware/auth');
const HTTP_STATUS = require('../constants/httpStatus');
const JiraConfig = require('../models/jiraConfig.model');

exports.checkConncetionJiraAPI = [
  authMiddleware,
  async(req, res) => {
    try {
      const result = await JiraConfig.testConnection(req.body);
      res.status(HTTP_STATUS.OK).json({
        error: false,
        message: result.message,
        data: result.userInfo,
      });
    } catch (error) {
      console.error('Connection test error:', error);

      // Validation error
      if (error.message.includes('required')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: error.message,
        });
      }

      // Connection error
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        error: true,
        message: error.message,
      });
    }
  },
];

exports.getAllConfigJiraClient = [
  authMiddleware,
  async(req, res) => {
    try {
      const configs = await JiraConfig.findAll();
      res.status(HTTP_STATUS.OK).json({
        error: false,
        message: 'Jira client configuration retrieved successfully',
        data: configs,
      });
    } catch (error) {
      console.error('Error retrieving Jira client configuration:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: error.message,
      });
    }
  },
];

exports.addConfigJiraClient = [
  authMiddleware,
  async(req, res) => {
    try {
      // Validation des données
      const validationErrors = JiraConfig.validateConfigData(req.body);
      if (validationErrors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Validation failed',
          details: validationErrors,
        });
      }

      const exists = await JiraConfig.findByHost(req.body.host);
      if (exists) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Configuration already exists for this host',
        });
      }

      const config = new JiraConfig(req.body);
      const newConfig = await config.save();

      res.status(HTTP_STATUS.CREATED).json({
        error: false,
        message: 'Jira client configuration added successfully',
        data: newConfig,
      });
    } catch (error) {
      console.error('Error adding Jira client configuration:', error);

      if (error.message === 'Configuration already exists for this host') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: error.message,
        });
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Error adding Jira client configuration',
      });
    }
  },
];

exports.deleteConfigJiraClientByID = [
  authMiddleware,
  async(req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: true,
        message: 'Array of IDs is required',
      });
    }

    try {
      const results = [];
      for (const id of ids) {
        const result = await JiraConfig.deleteById(id);
        results.push(result);
      }

      res.status(HTTP_STATUS.OK).json({
        error: false,
        message: 'Jira client configuration deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting Jira client configuration:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: error.message,
      });
    }
  },
];

exports.updateConfigJiraClient = [
  authMiddleware,
  async(req, res) => {
    const { id, ...configData } = req.body;

    if (!id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: true,
        message: 'Configuration ID is required',
      });
    }

    try {
      // Validation des données
      const validationErrors = JiraConfig.validateConfigData(configData);
      if (validationErrors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Validation failed',
          details: validationErrors,
        });
      }

      const updatedConfig = await JiraConfig.updateById(id, configData);
      res.status(HTTP_STATUS.OK).json({
        error: false,
        message: 'Jira client configuration updated successfully',
        data: updatedConfig,
      });
    } catch (error) {
      console.error('Error updating Jira client configuration:', error);

      if (error.message === 'Jira configuration not found') {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: true,
          message: error.message,
        });
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Error updating Jira client configuration',
      });
    }
  },
];

// Nouvelle fonction pour récupérer une configuration par ID
exports.getConfigJiraClientByID = [
  authMiddleware,
  async(req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: true,
        message: 'Configuration ID is required',
      });
    }

    try {
      const config = await JiraConfig.findById(id);
      res.status(HTTP_STATUS.OK).json({
        error: false,
        message: 'Jira client configuration retrieved successfully',
        data: config,
      });
    } catch (error) {
      console.error('Error retrieving Jira client configuration:', error);

      if (error.message === 'Jira configuration not found') {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: true,
          message: error.message,
        });
      }

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: error.message,
      });
    }
  },
];

// Nouvelle fonction pour récupérer les configurations activées
exports.getEnabledConfigJiraClient = [
  authMiddleware,
  async(req, res) => {
    try {
      const configs = await JiraConfig.findEnabledConfigs();
      res.status(HTTP_STATUS.OK).json({
        error: false,
        message: 'Enabled Jira client configurations retrieved successfully',
        data: configs,
      });
    } catch (error) {
      console.error(
        'Error retrieving enabled Jira client configurations:',
        error,
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: error.message,
      });
    }
  },
];
