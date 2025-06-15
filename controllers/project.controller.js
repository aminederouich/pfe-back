const projectService = require('../services/project.service');
const authMiddleware = require("../middleware/auth");

exports.getAllProject = [
  authMiddleware,
  async (req, res) => {
    try {
      const projects = await projectService.getAllProjects();
      res.status(200).json({
        error: false,
        message: "Projects retrieved successfully",
        data: projects,
      });
    } catch (error) {
      console.error("Error retrieving projects:", error);
      res.status(500).json({
        error: true,
        message: error.message,
      });
    }
  }
];

exports.addNewProject = [
  authMiddleware,
  async (req, res) => {
    const { projectName, key, projectType, projectCategory, projectLead } = req.body;

    if (!projectName || !key || !projectType || !projectCategory || !projectLead) {
      return res.status(400).json({
        error: true,
        message: "All fields are required",
      });
    }

    try {
      const newProject = await projectService.createProject({
        projectName,
        key,
        projectType,
        projectCategory,
        projectLead
      });

      res.status(201).json({
        error: false,
        message: "Project added successfully",
        data: newProject,
      });
    } catch (error) {
      if (error.message === 'Project with this key already exists') {
        return res.status(400).json({
          error: true,
          message: error.message,
        });
      }
      
      console.error("Error adding project:", error);
      res.status(500).json({
        error: true,
        message: "Error adding project",
      });
    }
  }
];

exports.deleteProjectByID = [
  authMiddleware,
  async (req, res) => {
    const { ids } = req.body;

    if (!ids) {
      return res.status(400).json({
        error: true,
        message: "Project ID is required",
      });
    }

    try {
      const deletedProject = await projectService.deleteProjectById(ids);

      if (!deletedProject) {
        return res.status(404).json({
          error: true,
          message: "Project not found",
        });
      }

      res.status(200).json({
        error: false,
        message: "Project deleted successfully",
        // data: deletedProject,
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({
        error: true,
        message: "Error deleting project",
      });
    }
  }
];

exports.updateProjectByID = [
  authMiddleware,
  async (req, res) => {
    const { projectId, projectData } = req.body;
    const { projectName, key, projectType, projectCategory, projectLead } = projectData;


    if (!projectId || !projectName || !key || !projectType || !projectCategory || !projectLead) {
      return res.status(400).json({
        error: true,
        message: "All fields are required",
      });
    }

    try {
      const updatedProject = await projectService.updateProjectById(projectId,
        projectName,
        key,
        projectType,
        projectCategory,
        projectLead
      );

      if (!updatedProject) {
        return res.status(404).json({
          error: true,
          message: "Project not found",
        });
      }

      res.status(200).json({
        error: false,
        message: "Project updated successfully",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({
        error: true,
        message: "Error updating project",
      });
    }
  }
];