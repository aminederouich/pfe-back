const express = require('express');
const router = express.Router();
const RulesController = require('../controllers/rules.controller');

router.post('/addRule', RulesController.addRule);
router.get('/getRuleByIdOwner/:ownerId', RulesController.getRuleByIdOwner);

module.exports = router;
