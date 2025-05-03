const express = require('express')
const router = express.Router()
const {
	addConfigJiraClient,
	getAllConfigJiraClient,
	checkConncetionJiraAPI
} = require('../controllers/jiraConfig')

router.post('/checkConnection', checkConncetionJiraAPI)
// Route to get all Jira client configuration
router.get('/getAllConfig', getAllConfigJiraClient)

// Route to add Jira client configuration
router.post('/addConfig', addConfigJiraClient)

module.exports = router
