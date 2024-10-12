// src/middleware.js
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { TokenBlacklist } = require("./models");

// Middleware for authentication
const authenticate = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, no token provided" });
  }

  // Extract Bearer token from the authorization header
  const bearerToken = token.split(" ")[1];

  // Check if the token is blacklisted
  const blacklisted = await TokenBlacklist.findOne({ token: bearerToken });
  if (blacklisted) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, Login Again",
    });
  }

  jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, invalid token" });
    }

    // Store the user ID from the decoded token into the request object
    req.userId = decoded.id;
    next();
  });
};

// Middleware for input validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
      message: `${errors.array()[0].msg}. Your ${errors.array()[0].path} is ${
        errors.array()[0].value
      }`,
    });
  }
  next();
};

// Middleware for error handling
const errorHandler = (err, req, res, next) => {
  console.error("Error Handler:", err.message); // Log the error message

  // Set the response status code based on the error type
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = { validate, errorHandler, authenticate };
