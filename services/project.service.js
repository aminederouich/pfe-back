const Project = require('../models/project.model');

class ProjectService {
  async getAllProjects() {
    try {
      return await Project.findAll();
    } catch {
      throw new Error('Error retrieving projects');
    }
  }

  async createProject(projectData) {
    const exists = await Project.findByKey(projectData.key);
    if (exists) {
      throw new Error('Project with this key already exists');
    }

    const project = new Project(projectData);
    return project.save();
  }

  async deleteProjectById(projectIds) {
    for (const id of projectIds) {
      await Project.deleteById(id);
    }
    return { message: 'Projects deleted successfully' };
  }

  async updateProjectById(
    projectId,
    projectName,
    key,
    projectType,
    projectCategory,
    projectLead,
  ) {
    return Project.updateById(
      projectId,
      projectName,
      key,
      projectType,
      projectCategory,
      projectLead,
    );
  }
}

module.exports = new ProjectService();
