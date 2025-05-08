const {
  getDocs,
  query,
  collection,
  addDoc,
  setDoc,
  where,
} = require("firebase/firestore");
const JiraApi = require("jira-client");
const { db } = require("../config/firebase");
const { auth } = require("./auth");

async function getJiraConfigs() {
  console.log("Fetching Jira configurations from Firebase...");
  try {
    const configsSnapshot = await getDocs(query(collection(db, "jiraConfig")));
    console.log("Jira configurations snapshot retrieved.");
    const configs = [];
    configsSnapshot.forEach((doc) => {
      console.log(`Processing config: ${doc.id}`);
      configs.push({ id: doc.id, ...doc.data() });
    });
    console.log(`Total Jira configurations fetched: ${configs.length}`);
    return configs;
  } catch (error) {
    console.error("Error fetching Jira configurations:", error);
    throw error;
  }
}

async function checkJiraConnection(jira, configId) {
  console.log("Checking Jira connection for config:", configId);
  try {
    const response = await jira.getCurrentUser();
    console.log("Response from getCurrentUser:", response);
    if (Object.prototype.hasOwnProperty.call(response, "accountId")) {
      console.log("Connection successful for config:", configId);
      return true;
    } else {
      console.error("Connection failed for config:", configId);
      return false;
    }
  } catch (err) {
    console.error(
      "Error in getCurrentUser for config:",
      configId,
      "Error:",
      err
    );
    return false;
  }
}

async function createJiraClient(config) {
  console.log("Creating Jira client for config:", config.id);
  try {
    console.log("Jira client configuration:", {
      protocol: config.protocol || "https",
      host: config.host,
      username: config.username,
      apiVersion: config.apiVersion || "2",
      strictSSL: config.strictSSL || true,
    });

    const jira = new JiraApi({
      protocol: config.protocol || "https",
      host: config.host,
      username: config.username,
      password: config.password,
      apiVersion: config.apiVersion || "2",
      strictSSL: config.strictSSL || true,
    });

    console.log("Jira client successfully created for config:", config.id);
    return jira;
  } catch (error) {
    console.error(`Error creating Jira client for config ${config.id}:`, error);
    throw error;
  }
}

async function getIssuesForProject(jira, projectKey) {
  console.log(`Fetching issues for project: ${projectKey}`);
  let startAt = 0;
  const maxResults = 50;
  let allIssues = [];
  let total = 0;

  do {
    console.log(
      `Querying Jira for issues. StartAt: ${startAt}, MaxResults: ${maxResults}`
    );
    const result = await jira.searchJira(`project = ${projectKey}`, {
      startAt,
      maxResults,
    });

    console.log(
      `Fetched ${result.issues.length} issues. Total issues in project: ${result.total}`
    );
    allIssues = allIssues.concat(result.issues);
    total = result.total;
    startAt += maxResults;

    console.log(
      `Progress: Retrieved ${allIssues.length}/${total} issues so far.`
    );
  } while (startAt < total);

  console.log(
    `Completed fetching issues for project: ${projectKey}. Total issues retrieved: ${allIssues.length}`
  );
  return allIssues;
}

async function fetchProjectsAndIssues(jira) {
  console.log("Starting to fetch projects and issues...");
  try {
    console.log("Fetching list of projects from Jira...");
    const projects = await jira.listProjects();
    console.log(`Number of projects retrieved: ${projects.length}`);

    const allIssues = [];

    for (const project of projects) {
      console.log(`Processing project: ${project.key} - ${project.name}`);

      console.log(`Fetching issues for project: ${project.key}`);
      const issues = await getIssuesForProject(jira, project.key);
      console.log(
        `Number of issues found for project ${project.key}: ${issues.length}`
      );

      issues.forEach((issue) => {
        console.log(
          `Issue details - Key: [${issue.key}], Summary: ${issue.fields.summary}`
        );
      });

      console.log(
        `Adding ${issues.length} issues from project ${project.key} to the total list.`
      );
      allIssues.push(...issues);

      console.log(`Finished processing project: ${project.key}`);
      console.log(""); // separation
    }

    console.log(
      `\n✅ Total tickets retrieved across all projects: ${allIssues.length}`
    );
    return allIssues;
  } catch (error) {
    console.error(
      "❌ Error occurred while fetching projects and issues:",
      error
    );
    throw error;
  }
}

