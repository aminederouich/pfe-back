require('dotenv').config();
const { auth } = require('../config/firebase');
const {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} = require('firebase/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration result
   */
  static async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new Error('All required fields must be provided');
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user profile in Firestore
      const user = await User.create({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        FirstName: firstName,
        LastName: lastName,
      });

      return {
        success: true,
        message: 'User created successfully',
        user: user.toPublicFormat(),
      };
    } catch (error) {
      console.error('Registration error:', error);

      // Handle specific Firebase Auth errors
      if (error.code === 'auth/weak-password') {
        throw new Error('The password is too weak');
      } else if (error.code === 'auth/email-already-in-use') {
        throw new Error('The email address is already in use by another account');
      } else if (error.message === 'Failed to create user in database') {
        throw new Error('Failed to create user profile');
      }

      throw new Error('Registration failed');
    }
  }

  /**
   * Authenticate user login
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} - Authentication result
   */
  static async login(credentials) {
    const { email, password } = credentials;

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user profile from database
      const user = await User.findByUid(firebaseUser.uid);
      if (!user) {
        throw new Error('User profile not found');
      }

      // Generate JWT token
      const token = this.generateToken(user.toJWTPayload());

      return {
        success: true,
        message: 'Sign in successful',
        token,
        user: user.toPublicFormat(),
      };
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific Firebase Auth errors
      switch (error.code) {
      case 'auth/wrong-password':
        throw new Error('Incorrect password');
      case 'auth/user-not-found':
        throw new Error('No user found with this email');
      case 'auth/invalid-email':
        throw new Error('Invalid email address');
      case 'auth/too-many-requests':
        throw new Error('Too many login attempts. Please try again later.');
      default:
        if (error.message === 'User profile not found') {
          throw error;
        }
        throw new Error('Authentication failed');
      }
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} - Logout result
   */
  static async logout() {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'User has been logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<Object>} - Password reset result
   */
  static async forgotPassword(email) {
    if (!email) {
      throw new Error('Email is required');
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent',
      };
    } catch (error) {
      console.error('Forgot password error:', error);

      switch (error.code) {
      case 'auth/invalid-email':
        throw new Error('Invalid email address');
      case 'auth/user-not-found':
        throw new Error('No user found with this email');
      default:
        throw new Error('Failed to send password reset email');
      }
    }
  }

  /**
   * Send email verification
   * @returns {Promise<Object>} - Email verification result
   */
  static async sendEmailVerification() {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      await sendEmailVerification(auth.currentUser);
      return {
        success: true,
        message: 'Email verification sent',
      };
    } catch (error) {
      console.error('Email verification error:', error);

      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error('Failed to send email verification');
    }
  }

  /**
   * Verify JWT token and get user data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Token verification result
   */
  static async verifyToken(token) {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByUid(decoded.uid);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: user.toPublicFormat(),
        tokenData: decoded,
      };
    } catch (error) {
      console.error('Token verification error:', error);

      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @returns {string} - JWT token
   */
  static generateToken(payload) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
  }

  /**
   * Get user profile by UID
   * @param {string} uid - User UID
   * @returns {Promise<Object>} - User profile result
   */
  static async getUserProfile(uid) {
    try {
      const user = await User.findByUid(uid);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: user.toPublicFormat(),
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      throw new Error('Failed to retrieve user profile');
    }
  }
}

module.exports = AuthService;
