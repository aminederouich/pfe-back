const express = require('express');
const router = express.Router();

const {
  isLogged,
  signup,
  signin,
  forgetPassword,
  logout,
  verifyEmail,
} = require('../controllers/auth.controller');

router.post('/signup', signup);

router.post('/signin', signin);

router.post('/forget-password', forgetPassword);

router.post('/verify-email', verifyEmail);

router.get('/check-auth', isLogged);

router.post('/logout', logout);

module.exports = router;
