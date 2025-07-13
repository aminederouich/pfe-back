const { jiraConfig } = require('../config/Jira');
const HTTP_STATUS = require('../constants/httpStatus');

exports.jiraClient = async(req, res) => {
  try {
    const issue = await jiraConfig.findIssue('SCRUM-1');
    res.status(HTTP_STATUS.OK).json({
      error: false,
      message: 'Jira client is working',
      issue,
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: true,
      message: 'Error fetching issue from Jira',
    });
  }
};
