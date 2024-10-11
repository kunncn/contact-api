// src/routes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const { User, Contact } = require("./models");
const { validate } = require("./middleware");

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
  async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({ name, email, passwordHash });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  }
);

// Login
router.post(
  "/api/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  }
);

// Middleware to authenticate the token
const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];

  console.log("Token received:", token); // Log the token

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract Bearer token
  const bearerToken = token.split(" ")[1];

  jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.userId = decoded.id;
    next();
  });
};

// Create Contact
router.post(
  "/api/contact",
  authenticate,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").isNumeric().withMessage("Phone must be a number"),
  ],
  validate,
  async (req, res) => {
    const { name, phone, email, address } = req.body;
    const newContact = new Contact({
      userId: req.userId,
      name,
      phone,
      email,
      address,
    });
    await newContact.save();
    res.status(201).json(newContact);
  }
);

// Get Contacts
router.get("/api/contact", authenticate, async (req, res) => {
  const contacts = await Contact.find({ userId: req.userId });
  res.status(200).json(contacts);
});

// Get Single Contact
router.get("/api/contact/:id", authenticate, async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.status(200).json(contact);
});

// Update Contact
router.put("/api/contact/:id", authenticate, async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }

  // Update contact fields
  Object.assign(contact, req.body);
  await contact.save();
  res.status(200).json(contact);
});

// Delete Contact
router.delete("/api/contact/:id", authenticate, async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }

  await Contact.deleteOne({ _id: req.params.id, userId: req.userId });
  res.status(204).json();
});

module.exports = router;
