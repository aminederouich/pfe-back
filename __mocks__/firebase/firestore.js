/**
 * Mock Firebase Firestore
 */

const mockDb = {};

const mockCollection = jest.fn((db, collectionName) => {
  return { _collectionName: collectionName };
});

const mockDoc = jest.fn((collection, docId) => {
  return { _collection: collection, _docId: docId };
});

const mockGetDocs = jest.fn(() => {
  return Promise.resolve({
    docs: [],
    empty: true,
  });
});

const mockGetDoc = jest.fn(() => {
  return Promise.resolve({
    exists: () => false,
    data: () => null,
  });
});

const mockSetDoc = jest.fn(() => {
  return Promise.resolve();
});

const mockUpdateDoc = jest.fn(() => {
  return Promise.resolve();
});

const mockDeleteDoc = jest.fn(() => {
  return Promise.resolve();
});

const mockAddDoc = jest.fn(() => {
  return Promise.resolve({ id: `new-doc-id-${Date.now()}` });
});

const mockQuery = jest.fn((collection, ...queryConstraints) => {
  return { _collection: collection, _constraints: queryConstraints };
});

const mockWhere = jest.fn((field, operator, value) => {
  return { _type: 'where', field, operator, value };
});

const mockOrderBy = jest.fn((field, direction) => {
  return { _type: 'orderBy', field, direction };
});

const mockLimit = jest.fn((count) => {
  return { _type: 'limit', count };
});

module.exports = {
  collection: mockCollection,
  doc: mockDoc,
  getDocs: mockGetDocs,
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  addDoc: mockAddDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  mockDb,
};
