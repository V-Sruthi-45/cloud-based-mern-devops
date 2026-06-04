// =============================================================
// server.js - Application Entry Point
// Loads env vars, connects DB, starts HTTP server
// =============================================================

require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ---- Unhandled Promise Rejection Handler ----
process.on("unhandledRejection", (err) => {
  console.error(`❌ [Server] Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// ---- SIGTERM Handler (for Docker graceful shutdown) ----
process.on("SIGTERM", () => {
  console.log("🛑 [Server] SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("✅ [Server] Server closed.");
    process.exit(0);
  });
});

// ---- Start Application ----
const startServer = async () => {
  console.log("=".repeat(60));
  console.log("🚀 [Server] MERN Task Manager - Starting...");
  console.log(`📦 [Server] Environment: ${NODE_ENV}`);
  console.log(`📅 [Server] Timestamp: ${new Date().toISOString()}`);
  console.log("=".repeat(60));

  // Connect to MongoDB Atlas first
  await connectDB();

  // Then start HTTP server
  const server = app.listen(PORT, () => {
    console.log(`\n✅ [Server] Running on port ${PORT}`);
    console.log(`🔗 [Server] API: http://localhost:${PORT}/api`);
    console.log(`❤️  [Server] Health: http://localhost:${PORT}/health`);
    console.log("=".repeat(60));
  });

  return server;
};

const server = startServer().catch((err) => {
  console.error("❌ [Server] Failed to start:", err.message);
  process.exit(1);
});
