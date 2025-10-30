const { collection, addDoc, getDocs, doc, getDoc, query, where } = require('firebase/firestore');
const { db } = require('../config/firebase');

const collectionName = 'scores';

const ScoreModel = {
  // Méthodes pour les règles de score (collection: 'scores')
  async addScore(data) {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, ...data };
  },

  async getScores() {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getScoreById(scoreId) {
    const docRef = doc(db, collectionName, scoreId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },
  async getWeekScores(startOfWeek, endOfWeek) {
    const scoreQuery = query(
      collection(db, 'ticketScores'),
      where('dateAffection', '>=', startOfWeek),
      where('dateAffection', '<=', endOfWeek),
    );
    const snapshot = await getDocs(scoreQuery);
    return snapshot.docs.map(doc => doc.data());
  },

};

module.exports = ScoreModel;
