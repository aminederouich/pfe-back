const jiraConfig = require('../config/Jira')

exports.addConfigJiraClient = async (req, res) => {
	const { jiraUrl, username, password } = req.body

	if (!jiraUrl || !username || !password) {
		return res.status(400).json({
			error: true,
			message: 'Jira URL, username, and password are required',
		})
	}

	try {
		jiraConfig.setJiraCredentials(jiraUrl, username, password)
		res.status(200).json({
			error: false,
			message: 'Jira client configuration added successfully',
		})
	} catch (error) {
		console.error('Error adding Jira client configuration:', error)
		res.status(500).json({
			error: true,
			message: 'Error adding Jira client configuration',
		})
	}
}
