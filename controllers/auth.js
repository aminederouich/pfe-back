const { auth, db } = require("./../config/firebase");
const {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} = require("firebase/auth");
const { doc, setDoc, getDoc } = require("firebase/firestore");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: true,
        message: "Authentication required",
      });
    }
    // Log JWT verification attempt
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: true,
      message: "Invalid or expired token",
    });
  }
};

exports.isLogged = [
  exports.auth,
  async (req, res) => {
    try {
      // Get user from auth middleware
      const uid = req.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        return res.status(200).json({
          error: false,
          message: "User is authenticated",
          user: {
            IsEmployee: userDoc.data().IsEmployee,
            IsManager: userDoc.data().IsManager,
            LastName: userDoc.data().LastName,
            FirstName: userDoc.data().FirstName,
            uid: uid,
            email: userDoc.data().email,
            name: userDoc.data().name,
            photoURL: userDoc.data().photoURL,
            phoneNumber: userDoc.data().phoneNumber,
          },
        });
      } else {
        return res.status(404).json({
          error: true,
          message: "User document not found",
        });
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return res.status(500).json({
        error: true,
        message: "An error occurred while checking authentication status",
      });
    }
  },
];

// signup
exports.signup = async (req, res) => {
  try {
    // Vérification des paramètres requis
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(422).json({
        error: true,
        message: "Email, password, and name are required",
      });
    }

    // Création de l'utilisateur avec Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Ajout du profil utilisateur dans Firestore
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: name,
    });

    // Réponse réussie
    return res.status(201).json({
      error: false,
      message: "User created and profile added to Firestore",
      user: {
        uid: user.uid,
        email: user.email,
        name: name,
      },
    });
  } catch (error) {
    // Gestion des erreurs de création
    let errorMessage = "An error occurred during sign up";
    if (error.code === "auth/weak-password") {
      errorMessage = "The password is too weak";
    } else if (error.code === "auth/email-already-in-use") {
      errorMessage = "The email address is already in use by another account";
    }

    return res.status(500).json({
      error: true,
      message: errorMessage,
    });
  }
};

// signin
exports.signin = async (req, res) => {
  try {
    // Input validation
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({
        error: true,
        message: "Email and password are required",
      });
    }

    // Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      return res.status(404).json({
        error: true,
        message: "User profile not found",
      });
    }

    // Generate JWT token with additional user claims
    const token = jwt.sign(
      { 
        uid: user.uid, 
        email: user.email,
        isEmployee: userDoc.data().IsEmployee,
        isManager: userDoc.data().IsManager
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return success response with user data and token
    return res.status(200).json({
      error: false,
      message: "Sign in successful",
      token,
      user: {
        uid: user.uid,
        email: user.email,
        name: userDoc.data().name,
        IsEmployee: userDoc.data().IsEmployee,
        IsManager: userDoc.data().IsManager,
        LastName: userDoc.data().LastName,
        FirstName: userDoc.data().FirstName,
        photoURL: userDoc.data().photoURL,
        phoneNumber: userDoc.data().phoneNumber
      }
    });

  } catch (error) {
    console.error("Signin error:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });

    let errorMessage = "An error occurred during sign in";
    let statusCode = 401;

    switch (error.code) {
      case "auth/wrong-password":
        errorMessage = "Incorrect password";
        break;
      case "auth/user-not-found":
        errorMessage = "No user found with this email";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many login attempts. Please try again later.";
        statusCode = 429;
        break;
      default:
        statusCode = 500;
        errorMessage = "Server error during authentication";
    }

    return res.status(statusCode).json({
      error: true,
      message: errorMessage,
      errorCode: error.code
    });
  }
};

exports.logout = [
  exports.auth,
  async (req, res) => {
    try {
      // Get user from auth middleware
      const uid = req.user.uid;
      
      if (!uid) {
        return res.status(401).json({
          error: true,
          message: "User not authenticated"
        });
      }

      // Log the logout attempt
      console.log(`Attempting to logout user: ${uid}`);

      // Firebase logout
      await signOut(auth);

      // Log successful logout
      console.log(`Successfully logged out user: ${uid}`);

      return res.status(200).json({
        error: false,
        message: "User has been logged out successfully",
        clearToken: true
      });
    } catch (error) {
      console.error("Logout error:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      return res.status(500).json({
        error: true,
        message: "An error occurred during logout",
        errorDetails: error.message
      });
    }
  }
];
// verify email
// this work after signup & signin
exports.verifyEmail = (req, res) => {
  auth.currentUser
    .sendEmailVerification()
    .then(function () {
      return res.status(200).json({ status: "Email Verification Sent!" });
    })
    .catch(function (error) {
      let errorCode = error.code;
      let errorMessage = error.message;
      if (errorCode === "auth/too-many-requests") {
        return res.status(500).json({ error: errorMessage });
      }
    });
};

// forget password
exports.forgetPassword = (req, res) => {
  if (!req.body.email) {
    return res.status(422).json({ email: "email is required" });
  }
  auth
    .sendPasswordResetEmail(req.body.email)
    .then(function () {
      return res.status(200).json({ status: "Password Reset Email Sent" });
    })
    .catch(function (error) {
      let errorCode = error.code;
      let errorMessage = error.message;
      if (errorCode == "auth/invalid-email") {
        return res.status(500).json({ error: errorMessage });
      } else if (errorCode == "auth/user-not-found") {
        return res.status(500).json({ error: errorMessage });
      }
    });
};
