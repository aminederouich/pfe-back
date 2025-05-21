const {
  getDocs,
  query,
  collection,
} = require("firebase/firestore");
const { db } = require("../config/firebase");
const authMiddleware = require("../middleware/auth");

exports.getAllUsers = [
  authMiddleware,
  async (req, res) => {
    console.log("Starting getAllUsers...");
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });
      console.log("Users retrieved successfully:", users);
      return res.status(200).json({
        error: false,
        message: "Users retrieved successfully",
        users: users,
      });
    } catch (error) {
      console.error("Error retrieving users:", error);
      return res.status(500).json({
        error: true,
        message: "An error occurred while retrieving users",
      });
    }
  },
];