const express = require("express");
const router = express.Router();
const {
  addConfigJiraClient,
  getAllConfigJiraClient,
  checkConncetionJiraAPI,
  deleteConfigJiraClientByID,
  updateConfigJiraClient,
  getConfigJiraClientByID,
  getEnabledConfigJiraClient,
} = require("../controllers/jiraConfig.controller");

router.post("/checkConnection", checkConncetionJiraAPI);

router.get("/getAllConfig", getAllConfigJiraClient);
router.get("/getEnabledConfig", getEnabledConfigJiraClient);
router.get("/getConfig/:id", getConfigJiraClientByID);

router.post("/addConfig", addConfigJiraClient);

router.post("/deleteConfigByID", deleteConfigJiraClientByID);

router.post("/updateConfigByID", updateConfigJiraClient);

module.exports = router;
