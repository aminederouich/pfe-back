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

describe('Auth Routes Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockAuthService.register.mockResolvedValue({
        message: 'User registered successfully',
        user: { uid: 'new-uid' }
      });

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
    });

    test('should handle registration errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockAuthService.register.mockRejectedValue(new Error('Email already exists'));

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/signin', () => {
    test('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockAuthService.login.mockResolvedValue({
        token: 'fake-jwt-token',
        user: { uid: 'test-uid' }
      });

      const response = await request(app)
        .post('/auth/signin')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
    });

    test('should handle invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/auth/signin')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /auth/isLogged', () => {
    test('should check if user is logged in', async () => {
      mockAuthService.getUserProfile.mockResolvedValue({
        uid: 'test-uid-123',
        email: 'test@example.com'
      });

      const response = await request(app)
        .get('/auth/check-auth')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User is authenticated');
    });
  });

  describe('POST /auth/logout', () => {
    test('should logout user successfully', async () => {
      mockAuthService.logout.mockResolvedValue({
        message: 'User logged out successfully'
      });

      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User logged out successfully');
    });
  });

  describe('POST /auth/forgetPassword', () => {
    test('should send password reset email', async () => {
      const emailData = { email: 'test@example.com' };

      mockAuthService.forgotPassword.mockResolvedValue({
        message: 'Password reset email sent'
      });

      const response = await request(app)
        .post('/auth/forget-password')
        .send(emailData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Password reset email sent');
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(emailData.email);
    });
  });

  describe('POST /auth/verifyEmail', () => {
    test('should send email verification', async () => {
      mockAuthService.sendEmailVerification.mockResolvedValue({
        message: 'Verification email sent'
      });

      const response = await request(app)
        .post('/auth/verify-email')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Verification email sent');
    });
  });
});
