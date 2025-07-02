const JiraConfig = require("../models/jiraConfig.model");
const JiraApi = require("jira-client");

class JiraConfigService {
  async getAllConfigs() {
    try {
      return await JiraConfig.findAll();
    } catch (error) {
      throw new Error("Error retrieving Jira configurations");
    }
  }

  async createConfig(configData) {
    try {
      // Vérifier si la configuration existe déjà pour ce host
      const exists = await JiraConfig.findByHost(configData.host);
      if (exists) {
        throw new Error("Configuration already exists for this host");
      }

      const config = new JiraConfig(configData);
      return await config.save();
    } catch (error) {
      throw error;
    }
  }

  async deleteConfigById(configIds) {
    try {
      const results = [];
      for (const id of configIds) {
        const result = await JiraConfig.deleteById(id);
        results.push(result);
      }
      return { message: "Jira configurations deleted successfully", results };
    } catch (error) {
      throw error;
    }
  }

  async updateConfigById(id, configData) {
    try {
      return await JiraConfig.updateById(id, configData);
    } catch (error) {
      throw error;
    }
  }

  async getConfigById(id) {
    try {
      const config = await JiraConfig.findById(id);
      if (!config) {
        throw new Error("Jira configuration not found");
      }
      return config;
    } catch (error) {
      throw error;
    }
  }

  async getEnabledConfigs() {
    try {
      return await JiraConfig.findEnabledConfigs();
    } catch (error) {
      throw new Error("Error retrieving enabled Jira configurations");
    }
  }

  async testConnection(configData) {
    try {
      const { protocol, host, username, password, apiVersion, strictSSL } =
        configData;

      // Validation des paramètres requis
      if (
        !protocol ||
        !host ||
        !username ||
        !password ||
        !apiVersion ||
        strictSSL === undefined
      ) {
        throw new Error("All connection parameters are required");
      }

      const jira = new JiraApi({
        protocol,
        host,
        username,
        password,
        apiVersion,
        strictSSL,
      });

      const response = await jira.getCurrentUser();

      if (response && response.accountId) {
        console.log("Connection successful for config:", response.accountId);
        return {
          success: true,
          message: "Connection successful",
          userInfo: {
            accountId: response.accountId,
            displayName: response.displayName,
            emailAddress: response.emailAddress,
          },
        };
      } else {
        throw new Error("Invalid response from Jira API");
      }
    } catch (error) {
      console.error("Jira connection test failed:", error.message);
      throw new Error("Connection failed: " + error.message);
    }
  }

  validateConfigData(configData) {
    const errors = {};

    if (!configData.protocol) {
      errors.protocol = "Protocol is required";
    } else if (!["http", "https"].includes(configData.protocol)) {
      errors.protocol = "Protocol must be 'http' or 'https'";
    }

    if (!configData.host) {
      errors.host = "Host is required";
    } else if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(configData.host)) {
      errors.host = "Invalid host format";
    }

    if (!configData.username) {
      errors.username = "Username is required";
    } else if (configData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!configData.password) {
      errors.password = "Password is required";
    } else if (configData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!configData.apiVersion) {
      errors.apiVersion = "API version is required";
    }

    if (configData.strictSSL === undefined) {
      errors.strictSSL = "StrictSSL setting is required";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}

module.exports = new JiraConfigService();
