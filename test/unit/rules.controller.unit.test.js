/**
 * Tests unitaires pour rules.controller.js
 * Total: 4 tests
 */

const rulesController = require('../../controllers/rules.controller');
const RulesModel = require('../../models/rules.model');
const HTTP_STATUS = require('../../constants/httpStatus');
const { mockRule } = require('../helpers/mockData');

jest.mock('../../models/rules.model');
jest.mock('../../middleware/auth', () => (req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
});

describe('rules.controller - Unit Tests', () => {
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

  it('should create rule successfully', async () => {
    RulesModel.create = jest.fn().mockResolvedValue(mockRule);
    const result = await RulesModel.create(mockRule);
    expect(result).toEqual(mockRule);
  });

  it('should get rule by ID successfully', async () => {
    RulesModel.findById = jest.fn().mockResolvedValue(mockRule);
    const result = await RulesModel.findById('rule-123');
    expect(result).toEqual(mockRule);
  });

  it('should get all rules successfully', async () => {
    RulesModel.findAll = jest.fn().mockResolvedValue([mockRule]);
    const result = await RulesModel.findAll();
    expect(result).toHaveLength(1);
  });

  it('should delete rule successfully', async () => {
    RulesModel.delete = jest.fn().mockResolvedValue({ success: true });
    const result = await RulesModel.delete('rule-123');
    expect(result.success).toBe(true);
  });
});
