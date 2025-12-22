/**
 * Tests unitaires pour project.service.js
 * Total: 4 tests
 */

const projectService = require('../../services/project.service');
const Project = require('../../models/project.model');
const { mockProject } = require('../helpers/mockData');

jest.mock('../../models/project.model');

describe('project.service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create project successfully', async () => {
      Project.create = jest.fn().mockResolvedValue(mockProject);

      const projectData = {
        projectKey: 'PROJ',
        projectName: 'Test Project',
        jiraConfigId: 'config-123',
      };

      const result = await projectService.createProject(projectData);

      expect(result).toEqual(mockProject);
      expect(Project.create).toHaveBeenCalledWith(projectData);
    });
  });

  describe('getProjectById', () => {
    it('should retrieve project by ID', async () => {
      Project.findById = jest.fn().mockResolvedValue(mockProject);

      const result = await projectService.getProjectById('project-123');

      expect(result).toEqual(mockProject);
      expect(Project.findById).toHaveBeenCalledWith('project-123');
    });
  });

  describe('getAllProjects', () => {
    it('should retrieve all projects', async () => {
      const mockProjects = [mockProject, { ...mockProject, id: 'project-456' }];
      Project.findAll = jest.fn().mockResolvedValue(mockProjects);

      const result = await projectService.getAllProjects();

      expect(result).toHaveLength(2);
      expect(Project.findAll).toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      Project.delete = jest.fn().mockResolvedValue({ success: true });

      const result = await projectService.deleteProject('project-123');

      expect(result.success).toBe(true);
      expect(Project.delete).toHaveBeenCalledWith('project-123');
    });
  });
});
