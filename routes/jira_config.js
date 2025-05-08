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

router.get('/getAllConfig', getAllConfigJiraClient)

router.post('/addConfig', addConfigJiraClient)

router.post('/deleteConfigByID', deleteConfigJiraClientByID)

router.post('/updateConfigByID', updateConfigJiraClient)

module.exports = router
