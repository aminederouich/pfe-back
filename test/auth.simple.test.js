const request = require('supertest');
const express = require('express');

// Mock simple du service d'authentification
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  getUserProfile: jest.fn()
};

// Mock simple du middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
};

// Mocks avant l'importation
jest.mock('../services/auth.service', () => mockAuthService);
jest.mock('../middleware/auth', () => mockAuthMiddleware);

// Import des routes après les mocks
const authRoutes = require('../routes/auth.routes');

describe('Auth Routes - Simple Tests', () => {
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
    }, 5000); // Timeout de 5 secondes pour ce test
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
          email: 'test@example.com'
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
    }, 5000);
  });
});
