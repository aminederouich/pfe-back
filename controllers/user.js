const { getDocs, query, collection } = require('firebase/firestore');
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const HTTP_STATUS = require('../constants/httpStatus');

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
