const express = require("express");
const { validate, authenticate } = require("./middleware");
const {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
} = require("./controllers/contactController");
const {
  registerUser,
  loginUser,
  editUserAccount,
  getUserInfo,
  deleteUserAccount, // Import the deleteUserAccount controller
} = require("./controllers/userController");
const {
  userValidationRules,
  loginValidationRules,
  editAccountValidationRules,
  contactValidationRules,
} = require("./validation");

const router = express.Router();

// Register
router.post("/api/register", userValidationRules(), validate, registerUser);

// Login
router.post("/api/login", loginValidationRules(), validate, loginUser);

// Get user info route
router.get("/api/account", authenticate, getUserInfo); // Add this route

// Delete user account route
router.delete("/api/account", authenticate, deleteUserAccount); // Add this route

// Edit user account route
router.put(
  "/api/account/edit",
  authenticate, // Ensure the user is logged in
  editAccountValidationRules(), // Use validation for editing account
  validate, // Middleware to handle validation errors
  editUserAccount // Call the controller function
);

// Contacts
router.post(
  "/api/contact",
  authenticate,
  contactValidationRules(), // Use validation for creating a contact
  validate,
  createContact
);

router.get("/api/contact", authenticate, getContacts);
router.get("/api/contact/:id", authenticate, getContact);
router.put(
  "/api/contact/:id",
  authenticate,
  contactValidationRules(),
  validate,
  updateContact
);
router.delete("/api/contact/:id", authenticate, deleteContact);

module.exports = router;
