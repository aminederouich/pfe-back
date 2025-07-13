const request = require('supertest');
const express = require('express');

// Mock du service de projet
const mockProjectService = {
  getAllProjects: jest.fn(),
  createProject: jest.fn(),
  deleteProjectById: jest.fn(),
  updateProjectById: jest.fn()
};

// Mock simple du middleware d'authentification
const mockAuthMiddleware = (req, res, next) => {
  req.user = { uid: 'test-uid-123' };
  next();
};

// Mocks définis avant l'importation des modules
jest.mock('../services/project.service', () => mockProjectService);
jest.mock('../middleware/auth', () => mockAuthMiddleware);

// Import des routes après les mocks
const projectRoutes = require('../routes/project.routes');

describe('Project Routes Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/project', projectRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /project/getAllProject', () => {
    test('should retrieve all projects successfully', async () => {
      const mockProjects = [
        {
          id: 1,
          projectName: 'Test Project 1',
          key: 'TP1',
          projectType: 'Software',
          projectCategory: 'Development',
          projectLead: 'John Doe'
        },
        {
          id: 2,
          projectName: 'Test Project 2',
          key: 'TP2',
          projectType: 'Business',
          projectCategory: 'Service Desk',
          projectLead: 'Jane Smith'
        }
      ];

      mockProjectService.getAllProjects.mockResolvedValue(mockProjects);

      const response = await request(app)
        .get('/project/getAllProject')
        .expect(200);

      expect(response.body).toEqual({
        error: false,
        message: 'Projects retrieved successfully',
        data: mockProjects
      });
      expect(mockProjectService.getAllProjects).toHaveBeenCalled();
    });

    test('should handle errors when retrieving projects', async () => {
      mockProjectService.getAllProjects.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/project/getAllProject')
        .expect(500);

      expect(response.body).toEqual({
        error: true,
        message: 'Database error'
      });
    });
  });

  describe('POST /project/addNewProject', () => {
    test('should add a new project successfully', async () => {
      const projectData = {
        projectName: 'New Test Project',
        key: 'NTP',
        projectType: 'Software',
        projectCategory: 'Development',
        projectLead: 'John Doe'
      };

      const mockNewProject = {
        id: 3,
        ...projectData
      };

      mockProjectService.createProject.mockResolvedValue(mockNewProject);

      const response = await request(app)
        .post('/project/addNewProject')
        .send(projectData)
        .expect(201);

      expect(response.body).toEqual({
        error: false,
        message: 'Project added successfully',
        data: mockNewProject
      });
      expect(mockProjectService.createProject).toHaveBeenCalledWith(projectData);
    });

    test('should return 400 when required fields are missing', async () => {
      const incompleteData = {
        projectName: 'Incomplete Project',
        key: 'IP'
        // Missing projectType, projectCategory, projectLead
      };

      const response = await request(app)
        .post('/project/addNewProject')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'All fields are required'
      });
      expect(mockProjectService.createProject).not.toHaveBeenCalled();
    });

    test('should handle duplicate project key error', async () => {
      const projectData = {
        projectName: 'Duplicate Project',
        key: 'EXISTING_KEY',
        projectType: 'Software',
        projectCategory: 'Development',
        projectLead: 'John Doe'
      };

      mockProjectService.createProject.mockRejectedValue(
        new Error('Project with this key already exists')
      );

      const response = await request(app)
        .post('/project/addNewProject')
        .send(projectData)
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'Project with this key already exists'
      });
    });

    test('should handle general creation errors', async () => {
      const projectData = {
        projectName: 'Error Project',
        key: 'EP',
        projectType: 'Software',
        projectCategory: 'Development',
        projectLead: 'John Doe'
      };

      mockProjectService.createProject.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/project/addNewProject')
        .send(projectData)
        .expect(500);

      expect(response.body).toEqual({
        error: true,
        message: 'Error adding project'
      });
    });
  });

  describe('POST /project/deleteProjectByID', () => {
    test('should delete project successfully', async () => {
      const projectId = 1;
      
      mockProjectService.deleteProjectById.mockResolvedValue({ id: projectId });

      const response = await request(app)
        .post('/project/deleteProjectByID')
        .send({ ids: projectId })
        .expect(200);

      expect(response.body).toEqual({
        error: false,
        message: 'Project deleted successfully'
      });
      expect(mockProjectService.deleteProjectById).toHaveBeenCalledWith(projectId);
    });

    test('should return 400 when project ID is missing', async () => {
      const response = await request(app)
        .post('/project/deleteProjectByID')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'Project ID is required'
      });
      expect(mockProjectService.deleteProjectById).not.toHaveBeenCalled();
    });

    test('should return 404 when project not found', async () => {
      const projectId = 999;
      
      mockProjectService.deleteProjectById.mockResolvedValue(null);

      const response = await request(app)
        .post('/project/deleteProjectByID')
        .send({ ids: projectId })
        .expect(404);

      expect(response.body).toEqual({
        error: true,
        message: 'Project not found'
      });
    });

    test('should handle deletion errors', async () => {
      const projectId = 1;
      
      mockProjectService.deleteProjectById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/project/deleteProjectByID')
        .send({ ids: projectId })
        .expect(500);

      expect(response.body).toEqual({
        error: true,
        message: 'Error deleting project'
      });
    });
  });

  describe('POST /project/updateProjectByID', () => {
    test('should update project successfully', async () => {
      const updateData = {
        projectId: 1,
        projectData: {
          projectName: 'Updated Project',
          key: 'UP',
          projectType: 'Business',
          projectCategory: 'Service Desk',
          projectLead: 'Jane Smith'
        }
      };

      mockProjectService.updateProjectById.mockResolvedValue({ id: 1 });

      const response = await request(app)
        .post('/project/updateProjectByID')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        error: false,
        message: 'Project updated successfully'
      });
      expect(mockProjectService.updateProjectById).toHaveBeenCalledWith(
        1,
        'Updated Project',
        'UP',
        'Business',
        'Service Desk',
        'Jane Smith'
      );
    });

    test('should return 400 when required fields are missing', async () => {
      const incompleteData = {
        projectId: 1,
        projectData: {
          projectName: 'Incomplete Update'
          // Missing other required fields
        }
      };

      const response = await request(app)
        .post('/project/updateProjectByID')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'All fields are required'
      });
      expect(mockProjectService.updateProjectById).not.toHaveBeenCalled();
    });

    test('should return 404 when project not found', async () => {
      const updateData = {
        projectId: 999,
        projectData: {
          projectName: 'Nonexistent Project',
          key: 'NP',
          projectType: 'Software',
          projectCategory: 'Development',
          projectLead: 'John Doe'
        }
      };

      mockProjectService.updateProjectById.mockResolvedValue(null);

      const response = await request(app)
        .post('/project/updateProjectByID')
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        error: true,
        message: 'Project not found'
      });
    });

    test('should handle update errors', async () => {
      const updateData = {
        projectId: 1,
        projectData: {
          projectName: 'Error Project',
          key: 'EP',
          projectType: 'Software',
          projectCategory: 'Development',
          projectLead: 'John Doe'
        }
      };

      mockProjectService.updateProjectById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/project/updateProjectByID')
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({
        error: true,
        message: 'Error updating project'
      });
    });
  });
});
