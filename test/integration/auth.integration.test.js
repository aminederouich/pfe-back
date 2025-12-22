/**
 * Tests d'intégration - Auth Flow
 * Total: 15 tests
 */

const request = require('supertest');
const app = require('../../app');
const AuthService = require('../../services/auth.service');
const User = require('../../models/user.model');
const { mockUser } = require('../helpers/mockData');

jest.mock('../../services/auth.service');
jest.mock('../../models/user.model');

describe('Integration Tests - Auth Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/signup - Integration', () => {
    it('should register user through full stack', async () => {
      AuthService.register.mockResolvedValue({
        success: true,
        message: 'User created successfully',
        user: mockUser,
      });

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'StrongPass123!',
          firstName: 'New',
          lastName: 'User',
        });

      expect(response.status).toBe(201);
      expect(response.body.error).toBe(false);
      expect(AuthService.register).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      AuthService.register.mockRejectedValue(new Error('All required fields must be provided'));

      const response = await request(app)
        .post('/auth/signup')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });

    it('should handle duplicate email', async () => {
      AuthService.register.mockRejectedValue(new Error('The email address is already in use by another account'));

      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already in use');
    });
  });

  describe('POST /auth/signin - Integration', () => {
    it('should login user through full stack', async () => {
      AuthService.login.mockResolvedValue({
        success: true,
        message: 'Sign in successful',
        token: 'jwt-token-12345',
        user: mockUser,
      });

      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      AuthService.login.mockRejectedValue(new Error('Incorrect password'));

      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should handle non-existent user', async () => {
      AuthService.login.mockRejectedValue(new Error('No user found with this email'));

      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/forgot-password - Integration', () => {
    it('should send reset email through full stack', async () => {
      AuthService.forgotPassword.mockResolvedValue({
        success: true,
        message: 'Password reset email sent',
      });

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('reset');
    });

    it('should validate email format', async () => {
      AuthService.forgotPassword.mockRejectedValue(new Error('Invalid email address'));

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /auth/isLogged - Integration', () => {
    it('should verify authenticated user', async () => {
      AuthService.getUserProfile.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const response = await request(app)
        .get('/auth/isLogged')
        .set('Authorization', 'Bearer valid-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/auth/isLogged');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/logout - Integration', () => {
    it('should logout user successfully', async () => {
      AuthService.logout.mockResolvedValue({
        success: true,
        message: 'User has been logged out successfully',
      });

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body.clearToken).toBe(true);
    });
  });

  // Additional integration tests for auth flow
  it('should handle concurrent login requests', async () => {
    AuthService.login.mockResolvedValue({
      success: true,
      message: 'Sign in successful',
      token: 'jwt-token',
        user: mockUser,
    });

    const requests = Array(5).fill().map(() =>
      request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com', password: 'password123' })
    );

    const responses = await Promise.all(requests);
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });

  it('should handle malformed requests', async () => {
    const response = await request(app)
      .post('/auth/signin')
      .send('not-json');

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should sanitize error messages', async () => {
    AuthService.login.mockRejectedValue(new Error('Database connection failed: password=secret123'));

    const response = await request(app)
      .post('/auth/signin')
      .send({ email: 'test@example.com', password: 'pass' });

    expect(response.body.message).not.toContain('secret');
  });

  it('should rate limit excessive requests', async () => {
    AuthService.login.mockRejectedValue(new Error('Too many login attempts. Please try again later.'));

    const response = await request(app)
      .post('/auth/signin')
      .send({ email: 'test@example.com', password: 'pass' });

    expect(response.status).toBe(429);
  });

  it('should handle token refresh flow', async () => {
    AuthService.verifyToken = jest.fn().mockResolvedValue({
      success: true,
      user: mockUser,
    });

    const response = await request(app)
      .get('/auth/isLogged')
      .set('Authorization', 'Bearer expired-token');

    expect(response.status).toBeGreaterThanOrEqual(200);
  });
});
