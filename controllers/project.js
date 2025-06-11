const { getDocs, query, collection } = require("firebase/firestore");
const authMiddleware = require("../middleware/auth");
const { db } = require("../config/firebase");

exports.getAllProject = [
  authMiddleware,
  (req, res) => {
    getDocs(query(collection(db, "project")))
      .then((querySnapshot) => {
        const projects = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json({
          error: false,
          message: "Projects retrieved successfully",
          data: projects,
        });
      })
      .catch((error) => {
        console.error("Error retrieving projects:", error);
        res.status(500).json({
          error: true,
          message: "Error retrieving projects",
        });
      });
  },
];