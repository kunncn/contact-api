const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Contact, TokenBlacklist } = require("../models");

// Register a new user
exports.registerUser = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

// User login
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email." });
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
  } catch (error) {
    next(error);
  }
};

// Controller to edit user account
exports.editUserAccount = async (req, res, next) => {
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
  } catch (error) {
    next(error);
  }
};

// Get user info
exports.getUserInfo = async (req, res, next) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Count the number of contacts associated with the user
    const contactCount = await Contact.countDocuments({ userId: user._id });

    // Return the user info along with the contact count
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactCount: contactCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
exports.deleteUserAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Blacklist the token
    const token = req.headers["authorization"].split(" ")[1];
    const blacklistedToken = new TokenBlacklist({ token });
    await blacklistedToken.save();

    // Delete all contacts associated with the user
    await Contact.deleteMany({ userId: req.userId });

    // Delete the user account
    await User.deleteOne({ _id: req.userId });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
