const request = require('supertest');
const express = require('express');

// Configuration de l'application de test
const app = express();
app.use(express.json());

// Mock des services et middleware
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  getUserProfile: jest.fn()
};

const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
});

// Mock des modules avant l'importation des routes
jest.mock('../services/auth.service', () => mockAuthService);
jest.mock('../middleware/auth', () => mockAuthMiddleware);

// Importation des routes après les mocks
const authRoutes = require('../routes/auth.routes');
app.use('/auth', authRoutes);

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/signup - User Registration', () => {
    test('should register a new user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123',
        firstName: 'Jane',
        lastName: 'Smith'
      };

      const mockResponse = {
        message: 'User registered successfully',
        user: {
          uid: 'new-user-uid',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        }
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        error: false,
        message: mockResponse.message,
        user: mockResponse.user
      });

      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
    });

    test('should handle registration errors', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockAuthService.register.mockRejectedValue(new Error('Email already in use'));

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: true,
        message: 'Email already in use'
      });
    });
  });

  describe('POST /auth/signin - User Login', () => {
    test('should authenticate user with valid credentials', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'correctpassword'
      };

      const mockResponse = {
        message: 'Login successful',
        token: 'jwt-token-abc123',
        user: {
          uid: 'user-uid-123',
          email: credentials.email,
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/signin')
        .send(credentials)
        .expect(200);

      expect(response.body).toMatchObject({
        error: false,
        message: mockResponse.message,
        token: mockResponse.token,
        user: mockResponse.user
      });
    });

    test('should reject invalid credentials', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/auth/signin')
        .send(credentials)
        .expect(401);

      expect(response.body).toMatchObject({
        error: true,
        message: 'Invalid credentials'
      });
    });

    test('should handle missing credentials', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Email and password are required'));

      const response = await request(app)
        .post('/auth/signin')
        .send({})
        .expect(422);

      expect(response.body.error).toBe(true);
    });
  });

  describe('GET /auth/check-auth - Authentication Check', () => {
    test('should return user data when authenticated', async () => {
      const mockUser = {
        user: {
          uid: 'test-uid-123',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      mockAuthService.getUserProfile.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/auth/check-auth')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toMatchObject({
        error: false,
        message: 'User is authenticated',
        user: mockUser.user
      });

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    test('should handle user not found', async () => {
      mockAuthService.getUserProfile.mockRejectedValue(new Error('User not found'));

      const response = await request(app)
        .get('/auth/check-auth')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toMatchObject({
        error: true,
        message: 'User document not found'
      });
    });
  });

  describe('POST /auth/logout - User Logout', () => {
    test('should logout user successfully', async () => {
      mockAuthService.logout.mockResolvedValue({
        message: 'Successfully logged out'
      });

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toMatchObject({
        error: false,
        message: 'Successfully logged out',
        clearToken: true
      });

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    test('should handle logout errors', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);

      expect(response.body).toMatchObject({
        error: true,
        message: 'An error occurred during logout'
      });
    });
  });

  describe('POST /auth/forget-password - Password Reset', () => {
    test('should send password reset email', async () => {
      const email = { email: 'user@example.com' };

      mockAuthService.forgotPassword.mockResolvedValue({
        message: 'Password reset email sent'
      });

      const response = await request(app)
        .post('/auth/forget-password')
        .send(email)
        .expect(200);

      expect(response.body).toMatchObject({
        error: false,
        message: 'Password reset email sent'
      });

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(email.email);
    });

    test('should handle missing email', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(new Error('Email is required'));

      const response = await request(app)
        .post('/auth/forget-password')
        .send({})
        .expect(422);

      expect(response.body.error).toBe(true);
    });
  });

  describe('POST /auth/verify-email - Email Verification', () => {
    test('should send verification email', async () => {
      mockAuthService.sendEmailVerification.mockResolvedValue({
        message: 'Verification email sent'
      });

      const response = await request(app)
        .post('/auth/verify-email')
        .expect(200);

      expect(response.body).toMatchObject({
        error: false,
        message: 'Verification email sent'
      });
    });

    test('should handle email verification errors', async () => {
      mockAuthService.sendEmailVerification.mockRejectedValue(
        new Error('Failed to send verification email')
      );

      const response = await request(app)
        .post('/auth/verify-email')
        .expect(400);

      expect(response.body).toMatchObject({
        error: true,
        message: 'Failed to send verification email'
      });
    });
  });
});
