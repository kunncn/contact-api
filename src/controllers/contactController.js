const bcrypt = require("bcryptjs");
const { User, Contact } = require("../models");

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
  res.status(201).json({
    success: true,
    message: "Contact created successfully",
    contact: newContact,
  });
};

// Get all contacts
exports.getContacts = async (req, res) => {
  const contacts = await Contact.find({ userId: req.userId });
  res.status(200).json({ success: true, contacts });
};

// Get a single contact
exports.getContact = async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!contact) {
    return res
      .status(404)
      .json({ success: false, message: "Contact not found" });
  }
  res.status(200).json({ success: true, contact });
};

// Update a contact
exports.updateContact = async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!contact) {
    return res
      .status(404)
      .json({ success: false, message: "Contact not found" });
  }

  // Update contact fields
  Object.assign(contact, req.body);
  await contact.save();
  res
    .status(200)
    .json({ success: true, message: "Contact updated successfully", contact });
};

// Delete a contact
exports.deleteContact = async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!contact) {
    return res
      .status(404)
      .json({ success: false, message: "Contact not found" });
  }

  await Contact.deleteOne({ _id: req.params.id, userId: req.userId });
  res.status(204).end();
};
