const authController = require('../controllers/auth.controller');
const AuthService = require('../services/auth.service');

// Mock du service d'authentification
jest.mock('../services/auth.service');

// Mock du middleware d'authentification
const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
});
jest.mock('../middleware/auth', () => mockAuthMiddleware);

describe('Auth Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: { uid: 'test-uid-123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    test('should register user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockResult = {
        message: 'User registered successfully',
        user: { uid: 'test-uid', email: 'test@example.com' }
      };

      AuthService.register.mockResolvedValue(mockResult);

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: mockResult.message,
        user: mockResult.user
      });
    });

    test('should handle registration error', async () => {
      req.body = { email: 'test@example.com' };
      
      AuthService.register.mockRejectedValue(new Error('Email already exists'));

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Email already exists'
      });
    });
  });

  describe('signin', () => {
    test('should authenticate user successfully', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResult = {
        message: 'Login successful',
        token: 'jwt-token-123',
        user: { uid: 'test-uid', email: 'test@example.com' }
      };

      AuthService.login.mockResolvedValue(mockResult);

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: mockResult.message,
        token: mockResult.token,
        user: mockResult.user
      });
    });

    test('should handle invalid credentials', async () => {
      req.body = { email: 'test@example.com', password: 'wrong' };
      
      AuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Invalid credentials'
      });
    });

    test('should handle missing credentials error', async () => {
      req.body = {};
      
      AuthService.login.mockRejectedValue(new Error('Email and password are required'));

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Email and password are required'
      });
    });

    test('should handle rate limiting error', async () => {
      req.body = { email: 'test@example.com', password: 'password' };
      
      AuthService.login.mockRejectedValue(new Error('Too many login attempts. Please try again later.'));

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Too many login attempts. Please try again later.'
      });
    });

    test('should handle user not found error', async () => {
      req.body = { email: 'test@example.com', password: 'password' };
      
      AuthService.login.mockRejectedValue(new Error('User profile not found'));

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'User profile not found'
      });
    });
  });

  describe('isLogged', () => {
    test('should return user info when authenticated', async () => {
      const mockResult = {
        user: { uid: 'test-uid-123', email: 'test@example.com' }
      };

      AuthService.getUserProfile.mockResolvedValue(mockResult);

      // isLogged est un array avec middleware et handler
      const handler = authController.isLogged[1];
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'User is authenticated',
        user: mockResult.user
      });
      expect(AuthService.getUserProfile).toHaveBeenCalledWith('test-uid-123');
    });

    test('should handle user not found', async () => {
      AuthService.getUserProfile.mockRejectedValue(new Error('User not found'));

      const handler = authController.isLogged[1];
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'User document not found'
      });
    });

    test('should handle service error', async () => {
      AuthService.getUserProfile.mockRejectedValue(new Error('Database error'));

      const handler = authController.isLogged[1];
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'An error occurred while checking authentication status'
      });
    });
  });

  describe('logout', () => {
    test('should logout user successfully', async () => {
      const mockResult = {
        message: 'Logout successful'
      };

      AuthService.logout.mockResolvedValue(mockResult);

      const handler = authController.logout[1];
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: mockResult.message,
        clearToken: true
      });
    });

    test('should handle logout error', async () => {
      AuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const handler = authController.logout[1];
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'An error occurred during logout'
      });
    });
  });

  describe('forgetPassword', () => {
    test('should send password reset email successfully', async () => {
      req.body = { email: 'test@example.com' };
      
      const mockResult = {
        message: 'Password reset email sent'
      };

      AuthService.forgotPassword.mockResolvedValue(mockResult);

      await authController.forgetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: mockResult.message
      });
      expect(AuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });

    test('should handle missing email', async () => {
      req.body = {};
      
      AuthService.forgotPassword.mockRejectedValue(new Error('Email is required'));

      await authController.forgetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Email is required'
      });
    });

    test('should handle service error', async () => {
      req.body = { email: 'test@example.com' };
      
      AuthService.forgotPassword.mockRejectedValue(new Error('Service unavailable'));

      await authController.forgetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Service unavailable'
      });
    });
  });

  describe('verifyEmail', () => {
    test('should send verification email successfully', async () => {
      const mockResult = {
        message: 'Verification email sent'
      };

      AuthService.sendEmailVerification.mockResolvedValue(mockResult);

      await authController.verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: mockResult.message
      });
    });

    test('should handle verification error', async () => {
      AuthService.sendEmailVerification.mockRejectedValue(new Error('Verification failed'));

      await authController.verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Verification failed'
      });
    });
  });
});
