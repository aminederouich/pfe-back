const express = require('express')
const router = express.Router()
const {
	addConfigJiraClient,
	getAllConfigJiraClient,
	checkConncetionJiraAPI,
	deleteConfigJiraClientByID,
	updateConfigJiraClient
} = require('../controllers/jiraConfig')

router.post('/checkConnection', checkConncetionJiraAPI)
// Route to get all Jira client configuration
router.get('/getAllConfig', getAllConfigJiraClient)

// Route to add Jira client configuration
router.post('/addConfig', addConfigJiraClient)

router.post('/deleteConfigByID', deleteConfigJiraClientByID)

router.post('/updateConfigByID', updateConfigJiraClient)

module.exports = router
