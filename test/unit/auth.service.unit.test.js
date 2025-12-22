/**
 * Tests unitaires pour auth.service.js
 * Total: 12 tests
 */

const AuthService = require('../../services/auth.service');
const User = require('../../models/user.model');
const jwt = require('jsonwebtoken');
const { mockUser } = require('../helpers/mockData');

// Mock Firebase Auth
jest.mock('firebase/auth');
const {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} = require('firebase/auth');

// Mock User Model
jest.mock('../../models/user.model');

describe('AuthService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      createUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'new-uid', email: userData.email },
      });

      User.create.mockResolvedValue({
        toPublicFormat: () => ({ uid: 'new-uid', email: userData.email, firstName: 'New', lastName: 'User' }),
      });

      const result = await AuthService.register(userData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User created successfully');
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), userData.email, userData.password);
      expect(User.create).toHaveBeenCalled();
    });

    it('should throw error when required fields are missing', async () => {
      await expect(AuthService.register({ email: 'test@example.com' }))
        .rejects.toThrow('All required fields must be provided');
    });

    it('should handle weak password error', async () => {
      createUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/weak-password' });

      await expect(AuthService.register({
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
      })).rejects.toThrow('The password is too weak');
    });

    it('should handle email already in use error', async () => {
      createUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/email-already-in-use' });

      await expect(AuthService.register({
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      })).rejects.toThrow('The email address is already in use by another account');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };

      signInWithEmailAndPassword.mockResolvedValue({
        user: { uid: mockUser.uid, email: credentials.email },
      });

      User.findByUid.mockResolvedValue({
        toPublicFormat: () => mockUser,
        toJWTPayload: () => ({ uid: mockUser.uid, email: mockUser.email }),
      });

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Sign in successful');
      expect(result.token).toBeDefined();
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), credentials.email, credentials.password);
    });

    it('should throw error when email or password is missing', async () => {
      await expect(AuthService.login({ email: 'test@example.com' }))
        .rejects.toThrow('Email and password are required');
    });

    it('should handle incorrect password error', async () => {
      signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/wrong-password' });

      await expect(AuthService.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow('Incorrect password');
    });

    it('should handle user not found error', async () => {
      signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/user-not-found' });

      await expect(AuthService.login({ email: 'nonexistent@example.com', password: 'password' }))
        .rejects.toThrow('No user found with this email');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      signOut.mockResolvedValue();

      const result = await AuthService.logout();

      expect(result.success).toBe(true);
      expect(result.message).toBe('User has been logged out successfully');
      expect(signOut).toHaveBeenCalled();
    });

    it('should handle logout error', async () => {
      signOut.mockRejectedValue(new Error('Logout failed'));

      await expect(AuthService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email successfully', async () => {
      sendPasswordResetEmail.mockResolvedValue();

      const result = await AuthService.forgotPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent');
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should throw error when email is missing', async () => {
      await expect(AuthService.forgotPassword()).rejects.toThrow('Email is required');
    });
  });

  describe('verifyToken', () => {
    it('should verify token and return user data', async () => {
      const token = jwt.sign({ uid: mockUser.uid }, process.env.JWT_SECRET);

      User.findByUid.mockResolvedValue({
        toPublicFormat: () => mockUser,
      });

      const result = await AuthService.verifyToken(token);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should throw error for invalid token', async () => {
      await expect(AuthService.verifyToken('invalid-token'))
        .rejects.toThrow('Invalid token');
    });
  });
});
