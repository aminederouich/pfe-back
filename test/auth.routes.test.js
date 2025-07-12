const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth.routes');
const AuthService = require('../services/auth.service');

// Mock du service d'authentification
jest.mock('../services/auth.service');
jest.mock('../middleware/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Mock du middleware auth
const authMiddleware = require('../middleware/auth');
authMiddleware.mockImplementation((req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
});

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    it('should register a new user successfully', async () => {
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

      AuthService.register.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        error: false,
        message: mockResult.message,
        user: mockResult.user
      });
      expect(AuthService.register).toHaveBeenCalledWith(userData);
    });

    it('should return error when registration fails', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const errorMessage = 'Email already exists';
      AuthService.register.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: errorMessage
      });
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // missing password, firstName, lastName
      };

      AuthService.register.mockRejectedValue(new Error('All fields are required'));

      const response = await request(app)
        .post('/auth/signup')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });
  });

  describe('POST /auth/signin', () => {
    it('should authenticate user successfully', async () => {
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

      AuthService.login.mockResolvedValue(mockResult);

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
      expect(AuthService.login).toHaveBeenCalledWith(loginData);
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      AuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/auth/signin')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: true,
        message: 'Invalid credentials'
      });
    });

    it('should return 422 for missing email and password', async () => {
      AuthService.login.mockRejectedValue(new Error('Email and password are required'));

      const response = await request(app)
        .post('/auth/signin')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.error).toBe(true);
    });

    it('should return 429 for too many login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      AuthService.login.mockRejectedValue(new Error('Too many login attempts. Please try again later.'));

      const response = await request(app)
        .post('/auth/signin')
        .send(loginData);

      expect(response.status).toBe(429);
      expect(response.body.error).toBe(true);
    });

    it('should return 404 for user profile not found', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      AuthService.login.mockRejectedValue(new Error('User profile not found'));

      const response = await request(app)
        .post('/auth/signin')
        .send(loginData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
  });

  describe('POST /auth/forget-password', () => {
    it('should send password reset email successfully', async () => {
      const emailData = {
        email: 'test@example.com'
      };

      const mockResult = {
        message: 'Password reset email sent successfully'
      };

      AuthService.forgotPassword.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/forget-password')
        .send(emailData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: mockResult.message
      });
      expect(AuthService.forgotPassword).toHaveBeenCalledWith(emailData.email);
    });

    it('should return 422 for missing email', async () => {
      AuthService.forgotPassword.mockRejectedValue(new Error('Email is required'));

      const response = await request(app)
        .post('/auth/forget-password')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.error).toBe(true);
    });

    it('should handle service errors', async () => {
      const emailData = {
        email: 'test@example.com'
      };

      AuthService.forgotPassword.mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app)
        .post('/auth/forget-password')
        .send(emailData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });
  });

  describe('POST /auth/verify-email', () => {
    it('should send email verification successfully', async () => {
      const mockResult = {
        message: 'Verification email sent successfully'
      };

      AuthService.sendEmailVerification.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/verify-email');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: mockResult.message
      });
      expect(AuthService.sendEmailVerification).toHaveBeenCalled();
    });

    it('should handle email verification errors', async () => {
      AuthService.sendEmailVerification.mockRejectedValue(new Error('Unable to send verification email'));

      const response = await request(app)
        .post('/auth/verify-email');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: 'Unable to send verification email'
      });
    });
  });

  describe('GET /auth/check-auth', () => {
    it('should return user info when authenticated', async () => {
      const mockResult = {
        user: {
          uid: 'test-uid-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      AuthService.getUserProfile.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/auth/check-auth')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: 'User is authenticated',
        user: mockResult.user
      });
      expect(AuthService.getUserProfile).toHaveBeenCalledWith('test-uid-123');
    });

    it('should return 404 when user not found', async () => {
      AuthService.getUserProfile.mockRejectedValue(new Error('User not found'));

      const response = await request(app)
        .get('/auth/check-auth')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: true,
        message: 'User document not found'
      });
    });

    it('should return 500 for other errors', async () => {
      AuthService.getUserProfile.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/auth/check-auth')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: true,
        message: 'An error occurred while checking authentication status'
      });
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user successfully', async () => {
      const mockResult = {
        message: 'Logout successful'
      };

      AuthService.logout.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: mockResult.message,
        clearToken: true
      });
      expect(AuthService.logout).toHaveBeenCalled();
    });

    it('should handle logout errors', async () => {
      AuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: true,
        message: 'An error occurred during logout'
      });
    });
  });

  describe('Authentication middleware tests', () => {
    beforeEach(() => {
      authMiddleware.mockClear();
    });

    it('should apply auth middleware to protected routes', async () => {
      await request(app)
        .get('/auth/check-auth')
        .set('Authorization', 'Bearer valid-token');

      expect(authMiddleware).toHaveBeenCalled();
    });

    it('should apply auth middleware to logout route', async () => {
      await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token');

      expect(authMiddleware).toHaveBeenCalled();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should handle empty request bodies', async () => {
      AuthService.register.mockRejectedValue(new Error('Invalid input'));

      const response = await request(app)
        .post('/auth/signup')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(300) + '@example.com';
      AuthService.register.mockRejectedValue(new Error('Email too long'));

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: longEmail,
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });
  });
});
