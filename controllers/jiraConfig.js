const { getDocs, query, collection, addDoc } = require("firebase/firestore");
const JiraApi = require("jira-client");
const jiraConfig = require("../config/Jira");
const { db } = require("../config/firebase");
const { auth } = require("./auth");

exports.checkConncetionJiraAPI = [
  auth,
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
  auth,
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
  auth,
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