/**
 * Mock Firebase Config
 */

const { mockAuth } = require('../firebase/auth');
const { mockDb } = require('../firebase/firestore');

module.exports = {
  auth: mockAuth,
  db: mockDb,
};
