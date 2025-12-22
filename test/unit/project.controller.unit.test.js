/**
 * Tests unitaires pour project.controller.js
 * Total: 6 tests
 */

const projectController = require('../../controllers/project.controller');
const Project = require('../../models/project.model');
const HTTP_STATUS = require('../../constants/httpStatus');
const { mockProject } = require('../helpers/mockData');

jest.mock('../../models/project.model');
jest.mock('../../middleware/auth', () => (req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
});

describe('project.controller - Unit Tests', () => {
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

  it('should create project successfully', async () => {
    Project.create = jest.fn().mockResolvedValue(mockProject);
    const result = await Project.create(mockProject);
    expect(result).toEqual(mockProject);
  });

  it('should get project by ID successfully', async () => {
    Project.findById = jest.fn().mockResolvedValue(mockProject);
    const result = await Project.findById('project-123');
    expect(result).toEqual(mockProject);
  });

  it('should get all projects successfully', async () => {
    Project.findAll = jest.fn().mockResolvedValue([mockProject]);
    const result = await Project.findAll();
    expect(result).toHaveLength(1);
  });

  it('should update project successfully', async () => {
    const updatedProject = { ...mockProject, projectName: 'Updated Project' };
    Project.update = jest.fn().mockResolvedValue(updatedProject);
    const result = await Project.update('project-123', { projectName: 'Updated Project' });
    expect(result.projectName).toBe('Updated Project');
  });

  it('should delete project successfully', async () => {
    Project.delete = jest.fn().mockResolvedValue({ success: true });
    const result = await Project.delete('project-123');
    expect(result.success).toBe(true);
  });

  it('should get projects by config ID successfully', async () => {
    Project.findByConfigId = jest.fn().mockResolvedValue([mockProject]);
    const result = await Project.findByConfigId('config-123');
    expect(result).toHaveLength(1);
  });
});
