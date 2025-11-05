const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');

router.get('/getAllTicket', ticketController.getAllTicket);

router.post('/addNewTicket', ticketController.addNewTicket);

router.post('/addNewTickets', ticketController.addNewTickets);

router.post('/updateTicket', ticketController.updateTicket);

module.exports = router;
