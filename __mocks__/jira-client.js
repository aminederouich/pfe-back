/**
 * Mock Jira Client
 */

class MockJiraClient {
  constructor(config) {
    this.config = config;
  }

  async findIssue(issueKey) {
    return {
      id: '10001',
      key: issueKey,
      fields: {
        summary: 'Test Issue',
        description: 'Test Description',
        issuetype: { name: 'Story' },
        priority: { name: 'High' },
        status: { name: 'Done' },
        assignee: { accountId: 'test-user-id', displayName: 'Test User' },
      },
    };
  }

  async searchJira(jql, options) {
    return {
      issues: [
        {
          id: '10001',
          key: 'PROJ-1',
          fields: {
            summary: 'Test Issue 1',
            issuetype: { name: 'Story' },
            priority: { name: 'High' },
          },
        },
        {
          id: '10002',
          key: 'PROJ-2',
          fields: {
            summary: 'Test Issue 2',
            issuetype: { name: 'Bug' },
            priority: { name: 'Medium' },
          },
        },
      ],
      total: 2,
      maxResults: 50,
      startAt: 0,
    };
  }

  async updateIssue(issueKey, update) {
    return { success: true };
  }

  async listTransitions(issueKey) {
    return {
      transitions: [
        { id: '11', name: 'To Do' },
        { id: '21', name: 'In Progress' },
        { id: '31', name: 'Done' },
      ],
    };
  }

  async transitionIssue(issueKey, transition) {
    return { success: true };
  }

  async getProject(projectKey) {
    return {
      id: '10000',
      key: projectKey,
      name: 'Test Project',
      description: 'Test Project Description',
    };
  }

  async listProjects() {
    return [
      { id: '10000', key: 'PROJ1', name: 'Project 1' },
      { id: '10001', key: 'PROJ2', name: 'Project 2' },
    ];
  }
}

module.exports = MockJiraClient;
