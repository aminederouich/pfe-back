
const { collection, getDocs, query, where, setDoc, addDoc } = require('firebase/firestore');
const { db } = require('../config/firebase');

const collectionName = 'tickets';

class TicketModel {
  constructor(ticketData) {
    this.lastSync = ticketData.lastSync;
    this.configId = ticketData.configId;
    this.self = ticketData.self;
    this.id = ticketData.id;
    this.key = ticketData.key;
    this.fields = ticketData.fields;
    this.expand = ticketData.expand;
    this.updatedAt = ticketData.updatedAt;
    this.createdAt = ticketData.createdAt;
  }

  static async findAllTickets() {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(error);
    }
  }
  static async getTicketById(ticketId) {
    try {
      const q = query(collection(db, collectionName), where('id', '==', ticketId));
      const docSnap = await getDocs(q);
      if (docSnap.empty) {
        return null;
      }
      return { id: docSnap.docs[0].id, ...docSnap.docs[0].data() };
    } catch (error) {
      throw new Error(error);
    }
  }

  static async getTicketByConfigId(configId) {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'tickets'),
          where('configId', '==', configId),
        ),
      );
      return querySnapshot.docs.map((doc) => doc.data());
    } catch (error) {
      throw new Error(error);
    }
  }

  static async findByKeyAndConfigId(ticketKey, configId) {
    const querySnapshot = await getDocs(query(
      collection(db, collectionName),
      where('key', '==', ticketKey),
      where('configId', '==', configId),
    ));
    const { docs } = querySnapshot;
    const [existingTicket] = docs;
    return existingTicket;
  }

  static async findByIdAndConfigId(ticket) {
    const ticketQuery = query(
      collection(db, 'tickets'),
      where('id', '==', ticket.id),
      where('configId', '==', ticket.configId),
    );
    const querySnapshot = await getDocs(ticketQuery);
    const [existingTicket] = querySnapshot.docs;
    return existingTicket;
  }

  static async updateOrSyncTicket(existingTicket, ticket, configId) {
    // Compare existing ticket with new ticket data
    const existingData = existingTicket.data();
    const hasChanges =
        JSON.stringify(existingData.fields) !== JSON.stringify(ticket.fields);
    if (hasChanges) {
      await setDoc(
        existingTicket.ref,
        {
          ...ticket,
          configId,
          updatedAt: new Date(),
          lastSync: new Date(),
        },
        { merge: true },
      );
    } else {
      // Update only lastSync timestamp
      await setDoc(
        existingTicket.ref,
        {
          lastSync: new Date(),
        },
        { merge: true },
      );
    }
  }

  static async updateOrSyncTicketInBase(existingTicket, ticket, existingData, updatedFields) {
    return setDoc(existingTicket.ref, {
      ...existingData,
      ...ticket,
      updatedAt: new Date(),
      lastSync: new Date(),
      fields: updatedFields,
    });
  }

  static async addNewTicket(ticket, configId) {
    return addDoc(collection(db, collectionName), {
      ...ticket,
      configId,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSync: new Date(),
    });
  }

}

module.exports = TicketModel;
