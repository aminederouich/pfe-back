const express = require('express');
const router = express.Router();
const { getAllUsers, getUserByUid, getTicketStatsByUser, inviteNewUser, setPassword, updateUser } = require('../controllers/user.controller');

router.get('/getAllUsers', getAllUsers);
router.get('/getUserByUid/:uid', getUserByUid);
router.get('/stats/:uid', getTicketStatsByUser);
router.post('/inviteUser', inviteNewUser);
router.post('/updateUser/:uid', updateUser);
router.post('/setPassword/:uid', setPassword);
module.exports = router;
