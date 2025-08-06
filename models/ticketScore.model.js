const { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } = require('firebase/firestore');
const { db } = require('../config/firebase');

const collectionName = 'ticketScores';

const TicketScoreModel = {
  async addTicketScore(data) {
    const scoreData = {
      ...data,
      dateAffection: new Date(),
    };
    const docRef = await addDoc(collection(db, collectionName), scoreData);
    return { id: docRef.id, ...scoreData };
  },

  async getTicketScores() {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getTicketScoresByTicketId(ticketId) {
    const q = query(collection(db, collectionName), where('ticketId', '==', ticketId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getTicketScoreByTicketAndRule(ticketId, ruleId) {
    const q = query(
      collection(db, collectionName),
      where('ticketId', '==', ticketId),
      where('ruleId', '==', ruleId),
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const [docData] = snapshot.docs;
    return { id: docData.id, ...docData.data() };
  },

  async updateTicketScore(docId, data) {
    const scoreData = {
      ...data,
      dateAffection: new Date(),
    };

    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, scoreData);

    return { id: docId, ...scoreData };
  },

  async upsertTicketScore(data) {
    // Vérifier si un score existe déjà pour ce ticket et cette règle
    const existingScore = await this.getTicketScoreByTicketAndRule(data.ticketId, data.ruleId);

    if (existingScore) {
      // Mettre à jour le score existant
      return this.updateTicketScore(existingScore.id, data);
    }

    // Créer un nouveau score
    return this.addTicketScore(data);
  },
};

module.exports = TicketScoreModel;
