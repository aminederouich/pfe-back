require('dotenv').config();
const AuthService = require('../services/auth.service');

const authMiddleware = async (req, res, next) => {
  console.log('Starting authentication middleware...');
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token:', token ? 'Token present' : 'No token');

    if (!token) {
      console.log('Authentication failed: No token provided');
      return res.status(401).json({
        error: true,
        message: 'Authentication required'
      });
    }

    // Verify token using AuthService
    console.log('Attempting to verify JWT token...');
    const result = await AuthService.verifyToken(token);
    console.log('JWT verification successful:', {
      uid: result.tokenData.uid,
      email: result.tokenData.email
    });

    // Add user data to request object
    req.user = result.tokenData;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    let statusCode = 401;
    let message = 'Invalid or expired token';
    
    if (error.message === 'JWT_SECRET is not defined') {
      statusCode = 500;
      message = 'Server configuration error';
    }
    
    return res.status(statusCode).json({
      error: true,
      message: message
    });
  }
};

module.exports = authMiddleware;
