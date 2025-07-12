const AuthService = require('../services/auth.service');
const User = require('../models/user.model');

// Mock Firebase
jest.mock('../config/firebase', () => ({
  auth: {},
  db: {}
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerification: jest.fn()
}));

// Mock User model
jest.mock('../models/user.model');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock Firebase createUserWithEmailAndPassword
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      createUserWithEmailAndPassword.mockResolvedValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com'
        }
      });

      // Mock User.create
      const mockUser = {
        toPublicFormat: () => ({
          uid: 'test-uid',
          email: 'test@example.com',
          name: 'Test User'
        })
      };
      User.create.mockResolvedValue(mockUser);

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const result = await AuthService.register(userData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User created successfully');
      expect(result.user.email).toBe('test@example.com');
      expect(User.create).toHaveBeenCalledWith({
        uid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User',
        FirstName: undefined,
        LastName: undefined
      });
    });

    it('should throw error for missing required fields', async () => {
      const userData = {
        email: 'test@example.com'
        // missing password and name
      };

      await expect(AuthService.register(userData)).rejects.toThrow('Email, password, and name are required');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Mock Firebase signInWithEmailAndPassword
      const { signInWithEmailAndPassword } = require('firebase/auth');
      signInWithEmailAndPassword.mockResolvedValue({
        user: {
          uid: 'test-uid',
          email: 'test@example.com'
        }
      });

      // Mock User.findByUid
      const mockUser = {
        toJWTPayload: () => ({
          uid: 'test-uid',
          email: 'test@example.com',
          isEmployee: false,
          isManager: false
        }),
        toPublicFormat: () => ({
          uid: 'test-uid',
          email: 'test@example.com',
          name: 'Test User'
        })
      };
      User.findByUid.mockResolvedValue(mockUser);

      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Sign in successful');
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error for missing credentials', async () => {
      const credentials = {
        email: 'test@example.com'
        // missing password
      };

      await expect(AuthService.login(credentials)).rejects.toThrow('Email and password are required');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const { signOut } = require('firebase/auth');
      signOut.mockResolvedValue();

      const result = await AuthService.logout();

      expect(result.success).toBe(true);
      expect(result.message).toBe('User has been logged out successfully');
      expect(signOut).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email successfully', async () => {
      const { sendPasswordResetEmail } = require('firebase/auth');
      sendPasswordResetEmail.mockResolvedValue();

      const result = await AuthService.forgotPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent');
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'test@example.com');
    });

    it('should throw error for missing email', async () => {
      await expect(AuthService.forgotPassword()).rejects.toThrow('Email is required');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token successfully', async () => {
      // Create a valid token
      const payload = {
        uid: 'test-uid',
        email: 'test@example.com',
        isEmployee: false,
        isManager: false
      };
      const token = AuthService.generateToken(payload);

      // Mock User.findByUid
      const mockUser = {
        toPublicFormat: () => ({
          uid: 'test-uid',
          email: 'test@example.com',
          name: 'Test User'
        })
      };
      User.findByUid.mockResolvedValue(mockUser);

      const result = await AuthService.verifyToken(token);

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokenData.uid).toBe('test-uid');
    });

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid-token';

      await expect(AuthService.verifyToken(invalidToken)).rejects.toThrow('Invalid token');
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = {
        toPublicFormat: () => ({
          uid: 'test-uid',
          email: 'test@example.com',
          name: 'Test User'
        })
      };
      User.findByUid.mockResolvedValue(mockUser);

      const result = await AuthService.getUserProfile('test-uid');

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
      expect(User.findByUid).toHaveBeenCalledWith('test-uid');
    });

    it('should throw error for non-existent user', async () => {
      User.findByUid.mockResolvedValue(null);

      await expect(AuthService.getUserProfile('non-existent-uid')).rejects.toThrow('User not found');
    });
  });
});
