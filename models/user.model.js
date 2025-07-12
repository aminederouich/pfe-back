const { db } = require('../config/firebase');
const { doc, setDoc, getDoc, updateDoc } = require('firebase/firestore');

class User {
  constructor(userData) {
    this.uid = userData.uid;
    this.email = userData.email;
    this.firstName = userData.FirstName || null;
    this.lastName = userData.LastName || null;
    this.isEmployee = userData.IsEmployee || true;
    this.isManager = userData.IsManager || false;
    this.photoURL = userData.photoURL || null;
    this.phoneNumber = userData.phoneNumber || null;
    this.createdAt = userData.createdAt || null;
    this.updatedAt = userData.updatedAt || null;
  }

  /**
   * Create a new user document in Firestore
   * @param {Object} userData - User data to create
   * @returns {Promise<User>} - Created user instance
   */
  static async create(userData) {
    try {
      const userRef = doc(db, 'users', userData.uid);
      const userDoc = {
        uid: userData.uid,
        email: userData.email,
        FirstName: userData.FirstName || null,
        LastName: userData.LastName || null,
        IsEmployee: userData.IsEmployee || false,
        IsManager: userData.IsManager || false,
        photoURL: userData.photoURL || null,
        phoneNumber: userData.phoneNumber || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(userRef, userDoc);
      return new User(userDoc);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user in database');
    }
  }

  /**
   * Find a user by UID
   * @param {string} uid - User UID
   * @returns {Promise<User|null>} - User instance or null if not found
   */
  static async findByUid(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return new User(userDoc.data());
      }
      return null;
    } catch (error) {
      console.error('Error finding user by UID:', error);
      throw new Error('Failed to retrieve user from database');
    }
  }

  /**
   * Update user information
   * @param {string} uid - User UID
   * @param {Object} updateData - Data to update
   * @returns {Promise<User>} - Updated user instance
   */
  static async update(uid, updateData) {
    try {
      const userRef = doc(db, 'users', uid);
      const updatedData = {
        ...updateData,
        updatedAt: new Date()
      };
      
      await updateDoc(userRef, updatedData);
      
      // Return updated user
      const updatedUser = await User.findByUid(uid);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user in database');
    }
  }

  /**
   * Convert user instance to public format (without sensitive data)
   * @returns {Object} - Public user data
   */
  toPublicFormat() {
    return {
      uid: this.uid,
      email: this.email,
      FirstName: this.firstName,
      LastName: this.lastName,
      IsEmployee: this.isEmployee,
      IsManager: this.isManager,
      photoURL: this.photoURL,
      phoneNumber: this.phoneNumber,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convert user instance to JWT payload format
   * @returns {Object} - JWT payload data
   */
  toJWTPayload() {
    return {
      uid: this.uid,
      email: this.email,
      isEmployee: this.isEmployee,
      isManager: this.isManager
    };
  }
}

module.exports = User;
