const express = require('express');
const router = express.Router();
const { jiraClient } = require('../controllers/jiraClient');

router.get('/alljira', jiraClient);

module.exports = router;
