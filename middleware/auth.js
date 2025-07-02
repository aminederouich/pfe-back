require("dotenv").config();
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("Starting authentication middleware...");
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Received token:", token ? "Token present" : "No token");

    if (!token) {
      console.log("Authentication failed: No token provided");
      return res.status(401).json({
        error: true,
        message: "Authentication required",
      });
    }

    // Verify token
    console.log("Attempting to verify JWT token...");
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({
        error: true,
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT verification successful:", {
      uid: decoded.uid,
      email: decoded.email,
    });

    // Add user data to request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", {
      errorMessage: error.message,
      errorName: error.name,
      stack: error.stack,
    });
    return res.status(401).json({
      error: true,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
