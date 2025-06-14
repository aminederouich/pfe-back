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

  async deleteProjectById(projectIds) {
    try {
      const deleted = [];
      for (const id of projectIds) {
        const project = await Project.deleteById(id);
        console.log('ppp',project);
      }
      return { message: 'Projects deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProjectService();