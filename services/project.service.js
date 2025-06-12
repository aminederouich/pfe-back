const Project = require('../models/project.model');

class ProjectService {
  async getAllProjects() {
    try {
      return await Project.findAll();
    } catch (error) {
      throw new Error('Error retrieving projects');
    }
  }

  async createProject(projectData) {
    try {
      const exists = await Project.findByKey(projectData.key);
      if (exists) {
        throw new Error('Project with this key already exists');
      }

      const project = new Project(projectData);
      return await project.save();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProjectService();