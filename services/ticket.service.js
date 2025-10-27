const createJiraClient = require('../middleware/jiraClient');
const TicketModel = require('../models/ticket.model');

class ticketService {

  async syncTicketWithFirebase(ticket, configId) {
  // Check if ticket exists with same key and configId
    const existingTicket = await TicketModel.findByKeyAndConfigId(ticket.key, configId);
    if (existingTicket) {
      await TicketModel.updateOrSyncTicket(existingTicket, ticket, configId);
    } else {
      await TicketModel.addNewTicket(ticket, configId);
    }
  }

  async updateIssueJiraClient(ticket, config) {
    const jira = await createJiraClient(config);
    try {
      const [fieldKey] = Object.keys(ticket.fields);
      if (fieldKey === 'summary') {
        await jira.updateIssue(ticket.key, { fields: ticket.fields }, {});
      } else if (fieldKey === 'status') {
        const transitions = await jira.listTransitions(ticket.key);
        const transition = transitions.transitions.find(t => t.to.name === ticket.fields.status.name);
        if (transition) {
          await jira.transitionIssue(ticket.key, { transition: { id: transition.id } });
        }
      }
    } catch (jiraError) {
      return {
        success: false,
        message: 'Error updating ticket in Jira',
        error: jiraError.message,
      };
    }
  }

  async SearchForIssuesUsingJQLEnhancedSearch(projectName, config) {
    const url = `${config.protocol}://${config.host}/rest/api/${config.apiVersion}/search/jql`;
    const headers = {
      Authorization: `Basic ${Buffer.from(
        `${config.username}:${config.password}`,
      ).toString('base64')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jql: `project=${projectName}` }),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch issues: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Jira connection test failed: ${error.message}`);
    }
  }

  async getIssueDetails(issueId, config) {
    const url = `${config.protocol}://${config.host}/rest/api/${config.apiVersion}/issue/${issueId}`;
    const headers = {
      Authorization: `Basic ${Buffer.from(
        `${config.username}:${config.password}`,
      ).toString('base64')}`,
      'Accept': 'application/json',
    };
    try {
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        throw new Error(`Failed to fetch issue details: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Jira connection test failed: ${error.message}`);
    }
  }
}

module.exports = new ticketService();
