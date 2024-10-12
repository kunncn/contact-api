// src/models.js
const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Contact Schema
const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  email: { type: String, default: null },
  address: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Token Blacklist Schema
const tokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "1h" }, // Optional: Automatically delete after 1 hour
});

// Export Models
const User = mongoose.model("User", userSchema);
const Contact = mongoose.model("Contact", contactSchema);
const TokenBlacklist = mongoose.model("TokenBlacklist", tokenBlacklistSchema);

module.exports = { User, Contact, TokenBlacklist };