async function syncTicketWithFirebase(ticket, configId) {
  console.log(
    `Starting sync process for ticket ${ticket.key} with config ${configId}`
  );
  try {
    // Check if ticket exists with same key and configId
    const ticketQuery = query(
      collection(db, "tickets"),
      where("key", "==", ticket.key),
      where("configId", "==", configId)
    );

    const querySnapshot = await getDocs(ticketQuery);
    const existingTicket = querySnapshot.docs[0];

    if (existingTicket) {
      // Compare existing ticket with new ticket data
      const existingData = existingTicket.data();
      const hasChanges =
        JSON.stringify(existingData.fields) !== JSON.stringify(ticket.fields);

      if (hasChanges) {
        console.log(`Changes detected for ticket ${ticket.key}. Updating...`);
        await setDoc(
          existingTicket.ref,
          {
            ...ticket,
            configId,
            updatedAt: new Date(),
            lastSync: new Date(),
          },
          { merge: true }
        );
        console.log(`Ticket ${ticket.key} successfully updated`);
      } else {
        console.log(
          `No changes detected for ticket ${ticket.key}. Skipping update.`
        );
        // Update only lastSync timestamp
        await setDoc(
          existingTicket.ref,
          {
            lastSync: new Date(),
          },
          { merge: true }
        );
      }
    } else {
      console.log(`Creating new ticket ${ticket.key}...`);
      await addDoc(collection(db, "tickets"), {
        ...ticket,
        configId,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSync: new Date(),
      });
      console.log(`Ticket ${ticket.key} successfully created`);
    }
  } catch (error) {
    console.error(`Error syncing ticket ${ticket.key}:`, error);
    throw error;
  }
}

exports.getAllTicket = [
  auth,
  async (req, res) => {
    console.log("Starting getAllTicket function...");
    try {
      console.log("Fetching Jira configurations...");
      const configs = await getJiraConfigs();
      console.log(`Fetched ${configs.length} Jira configurations.`);

      let allTicketsResult = [];

      for (const config of configs) {
        console.log(`Processing configuration: ${config.id}`);
        if (config.enableConfig) {
          console.log(`Configuration ${config.id} is enabled.`);
          try {
            console.log(`Creating Jira client for configuration: ${config.id}`);
            const jira = await createJiraClient(config);

            console.log(
              `Checking Jira connection for configuration: ${config.id}`
            );
            const isConnected = await checkJiraConnection(jira, config.id);

            if (isConnected) {
              console.log(
                `Connection successful for configuration: ${config.id}`
              );
              console.log(`Fetching tickets for configuration: ${config.id}`);
              const allTicket = await fetchProjectsAndIssues(jira);

              console.log(
                `Fetched ${allTicket.length} tickets for configuration: ${config.id}`
              );
              if (allTicket.length > 0) {
                console.log("Syncing tickets with Firebase...");
                for (const ticket of allTicket) {
                  console.log(`Syncing ticket: ${ticket.key}`);
                  await syncTicketWithFirebase(ticket, config.id);
                }
                console.log("All tickets synced with Firebase.");
              }
            } else {
              console.error(
                `Authentication failed for configuration: ${config.id}`
              );
              allTicketsResult.push({
                configId: config.id,
                error: "Authentication failed",
                success: false,
              });
            }

            console.log(
              `Fetching all tickets from Firebase for configuration: ${config.id}`
            );
            const querySnapshot = await getDocs(collection(db, "tickets"));

            console.log(
              `Fetched ${querySnapshot.docs.length} tickets from Firebase.`
            );
            const allTickets = querySnapshot.docs
              .map((doc) =>
                config.id === doc.data().configId ? doc.data() : null
              )
              .filter(Boolean);

            console.log(
              `Adding tickets to result for configuration: ${config.id}`
            );
            allTicketsResult.push({
              configId: config.id,
              tickets: allTickets,
              success: true,
            });
          } catch (error) {
            console.error(
              `Error setting up Jira client for configuration ${config.id}:`,
              error
            );
            allTicketsResult.push({
              configId: config.id,
              error: error.message,
              success: false,
            });
          }
        } else {
          console.log(`Configuration ${config.id} is disabled. Skipping.`);
        }
      }

      console.log("Returning results for all configurations...");
      res.status(200).json({
        success: true,
        results: allTicketsResult,
      });
    } catch (error) {
      console.error("Error in getAllTicket:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching tickets",
        error: error.message,
      });
    }
    console.log("getAllTicket function completed.");
  },
];
