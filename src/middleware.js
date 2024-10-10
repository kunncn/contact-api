// src/middleware.js
const { validationResult } = require("express-validator");

// Middleware for input validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Middleware for error handling
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
};

module.exports = { validate, errorHandler };
