// =============================================================
// models/User.js - User MongoDB Schema
// Handles user data structure, password hashing, and validation
// =============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Auto-creates createdAt and updatedAt
  }
);

// Index for faster email lookups
userSchema.index({ email: 1 });

// ---- Pre-save Hook: Hash password before saving ----
userSchema.pre("save", async function (next) {
  // Only hash if password field is modified
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const saltRounds = 12; // Industry-standard bcrypt cost factor
    this.password = await bcrypt.hash(this.password, saltRounds);
    console.log(`🔐 [Auth] Password hashed for user: ${this.email}`);
    next();
  } catch (error) {
    next(error);
  }
});

// ---- Method: Compare entered password with hashed password ----
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ---- Method: Return user data without sensitive fields ----
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
