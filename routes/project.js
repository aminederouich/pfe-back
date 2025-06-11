const express = require('express')
const router = express.Router()
const {
  getAllProject,
} = require('../controllers/project')

router.get('/getAllProject', getAllProject)


module.exports = router
