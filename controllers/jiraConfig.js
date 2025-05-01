const { getDocs, query, collection } = require("firebase/firestore");
const jiraConfig = require("../config/Jira");
const { db } = require("../config/firebase");
const { auth } = require("./auth");

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

exports.addConfigJiraClient = async (req, res) => {
  const { jiraUrl, username, password } = req.body;

  if (!jiraUrl || !username || !password) {
    return res.status(400).json({
      error: true,
      message: "Jira URL, username, and password are required",
    });
  }

  try {
    jiraConfig.setJiraCredentials(jiraUrl, username, password);
    res.status(200).json({
      error: false,
      message: "Jira client configuration added successfully",
    });
  } catch (error) {
    console.error("Error adding Jira client configuration:", error);
    res.status(500).json({
      error: true,
      message: "Error adding Jira client configuration",
    });
  }
};
