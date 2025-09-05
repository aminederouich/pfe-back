const TicketModel = require('../models/ticket.model');

class ticketService {
  async getIssuesForProject(jira, projectKey) {
    let startAt = 0;
    const maxResults = 50;
    let allIssues = [];
    let total = 0;
    do {
      const result = await jira.searchJira(`project = ${projectKey}`, {
        startAt,
        maxResults,
      });
      allIssues = allIssues.concat(result.issues);
      ({ total } = result);
      startAt += maxResults;
    } while (startAt < total);
    return allIssues;
  }

  async fetchProjectsAndIssues(jira) {
    const projects = await jira.listProjects();
    const allIssues = [];
    for (const project of projects) {
      const issues = await this.getIssuesForProject(jira, project.key);
      allIssues.push(...issues);
    }
    return allIssues;
  }

  async syncTicketWithFirebase(ticket, configId) {
  // Check if ticket exists with same key and configId
    const existingTicket = await TicketModel.findByKeyAndConfigId(ticket.key, configId);
    if (existingTicket) {
      await TicketModel.updateOrSyncTicket(existingTicket, ticket, configId);
    } else {
      await TicketModel.addNewTicket(ticket, configId);
    }
  }
}

module.exports = new ticketService();
