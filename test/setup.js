// Configuration globale pour les tests Jest
// Ce fichier est exécuté avant tous les tests

/* eslint-env jest */
/* eslint-disable no-unused-vars */

// Augmenter les timeouts pour éviter les timeouts prématurés
jest.setTimeout(10000);

// Mock console pour réduire le bruit pendant les tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// Configuration pour éviter les warnings de process
process.on('unhandledRejection', () => {
  // Capturer les rejections non gérées pendant les tests
});

process.on('uncaughtException', () => {
  // Capturer les exceptions non gérées pendant les tests
});
