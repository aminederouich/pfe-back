const { db } = require('../config/firebase');
const { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } = require('firebase/firestore');

class Rule {
  constructor(ruleData) {
    this.id = ruleData.id;
    this.ownerId = ruleData.ownerId;
    this.priority = ruleData.priority || {
      Highest: { checked: false, value: 0 },
      High: { checked: false, value: 0 },
      Medium: { checked: false, value: 0 },
      Low: { checked: false, value: 0 },
      Lowest: { checked: false, value: 0 },
    };
    this.issuetype = ruleData.issuetype || {
      Bug: { checked: false, value: 0 },
      Task: { checked: false, value: 0 },
      Story: { checked: false, value: 0 },
    };
    this.deadline = ruleData.deadline || {
      BeforeDeadline: { checked: false, value: 0 },
      OnDeadline: { checked: false, value: 0 },
    };
    this.resolution = ruleData.resolution || {
      Done: { checked: false, value: 0 },
    };
    this.createdAt = ruleData.createdAt || null;
    this.updatedAt = ruleData.updatedAt || null;
  }

  /**
   * Create a new rule document in Firestore or update if ownerId already exists
   * @param {Object} ruleData - Rule data to create/update
   * @returns {Promise<Object>} - Object with rule instance and operation type
   */
  static async create(ruleData) {
    return Rule.upsertByOwnerId(ruleData);
  }

  /**
   * Create or update a rule based on ownerId (upsert)
   * @param {Object} ruleData - Rule data to create/update
   * @returns {Promise<Object>} - Object with rule instance and operation type
   */
  static async upsertByOwnerId(ruleData) {
    try {
      // Vérifier si une règle existe déjà pour cet ownerId
      const existingRule = await Rule.findByOwnerId(ruleData.ownerId);

      if (existingRule) {
        // Mettre à jour la règle existante
        const updatedRule = await Rule.update(existingRule.id, {
          priority: ruleData.priority || existingRule.priority,
          issuetype: ruleData.issuetype || existingRule.issuetype,
          deadline: ruleData.deadline || existingRule.deadline,
          resolution: ruleData.resolution || existingRule.resolution,
        });
        return {
          rule: updatedRule,
          operation: 'updated',
          message: 'Règle mise à jour avec succès',
        };
      }

      // Créer une nouvelle règle via helper
      return await Rule._createNewRule(ruleData);
    } catch (error) {
      // Optionally log error to a logging service here
      throw new Error('Failed to create/update rule in database', { cause: error });
    }
  }

  /**
   * Helper to create a new rule document in Firestore
   * @param {Object} ruleData
   * @returns {Promise<Object>}
   */
  static async _createNewRule(ruleData) {
    const ruleRef = doc(collection(db, 'rules'));
    const ruleDoc = {
      id: ruleRef.id,
      ownerId: ruleData.ownerId,
      priority: ruleData.priority || {
        Highest: { checked: false, value: 0 },
        High: { checked: false, value: 0 },
        Medium: { checked: false, value: 0 },
        Low: { checked: false, value: 0 },
        Lowest: { checked: false, value: 0 },
      },
      issuetype: ruleData.issuetype || {
        Bug: { checked: false, value: 0 },
        Task: { checked: false, value: 0 },
        Story: { checked: false, value: 0 },
      },
      deadline: ruleData.deadline || {
        BeforeDeadline: { checked: false, value: 0 },
        OnDeadline: { checked: false, value: 0 },
      },
      resolution: ruleData.resolution || {
        Done: { checked: false, value: 0 },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(ruleRef, ruleDoc);
    const newRule = new Rule(ruleDoc);
    return {
      rule: newRule,
      operation: 'created',
      message: 'Règle créée avec succès',
    };
  }

  /**
   * Find a rule by ID
   * @param {string} ruleId - Rule ID
   * @returns {Promise<Rule|null>} - Rule instance or null if not found
   */
  static async findById(ruleId) {
    try {
      const ruleDoc = await getDoc(doc(db, 'rules', ruleId));
      if (ruleDoc.exists()) {
        return new Rule({ id: ruleDoc.id, ...ruleDoc.data() });
      }
      return null;
    } catch (error) {
      throw new Error('Failed to retrieve rule from database', { cause: error });
    }
  }

  /**
   * Find rule by owner ID (returns single rule since each owner has only one rule)
   * @param {string} ownerId - Owner ID
   * @returns {Promise<Rule|null>} - Rule instance or null if not found
   */
  static async findByOwnerId(ownerId) {
    try {
      const q = query(collection(db, 'rules'), where('ownerId', '==', ownerId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      // Retourner la première (et unique) règle trouvée
      const [firstDoc] = snapshot.docs;
      return new Rule({ id: firstDoc.id, ...firstDoc.data() });
    } catch (error) {
      throw new Error('Failed to retrieve rule from database', { cause: error });
    }
  }

  /**
   * Get all rules
   * @returns {Promise<Array<Rule>>} - Array of rule instances
   */
  static async getAll() {
    try {
      const snapshot = await getDocs(collection(db, 'rules'));
      return snapshot.docs.map(doc => new Rule({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error('Failed to retrieve rules from database', { cause: error });
    }
  }

  /**
   * Update rule information
   * @param {string} ruleId - Rule ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Rule>} - Updated rule instance
   */
  static async update(ruleId, updateData) {
    try {
      const ruleRef = doc(db, 'rules', ruleId);
      const updatedData = {
        ...updateData,
        updatedAt: new Date(),
      };

      await updateDoc(ruleRef, updatedData);

      // Return updated rule
      const updatedRule = await Rule.findById(ruleId);
      return updatedRule;
    } catch (error) {
      throw new Error('Failed to update rule in database', { cause: error });
    }
  }

  /**
   * Convert rule instance to public format
   * @returns {Object} - Public rule data
   */
  toPublicFormat() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      priority: this.priority,
      issuetype: this.issuetype,
      deadline: this.deadline,
      resolution: this.resolution,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert rule instance to calculation format (for score calculation)
   * @returns {Object} - Rule data for calculations
   */
  toCalculationFormat() {
    return {
      id: this.id,
      priority: this.priority,
      issuetype: this.issuetype,
      deadline: this.deadline,
      resolution: this.resolution,
    };
  }
}

module.exports = Rule;
