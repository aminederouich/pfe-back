/**
 * Mock Firebase Auth
 */

const mockAuth = {
  currentUser: null,
};

const signInWithEmailAndPassword = jest.fn((auth, email, password) => {
  return Promise.resolve({
    user: {
      uid: 'test-uid-123',
      email,
      emailVerified: true,
    },
  });
});

const createUserWithEmailAndPassword = jest.fn((auth, email, password) => {
  return Promise.resolve({
    user: {
      uid: `test-uid-new-${Date.now()}`,
      email,
      emailVerified: false,
    },
  });
});

const signOut = jest.fn(() => {
  mockAuth.currentUser = null;
  return Promise.resolve();
});

const sendPasswordResetEmail = jest.fn(() => {
  return Promise.resolve();
});

const sendEmailVerification = jest.fn(() => {
  return Promise.resolve();
});

module.exports = {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  mockAuth,
};
