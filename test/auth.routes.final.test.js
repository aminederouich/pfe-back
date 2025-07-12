const request = require('supertest');
const express = require('express');

// Mock simple et efficace du service d'authentification
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  getUserProfile: jest.fn()
};

// Mock simple du middleware d'authentification
const mockAuthMiddleware = (req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
};

// Mocks définis avant l'importation des modules
jest.mock('../services/auth.service', () => mockAuthService);
jest.mock('../middleware/auth', () => mockAuthMiddleware);

// Import des routes après les mocks
const authRoutes = require('../routes/auth.routes');

describe('Auth Routes - Complete Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll((done) => {
    done();
  });

  describe('POST /auth/signup', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockResult = {
        message: 'User registered successfully',
        user: {
          uid: 'test-uid-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        error: false,
        message: mockResult.message,
        user: mockResult.user
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
    }, 5000);

    test('should return error when registration fails', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const errorMessage = 'Email already exists';
      mockAuthService.register.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: errorMessage
      });
    }, 5000);
  });

  describe('POST /auth/signin', () => {
    test('should authenticate user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResult = {
        message: 'Login successful',
        token: 'jwt-token-123',
        user: {
          uid: 'test-uid-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/signin')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: mockResult.message,
        token: mockResult.token,
        user: mockResult.user
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
    }, 5000);

    test('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/auth/signin')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: true,
        message: 'Invalid credentials'
      });
    }, 5000);

    test('should return 422 for missing email and password', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Email and password are required'));

      const response = await request(app)
        .post('/auth/signin')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.error).toBe(true);
    }, 5000);
  });

  describe('POST /auth/forget-password', () => {
    test('should send password reset email successfully', async () => {
      const emailData = { email: 'test@example.com' };
      const mockResult = { message: 'Password reset email sent successfully' };

      mockAuthService.forgotPassword.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/forget-password')
        .send(emailData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: mockResult.message
      });
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(emailData.email);
    }, 5000);

    test('should return 422 for missing email', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(new Error('Email is required'));

      const response = await request(app)
        .post('/auth/forget-password')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.error).toBe(true);
    }, 5000);
  });

  describe('POST /auth/verify-email', () => {
    test('should send email verification successfully', async () => {
      const mockResult = { message: 'Verification email sent successfully' };

      mockAuthService.sendEmailVerification.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/verify-email');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: mockResult.message
      });
      expect(mockAuthService.sendEmailVerification).toHaveBeenCalled();
    }, 5000);

    test('should handle email verification errors', async () => {
      mockAuthService.sendEmailVerification.mockRejectedValue(new Error('Unable to send verification email'));

      const response = await request(app)
        .post('/auth/verify-email');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: 'Unable to send verification email'
      });
    }, 5000);
  });

  describe('GET /auth/check-auth', () => {
    test('should return user info when authenticated', async () => {
      const mockResult = {
        user: {
          uid: 'test-uid-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      mockAuthService.getUserProfile.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/auth/check-auth')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: 'User is authenticated',
        user: mockResult.user
      });
      expect(mockAuthService.getUserProfile).toHaveBeenCalledWith('test-uid-123');
    }, 5000);

    test('should return 404 when user not found', async () => {
      mockAuthService.getUserProfile.mockRejectedValue(new Error('User not found'));

      const response = await request(app)
        .get('/auth/check-auth')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: true,
        message: 'User document not found'
      });
    }, 5000);
  });

  describe('POST /auth/logout', () => {
    test('should logout user successfully', async () => {
      const mockResult = { message: 'Logout successful' };

      mockAuthService.logout.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: mockResult.message,
        clearToken: true
      });
      expect(mockAuthService.logout).toHaveBeenCalled();
    }, 5000);

    test('should handle logout errors', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: true,
        message: 'An error occurred during logout'
      });
    }, 5000);
  });

  describe('Error handling', () => {
    test('should handle empty request bodies', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Invalid input'));

      const response = await request(app)
        .post('/auth/signup')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    }, 5000);
  });
});
