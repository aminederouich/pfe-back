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
const createJiraClient = require('../middleware/jiraClient');
const HTTP_STATUS = require('../constants/httpStatus');
const jiraConfigService = require('../services/jiraConfig.service');
const ticketService = require('../services/ticket.service');
const TicketModel = require('../models/ticket.model');

exports.getAllTicket = [
  authMiddleware,
  async(req, res) => {
    try {
      const configs = await jiraConfigService.getAllConfigs();
      const allTicketsResult = [];
      for (const config of configs) {
        if (config.enableConfig) {
          try {
            const jira = createJiraClient(config);
            const testConnection = await jiraConfigService.testConnection(config);
            const isConnected = Object.prototype.hasOwnProperty.call(testConnection, 'userInfo');
            if (isConnected) {
              const allTicket = await ticketService.fetchProjectsAndIssues(jira);
              if (allTicket.length > 0) {
                for (const ticket of allTicket) {
                  await ticketService.syncTicketWithFirebase(ticket, config.id);
                }
              }
            } else {
              allTicketsResult.push({
                configId: config.id,
                error: 'Authentication failed',
                success: false,
              });
            }

            const configTickets = await TicketModel.getTicketByConfigId(config.id);
            allTicketsResult.push(...configTickets);
            if (config.id === configs[configs.length - 1].id) {
              const noConfigTickets = await TicketModel.getTicketByConfigId('');
              allTicketsResult.push(...noConfigTickets);
            }
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
        const config = await jiraConfigService.getConfigById(ticket.configId);
        if (!config) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Jira configuration not found for this ticket',
          });
        }
        const result = await ticketService.updateIssueJiraClient(ticket, config);
        if (result !== undefined && !result.success) {
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error updating ticket in Jira',
            error: result.error,
          });
        }
        const existingTicket = await TicketModel.findByIdAndConfigId(ticket);
        const existingData = existingTicket.data();
        const hasChanges = JSON.stringify(existingData.fields) !== JSON.stringify(ticket.fields);
        if (hasChanges) {
          // Merge only the modified fields into the existing fields
          ticketService.updateTicketInBase(existingTicket, existingData, ticket);
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
