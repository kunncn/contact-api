const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Contact } = require("../models");

// Register a new user
exports.registerUser = async (req, res) => {
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
};

// User login
exports.loginUser = async (req, res) => {
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
};

// Create a new contact
exports.createContact = async (req, res) => {
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
};

// Get all contacts
exports.getContacts = async (req, res) => {
  const contacts = await Contact.find({ userId: req.userId });
  res.status(200).json(contacts);
};

// Get a single contact
exports.getContact = async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.status(200).json(contact);
};

// Update a contact
exports.updateContact = async (req, res) => {
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
};

// Delete a contact
exports.deleteContact = async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }

  await Contact.deleteOne({ _id: req.params.id, userId: req.userId });
  res.status(204).json();
};
