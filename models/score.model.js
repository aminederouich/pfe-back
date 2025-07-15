const { collection, addDoc, getDocs } = require('firebase/firestore');
const { db } = require('../config/firebase');

const collectionName = 'scores';

const ScoreModel = {
  async addScore(data) {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, ...data };
  },

  async getScores() {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

module.exports = ScoreModel;
