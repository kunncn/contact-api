const express = require("express");
const { body } = require("express-validator");
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
} = require("./controllers/userController");

const router = express.Router();

// Register
router.post(
  "/api/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("password_confirmation").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  ],
  validate,
  registerUser
);

// Login
router.post(
  "/api/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  loginUser
);

// Edit user account route
router.put(
  "/api/account/edit",
  authenticate, // Ensure the user is logged in
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Invalid email"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("password_confirmation")
      .optional()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password confirmation does not match password");
        }
        return true;
      }),
  ],
  validate, // Middleware to handle validation errors
  editUserAccount // Call the controller function
);

// Contacts
router.post(
  "/api/contact",
  authenticate,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").isNumeric().withMessage("Phone must be a number"),
  ],
  validate,
  createContact
);

router.get("/api/contact", authenticate, getContacts);
router.get("/api/contact/:id", authenticate, getContact);
router.put("/api/contact/:id", authenticate, updateContact);
router.delete("/api/contact/:id", authenticate, deleteContact);

module.exports = router;
