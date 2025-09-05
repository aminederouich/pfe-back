const JiraApi = require('jira-client');

const createJiraClient = (config) => {
  return new JiraApi({
    protocol: config.protocol ?? 'https',
    host: config.host,
    username: config.username,
    password: config.password,
    apiVersion: config.apiVersion ?? '2',
    strictSSL: config.strictSSL ?? true,
  });
};

module.exports = createJiraClient;
