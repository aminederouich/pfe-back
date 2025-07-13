require('dotenv').config();
const AuthService = require('../services/auth.service');
const HTTP_STATUS = require('../constants/httpStatus');

const authMiddleware = async(req, res, next) => {
  console.log('Starting authentication middleware...');
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token:', token ? 'Token present' : 'No token');

    if (!token) {
      console.log('Authentication failed: No token provided');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: true,
        message: 'Authentication required',
      });
    }

    // Verify token using AuthService
    console.log('Attempting to verify JWT token...');
    const result = await AuthService.verifyToken(token);
    console.log('JWT verification successful:', {
      uid: result.tokenData.uid,
      email: result.tokenData.email,
    });

    // Add user data to request object
    req.user = result.tokenData;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    const getStatusCode = () => {
      if (error.message === 'JWT_SECRET is not defined') {
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
      }
      return HTTP_STATUS.UNAUTHORIZED;
    };

    const getMessage = () => {
      if (error.message === 'JWT_SECRET is not defined') {
        return 'Server configuration error';
      }
      return 'Invalid or expired token';
    };

    return res.status(getStatusCode()).json({
      error: true,
      message: getMessage(),
    });
  }
};

module.exports = authMiddleware;
