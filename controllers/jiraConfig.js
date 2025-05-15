const { getDocs, query, collection, addDoc, doc, deleteDoc, setDoc } = require("firebase/firestore");
const JiraApi = require("jira-client");
const { db } = require("../config/firebase");
const authMiddleware = require("../middleware/auth");

exports.checkConncetionJiraAPI = [
  authMiddleware,
  (req, res) => {
    const { protocol, host, username, password, apiVersion, strictSSL } =
      req.body;

    if (
      !protocol ||
      !host ||
      !username ||
      !password ||
      !apiVersion ||
      strictSSL.toString() === undefined
    ) {
      return res.status(422).json({
        error: true,
        message: "some info is required",
      });
    }

    const jira = new JiraApi({
      protocol: protocol,
      host: host,
      username: username,
      password: password,
      apiVersion: apiVersion,
      strictSSL: strictSSL,
    });
    jira
      .getCurrentUser()
      .then((response) => {
        if (Object.prototype.hasOwnProperty.call(response, 'accountId')) {
          console.log("Connection successful for config:", response.accountId);
          return res.status(200).json({
            error: false,
            message: "Connection successful",
          });
        }
      })
  
      .catch((err) => {
        return res.status(422).json({
          error: true,
          message: "Connection failed",
        });
      });
  },
];

exports.getAllConfigJiraClient = [
  authMiddleware,
  (req, res) => {
    getDocs(query(collection(db, "jiraConfig")))
      .then((querySnapshot) => {
        const jiraConfigs = [];
        querySnapshot.forEach((doc) => {
          jiraConfigs.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json({
          error: false,
          message: "Jira client configuration retrieved successfully",
          data: jiraConfigs,
        });
      })
      .catch((error) => {
        console.error("Error retrieving Jira client configuration:", error);
        res.status(500).json({
          error: true,
          message: "Error retrieving Jira client configuration",
        });
      });
  },
];

exports.addConfigJiraClient = [
  authMiddleware,
  (req, res) => {
    const { protocol, host, username, password, apiVersion, strictSSL } =
      req.body;

    if (
      !protocol ||
      !host ||
      !username ||
      !password ||
      !apiVersion ||
      strictSSL.toString() === undefined
    ) {
      return res.status(422).json({
        error: true,
        message: "some info is required",
      });
    }

    addDoc(collection(db, "jiraConfig"), {
      protocol: protocol,
      host: host,
      username: username,
      password: password,
      apiVersion: apiVersion,
      strictSSL: strictSSL,
      enableConfig: true,
    })
      .then((response) => {
        console.log(response);
        res.status(200).json({
          error: false,
          message: "Jira client configuration added successfully",
        });
      })
  
      .catch((err) => {
        return res.status(422).json({
          error: true,
          message: "Connection failed",
        });
      });
  },
];

exports.deleteConfigJiraClientByID = [
  authMiddleware,
  (req, res) => {
    const { ids } = req.body;
    if (ids.length === 0) {
      return res.status(422).json({
        error: true,
        message: "ID is required",
      });
    }
    ids.forEach((id) => {

      deleteDoc(doc(db, "jiraConfig", id))
        .then(() => {
          res.status(200).json({
            error: false,
            message: "Jira client configuration deleted successfully",
          });
        })
        .catch((error) => {
          console.error("Error deleting Jira client configuration:", error);
          res.status(500).json({
            error: true,
            message: "Error deleting Jira client configuration",
          });
        });
    })
  },
];

exports.updateConfigJiraClient = [
  authMiddleware,
  (req, res) => {
    const { id, protocol, host, username, password, apiVersion, strictSSL, enableConfig } =
      req.body;
      if (
      !id ||
      !protocol ||
      !host ||
      !username ||
      !password ||
      !apiVersion ||
      strictSSL.toString() === undefined ||
      enableConfig.toString() === undefined
    ) {
      return res.status(422).json({
        error: true,
        message: "some info is required",
      });
    }

    setDoc(doc(db, "jiraConfig", id), {
      protocol: protocol,
      host: host,
      username: username,
      password: password,
      apiVersion: apiVersion,
      strictSSL: strictSSL,
      enableConfig: enableConfig,
    })
      .then(() => {
        res.status(200).json({
          error: false,
          message: "Jira client configuration updated successfully",
        });
      })
  
      .catch((error) => {
        console.error("Error updating Jira client configuration:", error);
        res.status(500).json({
          error: true,
          message: "Error updating Jira client configuration",
        });
      });
  },
];