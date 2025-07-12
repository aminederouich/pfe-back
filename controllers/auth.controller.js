const AuthService = require('../services/auth.service');
const authMiddleware = require('../middleware/auth');

/**
 * Check if user is authenticated
 */
exports.isLogged = [
  authMiddleware,
  async (req, res) => {
    console.log('Starting isLogged check...');
    try {
      const uid = req.user.uid;
      console.log('User UID from token:', uid);
      
      const result = await AuthService.getUserProfile(uid);
      console.log('User profile retrieved successfully');

      return res.status(200).json({
        error: false,
        message: 'User is authenticated',
        user: result.user
      });
    } catch (error) {
      console.error('Error checking authentication status:', error.message);
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          error: true,
          message: 'User document not found'
        });
      }
      
      return res.status(500).json({
        error: true,
        message: 'An error occurred while checking authentication status'
      });
    }
  }
];

/**
 * Register a new user
 */
exports.signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    const result = await AuthService.register({
      email,
      password,
      firstName,
      lastName
    });

    return res.status(201).json({
      error: false,
      message: result.message,
      user: result.user
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    
    return res.status(400).json({
      error: true,
      message: error.message
    });
  }
};

/**
 * Authenticate user login
 */
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await AuthService.login({ email, password });

    return res.status(200).json({
      error: false,
      message: result.message,
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Signin error:', error.message);
    
    let statusCode = 401;
    if (error.message === 'Too many login attempts. Please try again later.') {
      statusCode = 429;
    } else if (error.message === 'Email and password are required') {
      statusCode = 422;
    } else if (error.message === 'User profile not found') {
      statusCode = 404;
    }

    return res.status(statusCode).json({
      error: true,
      message: error.message
    });
  }
};

/**
 * Logout user
 */
exports.logout = [
  authMiddleware,
  async (req, res) => {
    try {
      const uid = req.user.uid;
      console.log(`Attempting to logout user: ${uid}`);

      const result = await AuthService.logout();
      console.log(`Successfully logged out user: ${uid}`);

      return res.status(200).json({
        error: false,
        message: result.message,
        clearToken: true
      });
    } catch (error) {
      console.error('Logout error:', error.message);

      return res.status(500).json({
        error: true,
        message: 'An error occurred during logout'
      });
    }
  }
];

/**
 * Send password reset email
 */
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await AuthService.forgotPassword(email);

    return res.status(200).json({
      error: false,
      message: result.message
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    
    let statusCode = 400;
    if (error.message === 'Email is required') {
      statusCode = 422;
    }

    return res.status(statusCode).json({
      error: true,
      message: error.message
    });
  }
};

/**
 * Send email verification
 */
exports.verifyEmail = async (req, res) => {
  try {
    const result = await AuthService.sendEmailVerification();

    return res.status(200).json({
      error: false,
      message: result.message
    });
  } catch (error) {
    console.error('Email verification error:', error.message);

    return res.status(400).json({
      error: true,
      message: error.message
    });
  }
};
