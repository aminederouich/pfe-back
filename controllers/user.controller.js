const {
  getDocs,
  query,
  collection,
  where,
  updateDoc,
  doc,
  setDoc,
} = require('firebase/firestore');
const { db, auth } = require('../config/firebase');
const HTTP_STATUS = require('../constants/httpStatus');
const authMiddleware = require('../middleware/auth');
const User = require('../models/user.model');
const { sendInvitationEmail } = require('../utils/email.util');
const { createUserWithEmailAndPassword, updatePassword } = require('firebase/auth');

// Obtenir tous les utilisateurs
exports.getAllUsers = [
  authMiddleware,
  async(req, res) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });

      return res.status(HTTP_STATUS.OK).json({
        error: false,
        message: 'Users retrieved successfully',
        users,
      });
    } catch (error) {
      console.error('Error retrieving users:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'An error occurred while retrieving users',
      });
    }
  },
];

// Obtenir un utilisateur par accountId
exports.getUserByAccountId = async(req, res) => {
  const { accountId } = req.params;
  try {
    const user = await User.findByAccountId(accountId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
    }
    return res.status(HTTP_STATUS.OK).json(user.toPublicFormat());
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

// Obtenir un utilisateur par UID (utilisé par les routes)
exports.getUserByUid = async(req, res) => {
  const { uid } = req.params;
  try {
    const user = await User.findByUid(uid);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
    }
    return res.status(HTTP_STATUS.OK).json(user.toPublicFormat());
  } catch (error) {
    console.error('Error fetching user by uid:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

// Obtenir les stats de tickets d'un utilisateur
exports.getTicketStatsByUser = async(req, res) => {
  const { uid } = req.params;
  try {
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('assignedTo', '==', uid));
    const querySnapshot = await getDocs(q);

    let weekly = 0;
    let score = 0;
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt ? new Date(data.createdAt.seconds * 1000) : null;
      score += data.score || 0;
      if (createdAt && createdAt > oneWeekAgo) {
        weekly++;
      }
    });

    return res.status(HTTP_STATUS.OK).json({
      total: querySnapshot.size,
      weekly,
      score,
    });
  } catch (error) {
    console.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors du calcul des statistiques' });
  }
};

exports.inviteNewUser = [
  authMiddleware,
  async(req, res) => {
    const { email, managerId } = req.body;
    if (!email || !managerId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: true,
        message: 'Champs requis manquants',
      });
    }
    try {
      // Vérifier si l'utilisateur existe déjà
      const usersRef = collection(db, 'users');
      const existingUserQuery = query(usersRef, where('emailAddress', '==', email));
      const existingUserSnapshot = await getDocs(existingUserQuery);
      if (!existingUserSnapshot.empty) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: true,
          message: 'Un utilisateur avec cet email existe déjà.',
        });
      }

      // Vérifier si le manager existe
      const managerQuery = query(usersRef, where('accountId', '==', managerId));
      const managerSnapshot = await getDocs(managerQuery);
      if (managerSnapshot.empty) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: true,
          message: 'Impossible d’envoyer l’invitation : identifiant manager introuvable.',
        });
      }

      // Générer un mot de passe temporaire sécurisé
      const password = Array.from({ length: 12 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
          .charAt(Math.floor(Math.random() * 72)),
      ).join('');

      // Créer l'utilisateur dans Firebase Auth
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (authError) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: 'Erreur lors de la création du compte Firebase Auth',
          details: authError.message,
        });
      }

      const firebaseUser = userCredential.user;
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = {
        accountId: firebaseUser.uid,
        uid: firebaseUser.uid,
        emailAddress: firebaseUser.email,
        createdAt: new Date(),
        managerId,
        accountType: 'TakeIt',
        IsEmployee: true,
        IsManager: false,
        invited: true,
        active: false,
        locale: 'fr_FR',
        self: '',
      };

      // Enregistrer l'utilisateur dans Firestore
      await setDoc(userRef, userDoc);

      // Envoyer l'email d'invitation
      try {
        const emailSent = await sendInvitationEmail(email, password);
        if (!emailSent || !emailSent.messageId) {
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: 'Utilisateur créé mais échec de l’envoi de l’email d’invitation.',
          });
        }
      } catch (emailError) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: 'Utilisateur créé mais erreur lors de l’envoi de l’email.',
          details: emailError.message,
        });
      }

      return res.status(HTTP_STATUS.CREATED).json({
        error: false,
        message: 'Utilisateur invité avec succès.',
        user: {
          accountId: firebaseUser.uid,
          email: firebaseUser.email,
          managerId,
        },
      });
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Erreur lors de l’envoi de l’invitation',
        details: error.message,
      });
    }
  },
];

// Définir le mot de passe d'un utilisateur
exports.setPassword = [authMiddleware,
  async(req, res) => {
    const { password } = req.body;
    const user = auth.currentUser;
    try {
      await updatePassword(user, password);
      return res.status(HTTP_STATUS.OK).json({ message: 'Mot de passe mis à jour avec succès.', error: false });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Erreur lors de la mise à jour du mot de passe.', error: error.message });
    }

  }];

exports.updateUser = [authMiddleware, async(req, res) => {
  const { uid } = req.params;
  console.log(uid, req.body);
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
    if (userSnap.empty) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found', error: true });
    }
    const [userDoc] = userSnap.docs;
    const currentData = userDoc.data();
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined && req.body[key] !== currentData[key]) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(HTTP_STATUS.OK).json({ message: 'No changes detected', error: false });
    }

    await updateDoc(userRef, updates);

    return res.status(HTTP_STATUS.OK).json({ message: 'User updated successfully', updates, error: false });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error updating user', error: error.message });
  }
}];
