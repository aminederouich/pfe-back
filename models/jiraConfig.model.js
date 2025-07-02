const { db } = require("../config/firebase");
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
} = require("firebase/firestore");

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
      const jiraConfigRef = collection(db, "jiraConfig");
      const querySnapshot = await getDocs(jiraConfigRef);
      const configs = [];
      querySnapshot.forEach((doc) => {
        configs.push({ id: doc.id, ...doc.data() });
      });
      return configs;
    } catch (error) {
      throw new Error("Error retrieving Jira configurations");
    }
  }

  static async findById(id) {
    try {
      const configRef = doc(db, "jiraConfig", id);
      const docSnapshot = await getDoc(configRef);
      if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() };
      }
      return null;
    } catch (error) {
      throw new Error("Error retrieving Jira configuration");
    }
  }

  static async findByHost(host) {
    try {
      const jiraConfigRef = collection(db, "jiraConfig");
      const q = query(jiraConfigRef, where("host", "==", host));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      throw new Error("Error checking host existence");
    }
  }

  static async deleteById(id) {
    try {
      const configRef = doc(db, "jiraConfig", id);
      await deleteDoc(configRef);
      return {
        message: `Jira configuration with id ${id} deleted successfully.`,
      };
    } catch (error) {
      throw new Error("Error deleting Jira configuration");
    }
  }

  async save() {
    try {
      const jiraConfigRef = collection(db, "jiraConfig");
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
    } catch (error) {
      throw new Error("Error saving Jira configuration");
    }
  }

  static async updateById(id, configData) {
    try {
      const configRef = doc(db, "jiraConfig", id);
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
    } catch (error) {
      throw new Error("Error updating Jira configuration");
    }
  }

  static async findEnabledConfigs() {
    try {
      const jiraConfigRef = collection(db, "jiraConfig");
      const q = query(jiraConfigRef, where("enableConfig", "==", true));
      const querySnapshot = await getDocs(q);
      const configs = [];
      querySnapshot.forEach((doc) => {
        configs.push({ id: doc.id, ...doc.data() });
      });
      return configs;
    } catch (error) {
      throw new Error("Error retrieving enabled Jira configurations");
    }
  }
}

module.exports = JiraConfig;
