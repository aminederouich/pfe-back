const { jiraConfig } = require('../config/Jira');

exports.jiraClient = async (req, res) => {
  try {
    const issue = await jiraConfig.findIssue('SCRUM-1');
    res.status(200).json({
      error: false,
      message: 'Jira client is working',
      issue: issue,
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching issue from Jira',
    });
  }
};
