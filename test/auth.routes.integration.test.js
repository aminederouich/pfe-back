const request = require('supertest');
const app = require('../app');

// Mock Firebase pour les tests
jest.mock('../config/firebase', () => ({
  auth: {},
  db: {}
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerification: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn()
}));

describe('Auth Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('POST /auth/signup', () => {
    it('should register a new user successfully', async () => {
      // Mock Firebase functions
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      const { doc, setDoc } = require('firebase/firestore');
      
      createUserWithEmailAndPassword.mockResolvedValue({
        user: {
          uid: 'test-uid-123',
          email: 'test@example.com'
        }
      });
      
      doc.mockReturnValue({ id: 'users/test-uid-123' });
      setDoc.mockResolvedValue();

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.error).toBe(false);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        email: 'test@example.com'
        // missing password and name
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.message).toBe('Email, password, and name are required');
    });
  });

  describe('POST /auth/signin', () => {
    it('should login user successfully', async () => {
      // Mock Firebase functions
      const { signInWithEmailAndPassword } = require('firebase/auth');
      const { doc, getDoc } = require('firebase/firestore');
      
      signInWithEmailAndPassword.mockResolvedValue({
        user: {
          uid: 'test-uid-123',
          email: 'test@example.com'
        }
      });
      
      doc.mockReturnValue({ id: 'users/test-uid-123' });
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid-123',
          email: 'test@example.com',
          name: 'Test User',
          IsEmployee: false,
          IsManager: false
        })
      });

      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/signin')
        .send(credentials)
        .expect(200);

      expect(response.body.error).toBe(false);
      expect(response.body.message).toBe('Sign in successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('should return 422 for missing credentials', async () => {
      const credentials = {
        email: 'test@example.com'
        // missing password
      };

      const response = await request(app)
        .post('/auth/signin')
        .send(credentials)
        .expect(422);

      expect(response.body.error).toBe(true);
      expect(response.body.message).toBe('Email and password are required');
    });
  });

  describe('GET /auth/check-auth', () => {
    it('should return user info for valid token', async () => {
      const AuthService = require('../services/auth.service');
      
      // Create a valid token
      const tokenPayload = {
        uid: 'test-uid-123',
        email: 'test@example.com',
        isEmployee: false,
        isManager: false
      };
      const token = AuthService.generateToken(tokenPayload);

      // Mock User.findByUid
      const { doc, getDoc } = require('firebase/firestore');
      doc.mockReturnValue({ id: 'users/test-uid-123' });
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid-123',
          email: 'test@example.com',
          name: 'Test User',
          IsEmployee: false,
          IsManager: false
        })
      });

      const response = await request(app)
        .get('/auth/check-auth')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.error).toBe(false);
      expect(response.body.message).toBe('User is authenticated');
      expect(response.body.user).toBeDefined();
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/auth/check-auth')
        .expect(401);

      expect(response.body.error).toBe(true);
      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('POST /auth/forget-password', () => {
    it('should send password reset email', async () => {
      const { sendPasswordResetEmail } = require('firebase/auth');
      sendPasswordResetEmail.mockResolvedValue();

      const response = await request(app)
        .post('/auth/forget-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.error).toBe(false);
      expect(response.body.message).toBe('Password reset email sent');
    });

    it('should return 422 for missing email', async () => {
      const response = await request(app)
        .post('/auth/forget-password')
        .send({})
        .expect(422);

      expect(response.body.error).toBe(true);
      expect(response.body.message).toBe('Email is required');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user successfully', async () => {
      const AuthService = require('../services/auth.service');
      const { signOut } = require('firebase/auth');
      
      // Create a valid token
      const tokenPayload = {
        uid: 'test-uid-123',
        email: 'test@example.com',
        isEmployee: false,
        isManager: false
      };
      const token = AuthService.generateToken(tokenPayload);
      
      signOut.mockResolvedValue();

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.error).toBe(false);
      expect(response.body.message).toBe('User has been logged out successfully');
      expect(response.body.clearToken).toBe(true);
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(401);

      expect(response.body.error).toBe(true);
      expect(response.body.message).toBe('Authentication required');
    });
  });
});
