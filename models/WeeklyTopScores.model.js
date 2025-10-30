const { doc, setDoc, updateDoc, query, where } = require('firebase/firestore');
const { db } = require('../config/firebase');
const { collection, getDocs } = require('firebase/firestore');

class WeeklyTopScores {
  constructor(WeeklyScores) {
    this.id = WeeklyScores.id;
    this.startOfWeek = WeeklyScores.startOfWeek;
    this.endOfWeek = WeeklyScores.endOfWeek;
    this.leaderboard = WeeklyScores.leaderboard;
  }

  static async create(WeeklyScores) {
    return WeeklyTopScores.upsertById(WeeklyScores);
  }

  static async upsertById(WeeklyScores) {
    try {
      const existingWeeklyScores = await WeeklyTopScores.findById(WeeklyScores.id);
      if (!existingWeeklyScores) {
        return WeeklyTopScores._createNewWeeklyScores(WeeklyScores);
      }

      const merged = {
        startOfWeek: WeeklyScores.startOfWeek ?? existingWeeklyScores.startOfWeek,
        endOfWeek: WeeklyScores.endOfWeek ?? existingWeeklyScores.endOfWeek,
        leaderboard: Array.isArray(WeeklyScores.leaderboard)
          ? WeeklyScores.leaderboard
          : existingWeeklyScores.leaderboard,
      };
      return WeeklyTopScores.update(existingWeeklyScores.id, merged);
    } catch {
      throw new Error('Failed to upsert WeeklyTopScores');
    }
  }

  static async _createNewWeeklyScores(WeeklyScores) {
    const weeklyScoreRef = doc(collection(db, 'WeeklyTopScores'));
    const weeklyScoreDoc = sanitizeData({
      id: (new Date(WeeklyScores.startOfWeek)).toISOString().slice(0, 10).replace(/-/g, ''),
      startOfWeek: WeeklyScores.startOfWeek,
      endOfWeek: WeeklyScores.endOfWeek,
      leaderboard: Array.isArray(WeeklyScores.leaderboard) ? WeeklyScores.leaderboard : [],
    });

    await setDoc(weeklyScoreRef, weeklyScoreDoc);
    return new WeeklyTopScores(weeklyScoreDoc);
  }


  static async update(WeeklyScoresId, updateData) {
    try {
      const weeklyScoresQuery = query(
        collection(db, 'WeeklyTopScores'),
        where('id', '==', WeeklyScoresId),
      );
      const querySnapshot = await getDocs(weeklyScoresQuery);
      const updatedData = sanitizeData({
        ...updateData,
      });

      await updateDoc(querySnapshot.docs[0].ref, updatedData);

      // Return updated WeeklyScores
      const updatedWeeklyScores = await WeeklyTopScores.findById(WeeklyScoresId);
      return updatedWeeklyScores;
    } catch (error) {
      throw new Error('Failed to update WeeklyScores in database', { cause: error });
    }
  }

  static async findById(WeeklyScoresId) {
    try {
      const weeklyScoresQuery = query(
        collection(db, 'WeeklyTopScores'),
        where('id', '==', WeeklyScoresId),
      );
      const querySnapshot = await getDocs(weeklyScoresQuery);

      if (querySnapshot.empty) {
        return null;
      }

      const [docSnap] = querySnapshot.docs;
      return new WeeklyTopScores({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
      throw new Error('Failed to retrieve WeeklyTopScores from database', { cause: error });
    }
  }

  static async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, 'WeeklyTopScores'));
      const scores = [];
      querySnapshot.forEach(docSnap => {
        scores.push(new WeeklyTopScores(docSnap.data()));
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
      leaderboard: this.leaderboard,
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


module.exports = WeeklyTopScores;
