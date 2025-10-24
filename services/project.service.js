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

  async getProjectsPaginated(configData, maxResults = 50, startAt = 0) {
    const url = `${configData.protocol}://${configData.host}/rest/api/${configData.apiVersion}/project/search?maxResults=${maxResults}&startAt=${startAt}`;
    const headers = {
      Authorization: `Basic ${Buffer.from(
        `${configData.username}:${configData.password}`,
      ).toString('base64')}`,
      'Accept': 'application/json',
    };
    try {
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Jira connection test failed: ${error.message}`);
    }

  }
}

module.exports = new ProjectService();
