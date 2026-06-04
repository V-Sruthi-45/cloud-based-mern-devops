// =============================================================
// controllers/authController.js - Authentication Logic
// Register, Login, Profile management
// =============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---- Helper: Generate JWT Token ----
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ---- Helper: Send token response ----
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  console.log(`🎟️  [Auth] Token generated for user: ${user.email}`);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Create user (password hashing handled in User model pre-save hook)
    const user = await User.create({ name, email, password });
    console.log(`✅ [Auth] New user registered: ${user.email}`);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user including password (select: false by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      console.warn(`🔒 [Auth] Login failed - user not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.warn(`🔒 [Auth] Login failed - wrong password: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    console.log(`✅ [Auth] User logged in: ${user.email}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (name, avatar)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar },
      { new: true, runValidators: true }
    );
    console.log(`✅ [Auth] Profile updated: ${user.email}`);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();
    console.log(`✅ [Auth] Password changed for: ${user.email}`);
    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout (client-side only - inform client to clear token)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  console.log(`👋 [Auth] User logged out: ${req.user.email}`);
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};
