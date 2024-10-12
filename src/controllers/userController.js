const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const newUser = new User({ name, email, passwordHash });
  await newUser.save();

  res
    .status(201)
    .json({ success: true, message: `User ${name} created successfully` });
};

// User login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid Email." });
  }

  // Check password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Password." });
  }

  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.status(200).json({ success: true, token });
};

// Controller to edit user account
exports.editUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { name, email, password } = req.body;

    // Update user fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Account updated successfully", // Fixed message
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
