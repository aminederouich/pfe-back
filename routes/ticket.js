const express = require('express')
const router = express.Router()
const {
  getAllTicket,
  addNewTicket
} = require('../controllers/ticket')

router.get('/getAllTicket', getAllTicket)

router.post('/addNewTicket', addNewTicket)


module.exports = router
