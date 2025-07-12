const request = require('supertest');
const express = require('express');

// Mock des services
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  forgotPassword: jest.fn(),
  sendEmailVerification: jest.fn()
};

jest.mock('../services/auth.service', () => mockAuthService);
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { uid: 'test-uid' };
  next();
}));

const authRoutes = require('../routes/auth.routes');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes Input Validation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll((done) => {
    // Nettoyage pour éviter les fuites
    app.removeAllListeners();
    done();
  });

  describe('POST /auth/signup - Input Validation', () => {
    test('should handle valid signup data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockAuthService.register.mockResolvedValue({
        message: 'User registered successfully',
        user: { uid: 'test-uid', email: validData.email }
      });

      const response = await request(app)
        .post('/auth/signup')
        .send(validData);

      expect(response.status).toBe(201);
      expect(mockAuthService.register).toHaveBeenCalledWith(validData);
    });

    test('should handle empty request body', async () => {
      mockAuthService.register.mockRejectedValue(new Error('All fields are required'));

      const response = await request(app)
        .post('/auth/signup')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });

    test('should handle missing email', async () => {
      const incompleteData = {
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockAuthService.register.mockRejectedValue(new Error('Email is required'));

      const response = await request(app)
        .post('/auth/signup')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email is required');
    });

    test('should handle missing password', async () => {
      const incompleteData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockAuthService.register.mockRejectedValue(new Error('Password is required'));

      const response = await request(app)
        .post('/auth/signup')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password is required');
    });

    test('should handle invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockAuthService.register.mockRejectedValue(new Error('Invalid email format'));

      const response = await request(app)
        .post('/auth/signup')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email format');
    });

    test('should handle weak password', async () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockAuthService.register.mockRejectedValue(new Error('Password too weak'));

      const response = await request(app)
        .post('/auth/signup')
        .send(weakPasswordData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password too weak');
    });
  });

  describe('POST /auth/signin - Input Validation', () => {
    test('should handle valid signin data', async () => {
      const validCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockAuthService.login.mockResolvedValue({
        message: 'Login successful',
        token: 'jwt-token',
        user: { uid: 'test-uid' }
      });

      const response = await request(app)
        .post('/auth/signin')
        .send(validCredentials);

      expect(response.status).toBe(200);
      expect(mockAuthService.login).toHaveBeenCalledWith(validCredentials);
    });

    test('should handle missing email and password', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Email and password are required'));

      const response = await request(app)
        .post('/auth/signin')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.message).toBe('Email and password are required');
    });

    test('should handle missing email only', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Email and password are required'));

      const response = await request(app)
        .post('/auth/signin')
        .send({ password: 'password123' });

      expect(response.status).toBe(422);
    });

    test('should handle missing password only', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Email and password are required'));

      const response = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(422);
    });

    test('should handle empty strings', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Email and password are required'));

      const response = await request(app)
        .post('/auth/signin')
        .send({ email: '', password: '' });

      expect(response.status).toBe(422);
    });
  });

  describe('POST /auth/forget-password - Input Validation', () => {
    test('should handle valid email', async () => {
      const validEmail = { email: 'test@example.com' };

      mockAuthService.forgotPassword.mockResolvedValue({
        message: 'Password reset email sent'
      });

      const response = await request(app)
        .post('/auth/forget-password')
        .send(validEmail);

      expect(response.status).toBe(200);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(validEmail.email);
    });

    test('should handle missing email', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(new Error('Email is required'));

      const response = await request(app)
        .post('/auth/forget-password')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.message).toBe('Email is required');
    });

    test('should handle empty email', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(new Error('Email is required'));

      const response = await request(app)
        .post('/auth/forget-password')
        .send({ email: '' });

      expect(response.status).toBe(422);
    });

    test('should handle invalid email format', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(new Error('Invalid email format'));

      const response = await request(app)
        .post('/auth/forget-password')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email format');
    });
  });

  describe('Data Type Validation', () => {
    test('should handle non-string email', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Email must be a string'));

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 12345,
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
    });

    test('should handle non-string password', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Password must be a string'));

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 12345,
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
    });

    test('should handle null values', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Invalid input data'));

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: null,
          password: null,
          firstName: null,
          lastName: null
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Special Characters and Edge Cases', () => {
    test('should handle email with special characters', async () => {
      const specialEmail = { email: 'test+tag@example-domain.com' };

      mockAuthService.forgotPassword.mockResolvedValue({
        message: 'Password reset email sent'
      });

      const response = await request(app)
        .post('/auth/forget-password')
        .send(specialEmail);

      expect(response.status).toBe(200);
    });

    test('should handle very long email', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      
      mockAuthService.register.mockRejectedValue(new Error('Email too long'));

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: longEmail,
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      expect(response.status).toBe(400);
    });

    test('should handle names with special characters', async () => {
      const specialCharData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'José',
        lastName: "O'Connor"
      };

      mockAuthService.register.mockResolvedValue({
        message: 'User registered successfully',
        user: { uid: 'test-uid' }
      });

      const response = await request(app)
        .post('/auth/signup')
        .send(specialCharData);

      expect(response.status).toBe(201);
    });
  });
});
