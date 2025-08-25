const { collection, getDocs, doc, getDoc, query, where } = require('firebase/firestore');
const { db } = require('../config/firebase');

const collectionName = 'tickets';

const TicketModel = {
  async getAllTickets() {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getTicketById(ticketId) {
    const docRef = doc(db, collectionName, ticketId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  async getTicketsByKey(key) {
    const q = query(collection(db, collectionName), where('key', '==', key));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // AJOUTE CETTE MÉTHODE :
  async getTicketsByAssignedTo(userId) {
    const q = query(collection(db, collectionName), where('assignedTo', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

module.exports = TicketModel;
