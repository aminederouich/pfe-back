/**
 * Tests unitaires pour auth.controller.js
 * Total: 8 tests
 */

const authController = require('../../controllers/auth.controller');
const AuthService = require('../../services/auth.service');
const HTTP_STATUS = require('../../constants/httpStatus');
const { mockUser } = require('../helpers/mockData');

jest.mock('../../services/auth.service');
jest.mock('../../middleware/auth', () => (req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
});

describe('auth.controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should register user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      AuthService.register.mockResolvedValue({
        message: 'User created successfully',
        user: mockUser,
      });

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'User created successfully',
        user: mockUser,
      });
    });

    it('should handle registration error', async () => {
      req.body = { email: 'test@example.com', password: '123' };
      AuthService.register.mockRejectedValue(new Error('The password is too weak'));

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'The password is too weak',
      });
    });
  });

  describe('signin', () => {
    it('should login user successfully', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };

      AuthService.login.mockResolvedValue({
        message: 'Sign in successful',
        token: 'jwt-token',
        user: mockUser,
      });

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Sign in successful',
        token: 'jwt-token',
        user: mockUser,
      });
    });

    it('should return 401 for incorrect credentials', async () => {
      req.body = { email: 'test@example.com', password: 'wrong' };
      AuthService.login.mockRejectedValue(new Error('Incorrect password'));

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should return 422 when email or password missing', async () => {
      req.body = { email: 'test@example.com' };
      AuthService.login.mockRejectedValue(new Error('Email and password are required'));

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
    });

    it('should return 429 for too many requests', async () => {
      req.body = { email: 'test@example.com', password: 'password' };
      AuthService.login.mockRejectedValue(new Error('Too many login attempts. Please try again later.'));

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.TOO_MANY_REQUESTS);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      req.user = { uid: 'test-uid-123' };
      AuthService.logout.mockResolvedValue({ message: 'User has been logged out successfully' });

      await authController.logout[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'User has been logged out successfully',
        clearToken: true,
      });
    });

    it('should handle logout error', async () => {
      req.user = { uid: 'test-uid-123' };
      AuthService.logout.mockRejectedValue(new Error('Logout failed'));

      await authController.logout[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });

  describe('forgetPassword', () => {
    it('should send password reset email successfully', async () => {
      req.body = { email: 'test@example.com' };
      AuthService.forgotPassword.mockResolvedValue({ message: 'Password reset email sent' });

      await authController.forgetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Password reset email sent',
      });
    });

    it('should return 422 when email is missing', async () => {
      req.body = {};
      AuthService.forgotPassword.mockRejectedValue(new Error('Email is required'));

      await authController.forgetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
    });
  });
});
