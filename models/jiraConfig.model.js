const { db } = require('../config/firebase');
const {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
} = require('firebase/firestore');
const jiraConfigService = require('../services/jiraConfig.service');

class JiraConfig {
  constructor(configData) {
    this.protocol = configData.protocol;
    this.host = configData.host;
    this.username = configData.username;
    this.password = configData.password;
    this.apiVersion = configData.apiVersion;
    this.strictSSL = configData.strictSSL;
    this.enableConfig = configData.enableConfig || true;
  }

  static async findAll() {
    try {
      const jiraConfigRef = collection(db, 'jiraConfig');
      const querySnapshot = await getDocs(jiraConfigRef);
      const configs = [];
      querySnapshot.forEach((doc) => {
        configs.push({ id: doc.id, ...doc.data() });
      });
      return configs;
    } catch {
      throw new Error('Error retrieving Jira configurations');
    }
  }

  static async findById(id) {
    try {
      const configRef = doc(db, 'jiraConfig', id);
      const docSnapshot = await getDoc(configRef);
      if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() };
      }
      return null;
    } catch {
      throw new Error('Error retrieving Jira configuration');
    }
  }

  static async findByHost(host) {
    try {
      const jiraConfigRef = collection(db, 'jiraConfig');
      const q = query(jiraConfigRef, where('host', '==', host));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch {
      throw new Error('Error checking host existence');
    }
  }

  static async deleteById(id) {
    try {
      const configRef = doc(db, 'jiraConfig', id);
      await deleteDoc(configRef);
      return {
        message: `Jira configuration with id ${id} deleted successfully.`,
      };
    } catch {
      throw new Error('Error deleting Jira configuration');
    }
  }

  async save() {
    try {
      const jiraConfigRef = collection(db, 'jiraConfig');
      const docRef = await addDoc(jiraConfigRef, {
        protocol: this.protocol,
        host: this.host,
        username: this.username,
        password: this.password,
        apiVersion: this.apiVersion,
        strictSSL: this.strictSSL,
        enableConfig: this.enableConfig,
      });
      return { id: docRef.id, ...this };
    } catch {
      throw new Error('Error saving Jira configuration');
    }
  }

  static async updateById(id, configData) {
    try {
      const configRef = doc(db, 'jiraConfig', id);
      await setDoc(configRef, {
        protocol: configData.protocol,
        host: configData.host,
        username: configData.username,
        password: configData.password,
        apiVersion: configData.apiVersion,
        strictSSL: configData.strictSSL,
        enableConfig: configData.enableConfig,
      });
      return { id, ...configData };
    } catch {
      throw new Error('Error updating Jira configuration');
    }
  }

  static async findEnabledConfigs() {
    try {
      const jiraConfigRef = collection(db, 'jiraConfig');
      const q = query(jiraConfigRef, where('enableConfig', '==', true));
      const querySnapshot = await getDocs(q);
      const configs = [];
      querySnapshot.forEach((doc) => {
        configs.push({ id: doc.id, ...doc.data() });
      });
      return configs;
    } catch {
      throw new Error('Error retrieving enabled Jira configurations');
    }
  }

  static async validateConfig(configData) {
    const requiredFields = [
      'protocol',
      'host',
      'username',
      'password',
      'apiVersion',
      'strictSSL',
    ];

    for (const field of requiredFields) {
      if (
        configData[field] === undefined ||
        configData[field] === null ||
        configData[field] === ''
      ) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return true;
  }

  static async testConnection(configData) {
    this.validateConfig(configData);
    const myself = await jiraConfigService.myself(configData);
    if (myself && myself.accountId && myself.active) {
      return true;
    }
    throw new Error('Failed to connect to Jira with provided configuration');
  }

  static async validateConfigData(configData) {
    const errors = {};
    const MIN_USERNAME_LENGTH = 3;
    const MIN_PASSWORD_LENGTH = 6;

    function validateProtocol(protocol) {
      if (!protocol) {
        return 'Protocol is required';
      }
      if (!['http', 'https'].includes(protocol)) {
        return 'Protocol must be \'http\' or \'https\'';
      }
      return null;
    }

    function validateHost(host) {
      if (!host) {
        return 'Host is required';
      }
      if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(host)) {
        return 'Invalid host format';
      }
      return null;
    }

    function validateUsername(username) {
      if (!username) {
        return 'Username is required';
      }
      if (username.length < MIN_USERNAME_LENGTH) {
        return `Username must be at least ${MIN_USERNAME_LENGTH} characters`;
      }
      return null;
    }

    function validatePassword(password) {
      if (!password) {
        return 'Password is required';
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
      }
      return null;
    }

    function validateApiVersion(apiVersion) {
      if (!apiVersion) {
        return 'API version is required';
      }
      return null;
    }

    function validateStrictSSL(strictSSL) {
      if (strictSSL === undefined) {
        return 'StrictSSL setting is required';
      }
      return null;
    }

    const protocolError = validateProtocol(configData.protocol);
    if (protocolError) {
      errors.protocol = protocolError;
    }

    const hostError = validateHost(configData.host);
    if (hostError) {
      errors.host = hostError;
    }

    const usernameError = validateUsername(configData.username);
    if (usernameError) {
      errors.username = usernameError;
    }

    const passwordError = validatePassword(configData.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    const apiVersionError = validateApiVersion(configData.apiVersion);
    if (apiVersionError) {
      errors.apiVersion = apiVersionError;
    }

    const strictSSLError = validateStrictSSL(configData.strictSSL);
    if (strictSSLError) {
      errors.strictSSL = strictSSLError;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

}

module.exports = JiraConfig;
