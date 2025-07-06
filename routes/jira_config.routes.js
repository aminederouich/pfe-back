const express = require("express");
const router = express.Router();
const jiraConfigController = require("../controllers/jiraConfig.controller");

router.post("/checkConnection", jiraConfigController.checkConncetionJiraAPI);

router.get("/getAllConfig", jiraConfigController.getAllConfigJiraClient);
router.get(
  "/getEnabledConfig",
  jiraConfigController.getEnabledConfigJiraClient
);
router.get("/getConfig/:id", jiraConfigController.getConfigJiraClientByID);

router.post("/addConfig", jiraConfigController.addConfigJiraClient);

router.post(
  "/deleteConfigByID",
  jiraConfigController.deleteConfigJiraClientByID
);

router.post("/updateConfigByID", jiraConfigController.updateConfigJiraClient);

module.exports = router;
