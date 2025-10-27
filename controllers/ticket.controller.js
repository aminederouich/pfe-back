/* eslint-disable max-depth */
/* eslint-disable complexity */
const {
  getDocs,
  query,
  collection,
  addDoc,
  setDoc,
  where,
} = require('firebase/firestore');
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const HTTP_STATUS = require('../constants/httpStatus');
const ticketService = require('../services/ticket.service');
const TicketModel = require('../models/ticket.model');
const JiraConfig = require('../models/jiraConfig.model');
const projectService = require('../services/project.service');

exports.getAllTicket = [
  authMiddleware,
  async(req, res) => {
    try {
      const configs = await JiraConfig.findAll();
      const allTicketsResult = [];
      const jiraAllTickets = [];
      for (const config of configs) {
        if (config.enableConfig) {
          try {
            const testConnection = await JiraConfig.testConnection(config);
            await JiraConfig.validateConfig(config);
            if (testConnection) {
              const allprojectsFromJiraApi = await projectService.getProjectsPaginated(config);
              const projectNames = allprojectsFromJiraApi.values.map(project => project.name);
              for (const projectName of projectNames) {
                const idsList = await ticketService.SearchForIssuesUsingJQLEnhancedSearch(projectName, config);
                jiraAllTickets.push(...idsList.issues);
              }
              for (const ticket of jiraAllTickets) {
                const ticketToSync = await ticketService.getIssueDetails(ticket.id, config);
                await ticketService.syncTicketWithFirebase(ticketToSync, config.id);
              }
            } else {
              allTicketsResult.push({
                configId: config.id,
                error: 'Authentication failed',
                success: false,
              });
            }

            const configTickets = await TicketModel.findAllTickets();
            allTicketsResult.push(...configTickets);
          } catch (error) {

            allTicketsResult.push({
              configId: config.id,
              error: error.message,
              success: false,
            });
          }
        }
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        results: allTicketsResult,
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error fetching tickets',
        error: error.message,
      });
    }
  },
];

exports.addNewTicket = [
  authMiddleware,
  async(req, res) => {
    try {
      const { ticket } = req.body;
      if (!ticket) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Missing ticket in request body',
        });
      }

      // Add the ticket only in Firebase, without configId
      await addDoc(collection(db, 'tickets'), {
        ...ticket,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSync: new Date(),
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Ticket added successfully to Firebase',
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error adding new ticket',
        error: error.message,
      });
    }
  },
];

exports.updateTicket = [
  authMiddleware,
  async(req, res) => {
    try {
      const { ticket } = req.body;
      if (!ticket) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Missing ticket in request body',
        });
      }

      if (ticket.configId.length > 0) {
        let result = {};
        const config = await JiraConfig.findById(ticket.configId);
        if (!config) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Jira configuration not found for this ticket',
          });
        }
        const [fieldKey] = Object.keys(ticket.fields);
        console.log(fieldKey);
        if (fieldKey === 'summary') {
          console.log('here');
        }
        if (fieldKey === 'status') {
          console.log('here');
        }
        if (fieldKey === 'assignee') {
          const assignee = ticket.fields.assignee || {};
          const { jiraId } = assignee;
          result = await ticketService.assignIssue(ticket.key, jiraId, config);
        }

        // const result = await ticketService.updateIssueJiraClient(ticket, config);
        if (result && result.success === false) {
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error updating ticket in Jira',
            error: result.error,
          });
        }
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Ticket updated successfully in Jira and Firebase',
        });
      } else {
        const ticketQuery = query(
          collection(db, 'tickets'),
          where('id', '==', ticket.id),
        );
        // Update the ticket in Firebase
        const querySnapshot = await getDocs(ticketQuery);
        const [existingTicket] = querySnapshot.docs;
        if (existingTicket) {
          const existingData = existingTicket.data();
          const hasChanges = JSON.stringify(existingData.fields) !== JSON.stringify(ticket.fields);

          if (hasChanges) {
            // Merge only the modified fields into the existing fields
            const updatedFields = { ...existingData.fields, ...ticket.fields, updated: new Date() };
            await setDoc(existingTicket.ref, {
              ...existingData,
              ...ticket,
              updatedAt: new Date(),
              lastSync: new Date(),
              fields: updatedFields,
            });
          }
        }
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Ticket updated successfully in Firebase',
        });
      }
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error updating ticket',
        error: error.message,
      });
    }
  },
];
