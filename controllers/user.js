const { getDocs, query, collection, where } = require('firebase/firestore');
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const HTTP_STATUS = require('../constants/httpStatus');
const User = require('../models/user.model') ;

exports.getAllUsers = [
  authMiddleware,
  async(req, res) => {
    console.log('Starting getAllUsers...');
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });

      console.log('Users retrieved successfully:', users);
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
