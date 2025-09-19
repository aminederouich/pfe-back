/* eslint-disable complexity */
const { db } = require('../config/firebase');
const { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } = require('firebase/firestore');

class User {
  constructor(userData) {
    this.uid = userData.uid;
    this.emailAddress = userData.emailAddress || userData.email;
    this.firstName = userData.FirstName;
    this.lastName = userData.LastName;
    this.isEmployee = userData.IsEmployee;
    this.isManager = userData.IsManager;
    this.photoURL = userData.photoURL;
    this.phoneNumber = userData.phoneNumber;
    this.createdAt = userData.createdAt;
    this.updatedAt = userData.updatedAt;
    this.managerId = userData.managerId;
    this.accountId = userData.accountId;
    this.accountType = userData.accountType;
    this.displayName = userData.displayName;
    this.avatarUrls = userData.avatarUrls;
    this.active = userData.active;
    this.invited = userData.invited;
    this.locale = userData.locale;
    this.self = userData.self;
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
        avatarUrls: userData.avatarUrls || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        managerId: userData.managerId || null,
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
   * Find a user by accountId
   * @param {string} accountId - accountId field stored in document
   * @returns {Promise<User|null>} - User instance or null
   */
  static async findByAccountId(accountId) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('accountId', '==', accountId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      return new User(snapshot.docs[0].data());
    } catch (error) {
      console.error('Error finding user by accountId:', error);
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
        updatedAt: new Date(),
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
      accountId: this.accountId,
      emailAddress: this.emailAddress,
      FirstName: this.firstName,
      LastName: this.lastName,
      IsEmployee: this.isEmployee,
      displayName: this.displayName,
      IsManager: this.isManager,
      photoURL: this.photoURL,
      phoneNumber: this.phoneNumber,
      accountType: this.accountType,
      avatarUrls: this.avatarUrls,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      managerId: this.managerId,
      invited: this.invited,
      locale: this.locale,
      self: this.self,
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
      isManager: this.isManager,
      accountId: this.accountId,
      accountType: this.accountType,
    };
  }
}

module.exports = User;
