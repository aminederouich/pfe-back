const { doc, setDoc, updateDoc, query, where } = require('firebase/firestore');
const { db } = require('../config/firebase');
const { collection, getDocs } = require('firebase/firestore');

class WeeklyAllScores {
  constructor(WeeklyScores) {
    this.id = WeeklyScores.id;
    this.startOfWeek = WeeklyScores.startOfWeek;
    this.endOfWeek = WeeklyScores.endOfWeek;
    this.weeklyAllScores = WeeklyScores.weeklyAllScores;
  }

  static async create(WeeklyScores) {
    return WeeklyAllScores.upsertById(WeeklyScores);
  }

  static async upsertById(WeeklyScores) {
    try {
      const existingWeeklyScores = await WeeklyAllScores.findById(WeeklyScores.id);
      if (!existingWeeklyScores) {
        return WeeklyAllScores._createNewWeeklyScores(WeeklyScores);
      }

      const merged = {
        startOfWeek: WeeklyScores.startOfWeek ?? existingWeeklyScores.startOfWeek,
        endOfWeek: WeeklyScores.endOfWeek ?? existingWeeklyScores.endOfWeek,
        weeklyAllScores: Array.isArray(WeeklyScores.weeklyAllScores)
          ? WeeklyScores.weeklyAllScores
          : existingWeeklyScores.weeklyAllScores,
      };
      return WeeklyAllScores.update(existingWeeklyScores.id, merged);
    } catch {
      throw new Error('Failed to upsert WeeklyAllScores');
    }
  }

  static async _createNewWeeklyScores(WeeklyScores) {
    const weeklyScoreRef = doc(collection(db, 'WeeklyAllScores'));
    const weeklyScoreDoc = sanitizeData({
      id: (new Date(WeeklyScores.startOfWeek)).toISOString().slice(0, 10).replace(/-/g, ''),
      startOfWeek: WeeklyScores.startOfWeek,
      endOfWeek: WeeklyScores.endOfWeek,
      weeklyAllScores: Array.isArray(WeeklyScores.weeklyAllScores) ? WeeklyScores.weeklyAllScores : [],
    });

    await setDoc(weeklyScoreRef, weeklyScoreDoc);
    return new WeeklyAllScores(weeklyScoreDoc);
  }


  static async update(WeeklyScoresId, updateData) {
    try {
      const weeklyScoresQuery = query(
        collection(db, 'WeeklyAllScores'),
        where('id', '==', WeeklyScoresId),
      );
      const querySnapshot = await getDocs(weeklyScoresQuery);
      const updatedData = sanitizeData({
        ...updateData,
      });

      await updateDoc(querySnapshot.docs[0].ref, updatedData);

      // Return updated WeeklyScores
      const updatedWeeklyScores = await WeeklyAllScores.findById(WeeklyScoresId);
      return updatedWeeklyScores;
    } catch (error) {
      throw new Error('Failed to update WeeklyScores in database', { cause: error });
    }
  }

  static async findById(WeeklyScoresId) {
    try {
      const weeklyScoresQuery = query(
        collection(db, 'WeeklyAllScores'),
        where('id', '==', WeeklyScoresId),
      );
      const querySnapshot = await getDocs(weeklyScoresQuery);

      if (querySnapshot.empty) {
        return null;
      }

      const [docSnap] = querySnapshot.docs;
      return new WeeklyAllScores({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
      throw new Error('Failed to retrieve WeeklyTopScores from database', { cause: error });
    }
  }

  static async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, 'WeeklyAllScores'));
      const scores = [];
      querySnapshot.forEach(docSnap => {
        scores.push(new WeeklyAllScores(docSnap.data()));
      });
      return scores;
    } catch {
      throw new Error('Failed to fetch WeeklyTopScores from database');
    }
  }

  toPublicFormat() {
    return {
      id: this.id,
      startOfWeek: this.startOfWeek,
      endOfWeek: this.endOfWeek,
      weeklyAllScores: this.weeklyAllScores,
    };
  }
}

// Helper pour retirer les valeurs undefined (Firestore ne les accepte pas)
function sanitizeData(obj) {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  if (Array.isArray(obj)) {
    return obj
      .filter(el => el !== undefined && el !== null)
      .map(el => (typeof el === 'object' ? sanitizeData(el) : el));
  }
  const cleaned = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined) {
      return;
    }
    if (v && typeof v === 'object') {
      cleaned[k] = sanitizeData(v);
    } else {
      cleaned[k] = v;
    }
  });
  return cleaned;
}


module.exports = WeeklyAllScores;
