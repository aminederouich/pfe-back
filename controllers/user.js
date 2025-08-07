const {
  getDocs,
  query,
  collection,
  where,
  addDoc,
  updateDoc,
  doc,
} = require('firebase/firestore');
const { db } = require('../config/firebase');
const HTTP_STATUS = require('../constants/httpStatus');
const authMiddleware = require('../middleware/auth');
const User = require('../models/user.model');
const { sendInvitationEmail } = require('../utils/email.util');
const bcrypt = require('bcrypt');

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

// Obtenir un utilisateur par UID
exports.getUserByUid = async(req, res) => {
  const { uid } = req.params;
  try {
    const user = await User.findByUid(uid);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'User not found' });
    }
    return res.status(HTTP_STATUS.OK).json(user.toPublicFormat());
  } catch (error) {
    console.error('Error fetching user:', error);
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

// Inviter un nouvel employé
exports.inviteNewEmployee = async(req, res) => {
  const { firstName, lastName, email, managerId } = req.body;
  console.log('Données reçues :', req.body);

  if (!firstName || !lastName || !email || !managerId) {
    console.log('Champs requis manquants');
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Champs requis manquants',
    });
  }

  try {
    // 1. Vérifier le manager
    console.log('Recherche du manager dans Firestore...');
    const usersRef = collection(db, 'users');
    const managerQuery = query(usersRef, where('uid', '==', managerId));
    const managerSnapshot = await getDocs(managerQuery);

    if (managerSnapshot.empty) {
      console.log('Manager introuvable');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Impossible d’envoyer l’invitation : identifiant manager introuvable.',
      });
    }
    console.log('Manager trouvé !');

    // 2. Envoi de l'email
    console.log('Envoi de l\'email d\'invitation...');
    await sendInvitationEmail(email, firstName);
    console.log('Email envoyé !');

    // 3. Ajout de l'employé
    console.log('Ajout de l\'employé dans Firestore...');
    const newUserRef = await addDoc(usersRef, {
      firstName,
      lastName,
      email,
      role: 'employee',
      managerId,
      password: null,
      createdAt: new Date(),
    });
    console.log('Employé ajouté avec l\'ID :', newUserRef.id);

    // 4. Mise à jour de l'UID
    console.log('Mise à jour de l\'UID...');
    await updateDoc(doc(db, 'users', newUserRef.id), {
      uid: newUserRef.id,
      updatedAt: new Date(),
    });
    console.log('UID mis à jour !');

    return res.status(HTTP_STATUS.OK).json({
      message: 'Invitation envoyée et employé ajouté à la base de données',
    });
  } catch (error) {
    console.error('Erreur lors de l’invitation :', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Erreur lors de l’envoi de l’invitation',
      error: error.message,
    });
  }
};

// Définir le mot de passe d'un utilisateur
exports.setPassword = async(req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifie si l'utilisateur existe déjà
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', email));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour l'utilisateur avec le mot de passe
    const userId = userSnapshot.docs[0].id;
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    res.status(200).json({ message: 'Mot de passe défini avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la définition du mot de passe', error: err.message });
  }
};
