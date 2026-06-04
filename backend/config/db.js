// =============================================================
// config/db.js - MongoDB Atlas Database Configuration
// Handles connection to MongoDB Atlas with proper error handling
// and connection lifecycle logging
// =============================================================

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error(
        "❌ [DB] MONGODB_URI is not defined in environment variables"
      );
      process.exit(1);
    }

    console.log("⏳ [DB] Connecting to MongoDB Atlas...");

    const conn = await mongoose.connect(mongoURI, {
      // Mongoose 8+ handles these internally, but explicit for clarity:
      serverSelectionTimeoutMS: 10000, // Timeout after 10s if Atlas not reachable
      socketTimeoutMS: 45000,
    });

    console.log(
      `✅ [DB] MongoDB Atlas Connected: ${conn.connection.host}`
    );
    console.log(`📂 [DB] Database Name: ${conn.connection.name}`);

    // Handle disconnection events
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  [DB] MongoDB disconnected. Reconnecting...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ [DB] MongoDB reconnected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`❌ [DB] MongoDB connection error: ${err.message}`);
    });
  } catch (error) {
    console.error(`❌ [DB] Connection Failed: ${error.message}`);
    // Exit process with failure code so Docker can detect crash
    process.exit(1);
  }
};

module.exports = connectDB;
