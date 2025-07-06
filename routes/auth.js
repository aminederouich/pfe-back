const express = require('express');
const router = express.Router();

const {
  isLogged,
  signup,
  signin,
  forgetPassword,
  logout,
} = require('../controllers/auth');

router.post('/signup', signup);

router.post('/signin', signin);

router.post('/forget-password', forgetPassword);

router.get('/check-auth', isLogged);

router.post('/logout', logout);

module.exports = router;
