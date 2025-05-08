const express = require('express')
const router = express.Router()
const {
  getAllTicket,
  // addProject,
  // deleteProjetByID,
  // updateProjectByID,
} = require('../controllers/ticket')

router.get('/getAllTicket', getAllTicket)

// router.post('/addProject', addProject)

// router.post('/deleteProjetByID', deleteProjetByID)

// router.post('/updateProjectByID', updateProjectByID)

module.exports = router
