const express = require('express')
const router = express.Router()
const { addConfigJiraClient } = require('../controllers/jiraConfig')

router.post('/addConfig', addConfigJiraClient)

module.exports = router