const User = require('../models/user.model');

// Mock Firestore
jest.mock('../config/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn()
}));

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a User instance with correct properties', () => {
      const userData = {
        uid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User',
        FirstName: 'Test',
        LastName: 'User',
        IsEmployee: true,
        IsManager: false,
        photoURL: 'https://example.com/photo.jpg',
        phoneNumber: '+1234567890'
      };

      const user = new User(userData);

      expect(user.uid).toBe('test-uid');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.firstName).toBe('Test');
      expect(user.lastName).toBe('User');
      expect(user.isEmployee).toBe(true);
      expect(user.isManager).toBe(false);
      expect(user.photoURL).toBe('https://example.com/photo.jpg');
      expect(user.phoneNumber).toBe('+1234567890');
    });

    it('should set default values for optional fields', () => {
      const userData = {
        uid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User'
      };

      const user = new User(userData);

      expect(user.firstName).toBe(null);
      expect(user.lastName).toBe(null);
      expect(user.isEmployee).toBe(false);
      expect(user.isManager).toBe(false);
      expect(user.photoURL).toBe(null);
      expect(user.phoneNumber).toBe(null);
    });
  });

  describe('create', () => {
    it('should create a new user in Firestore', async () => {
      const { doc, setDoc } = require('firebase/firestore');
      doc.mockReturnValue({ id: 'users/test-uid' });
      setDoc.mockResolvedValue();

      const userData = {
        uid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User'
      };

      const user = await User.create(userData);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-uid');
      expect(setDoc).toHaveBeenCalledWith(
        { id: 'users/test-uid' },
        expect.objectContaining({
          uid: 'test-uid',
          email: 'test@example.com',
          name: 'Test User',
          FirstName: null,
          LastName: null,
          IsEmployee: false,
          IsManager: false,
          photoURL: null,
          phoneNumber: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      );
      expect(user).toBeInstanceOf(User);
    });
  });

  describe('findByUid', () => {
    it('should return user when found', async () => {
      const { doc, getDoc } = require('firebase/firestore');
      doc.mockReturnValue({ id: 'users/test-uid' });
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid',
          email: 'test@example.com',
          name: 'Test User'
        })
      });

      const user = await User.findByUid('test-uid');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-uid');
      expect(user).toBeInstanceOf(User);
      expect(user.uid).toBe('test-uid');
    });

    it('should return null when user not found', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({
        exists: () => false
      });

      const user = await User.findByUid('non-existent-uid');

      expect(user).toBe(null);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const { doc, updateDoc, getDoc } = require('firebase/firestore');
      doc.mockReturnValue({ id: 'users/test-uid' });
      updateDoc.mockResolvedValue();
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'test-uid',
          email: 'test@example.com',
          name: 'Updated User'
        })
      });

      const updateData = { name: 'Updated User' };
      const updatedUser = await User.update('test-uid', updateData);

      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'users/test-uid' },
        expect.objectContaining({
          name: 'Updated User',
          updatedAt: expect.any(Date)
        })
      );
      expect(updatedUser).toBeInstanceOf(User);
    });
  });

  describe('toPublicFormat', () => {
    it('should return public user data', () => {
      const userData = {
        uid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User',
        FirstName: 'Test',
        LastName: 'User',
        IsEmployee: true,
        IsManager: false
      };

      const user = new User(userData);
      const publicData = user.toPublicFormat();

      expect(publicData).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User',
        FirstName: 'Test',
        LastName: 'User',
        IsEmployee: true,
        IsManager: false,
        photoURL: null,
        phoneNumber: null
      });
    });
  });

  describe('toJWTPayload', () => {
    it('should return JWT payload data', () => {
      const userData = {
        uid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User',
        IsEmployee: true,
        IsManager: false
      };

      const user = new User(userData);
      const jwtPayload = user.toJWTPayload();

      expect(jwtPayload).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        isEmployee: true,
        isManager: false
      });
    });
  });
});
