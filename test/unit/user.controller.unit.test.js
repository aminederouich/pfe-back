/**
 * Tests unitaires pour user.controller.js
 * Total: 6 tests
 */

const userController = require('../../controllers/user.controller');
const User = require('../../models/user.model');
const HTTP_STATUS = require('../../constants/httpStatus');
const { getDocs } = require('firebase/firestore');
const { mockUser, mockUsers } = require('../helpers/mockData');

jest.mock('../../models/user.model');
jest.mock('firebase/firestore');
jest.mock('../../middleware/auth', () => (req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
});

describe('user.controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should retrieve all users successfully', async () => {
      const mockSnapshot = {
        forEach: (callback) => {
          mockUsers.forEach(user => callback({ data: () => user }));
        },
      };
      getDocs.mockResolvedValue(mockSnapshot);

      await userController.getAllUsers[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        message: 'Users retrieved successfully',
        users: expect.any(Array),
      });
    });

    it('should handle error when retrieving users', async () => {
      getDocs.mockRejectedValue(new Error('Database error'));

      await userController.getAllUsers[1](req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getUserByAccountId', () => {
    it('should retrieve user by accountId successfully', async () => {
      req.params = { accountId: 'jira-123' };
      User.findByAccountId.mockResolvedValue({
        toPublicFormat: () => mockUser,
      });

      await userController.getUserByAccountId(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      req.params = { accountId: 'invalid' };
      User.findByAccountId.mockResolvedValue(null);

      await userController.getUserByAccountId(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('getUserByUid', () => {
    it('should retrieve user by UID successfully', async () => {
      req.params = { uid: 'test-uid-123' };
      User.findByUid.mockResolvedValue({
        toPublicFormat: () => mockUser,
      });

      await userController.getUserByUid(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found by UID', async () => {
      req.params = { uid: 'invalid-uid' };
      User.findByUid.mockResolvedValue(null);

      await userController.getUserByUid(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    });
  });

  describe('getTicketStatsByUser', () => {
    it('should retrieve ticket stats successfully', async () => {
      req.params = { uid: 'test-uid-123' };
      
      const mockTicketDocs = [
        { 
          data: () => ({ 
            assignedTo: 'test-uid-123', 
            score: 10, 
            createdAt: { seconds: Date.now() / 1000 - 86400 } // 1 day ago
          })
        },
        { 
          data: () => ({ 
            assignedTo: 'test-uid-123', 
            score: 20, 
            createdAt: { seconds: Date.now() / 1000 - 864000 } // 10 days ago
          })
        },
      ];

      getDocs.mockResolvedValue({
        size: 2,
        forEach: (callback) => {
          mockTicketDocs.forEach(doc => callback(doc));
        },
      });

      await userController.getTicketStatsByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        total: 2,
        weekly: 1,
        score: 30,
      });
    });

    it('should handle error when retrieving stats', async () => {
      req.params = { uid: 'test-uid-123' };
      getDocs.mockRejectedValue(new Error('Database error'));

      await userController.getTicketStatsByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });
});
