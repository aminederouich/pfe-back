const express = require('express');
const router = express.Router();
const { getAllUsers, getUserByUid, getTicketStatsByUser } = require('../controllers/user');

router.get('/getAllUsers', getAllUsers);
router.get('/:uid', getUserByUid);
router.get('/stats/:uid', getTicketStatsByUser);
module.exports = router;
