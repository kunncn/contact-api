const express = require("express");
const { body } = require("express-validator");
const { validate, authenticate } = require("./middleware");

const {
  registerUser,
  loginUser,
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
} = require("./controllers/contactController");

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
