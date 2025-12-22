const JiraConfig = require('../models/jiraConfig.model');

const myself = async(configData) => {
  const url = `${configData.protocol}://${configData.host}/rest/api/${configData.apiVersion}/myself`;
  const headers = {
    Authorization: `Basic ${Buffer.from(
      `${configData.username}:${configData.password}`,
    ).toString('base64')}`,
    'Accept': 'application/json',
  };
  try {
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      throw new Error(`Jira connection test failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Jira connection test failed', error);
  }
};

const createConfig = async(configData) => {
  return JiraConfig.create(configData);
};

const getConfigById = async(configId) => {
  return JiraConfig.findById(configId);
};

const updateConfig = async(configId, updateData) => {
  return JiraConfig.update(configId, updateData);
};

const deleteConfig = async(configId) => {
  return JiraConfig.delete(configId);
};

module.exports = { myself, createConfig, getConfigById, updateConfig, deleteConfig };
