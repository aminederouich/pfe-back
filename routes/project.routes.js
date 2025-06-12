const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');

router.get('/getAllProject', projectController.getAllProject);
router.post('/addNewProject', projectController.addNewProject);

module.exports = router;