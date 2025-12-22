/**
 * Mock Data - Données de test réutilisables
 */

const mockUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John Doe',
  jiraId: 'jira-123',
  role: 'developer',
  createdAt: new Date('2024-01-01'),
};

const mockUsers = [
  { ...mockUser },
  {
    uid: 'test-uid-456',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    displayName: 'Jane Smith',
    jiraId: 'jira-456',
    role: 'developer',
  },
  {
    uid: 'test-uid-789',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    displayName: 'Bob Johnson',
    jiraId: 'jira-789',
    role: 'manager',
  },
];

const mockTicket = {
  id: 'ticket-123',
  key: 'PROJ-123',
  fields: {
    summary: 'Test ticket summary',
    description: 'Test ticket description',
    issuetype: { name: 'Story', id: '10001' },
    priority: { name: 'High', id: '1' },
    status: { name: 'Done', id: '3' },
    resolution: { name: 'Terminé', id: '10000' },
    assignee: {
      accountId: 'jira-123',
      displayName: 'John Doe',
      emailAddress: 'test@example.com',
    },
    created: '2024-01-01T10:00:00.000Z',
    updated: '2024-01-10T15:00:00.000Z',
    resolutiondate: '2024-01-10T15:00:00.000Z',
    duedate: '2024-01-15',
  },
};

const mockTickets = [
  { ...mockTicket },
  {
    id: 'ticket-456',
    key: 'PROJ-456',
    fields: {
      ...mockTicket.fields,
      summary: 'Another test ticket',
      priority: { name: 'Medium', id: '2' },
      issuetype: { name: 'Bug', id: '10002' },
    },
  },
];

const mockRule = {
  id: 'rule-123',
  name: 'Test Rule',
  projectId: 'project-123',
  priority: {
    High: { checked: true, value: 10 },
    Medium: { checked: true, value: 5 },
    Low: { checked: true, value: 2 },
  },
  issuetype: {
    Story: { checked: true, value: 8 },
    Bug: { checked: true, value: 6 },
    Task: { checked: true, value: 5 },
  },
  deadline: {
    before: { checked: true, value: 15 },
    onTime: { checked: true, value: 10 },
    late: { checked: true, value: -5 },
  },
  resolution: {
    'Terminé': { checked: true, value: 10 },
    'Won\'t Do': { checked: false, value: 0 },
  },
  createdAt: new Date('2024-01-01'),
};

const mockProject = {
  id: 'project-123',
  projectKey: 'PROJ',
  projectName: 'Test Project',
  jiraConfigId: 'config-123',
  createdBy: 'test-uid-123',
  createdAt: new Date('2024-01-01'),
};

const mockJiraConfig = {
  id: 'config-123',
  host: 'test.atlassian.net',
  username: 'test@example.com',
  password: 'test-api-token',
  protocol: 'https',
  apiVersion: '2',
  strictSSL: true,
  createdBy: 'test-uid-123',
  createdAt: new Date('2024-01-01'),
};

const mockScore = {
  id: 'score-123',
  ticketId: 'ticket-123',
  ticketKey: 'PROJ-123',
  ruleId: 'rule-123',
  ruleName: 'Test Rule',
  ownerId: 'jira-123',
  score: 33,
  dateAffection: new Date('2024-01-10'),
  createdAt: new Date('2024-01-10'),
};

const mockWeeklyLeaderboard = [
  {
    rank: 1,
    email: 'test@example.com',
    id: 'jira-123',
    name: 'John Doe',
    score: 150,
  },
  {
    rank: 2,
    email: 'jane@example.com',
    id: 'jira-456',
    name: 'Jane Smith',
    score: 120,
  },
  {
    rank: 3,
    email: 'bob@example.com',
    id: 'jira-789',
    name: 'Bob Johnson',
    score: 100,
  },
];

module.exports = {
  mockUser,
  mockUsers,
  mockTicket,
  mockTickets,
  mockRule,
  mockProject,
  mockJiraConfig,
  mockScore,
  mockWeeklyLeaderboard,
};
