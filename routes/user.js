const express = require('express');
const router = express.Router();
const { getAllUsers, getUserByUid, getTicketStatsByUser, inviteNewEmployee, setPassword } = require('../controllers/user');

router.get('/getAllUsers', getAllUsers);
router.get('/getUserByUid/:uid', getUserByUid);
router.get('/stats/:uid', getTicketStatsByUser);
router.post('/invite-employee', inviteNewEmployee);
router.post('/set-password', setPassword);
module.exports = router;
