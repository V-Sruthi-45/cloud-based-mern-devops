// =============================================================
// middleware/auth.js - JWT Authentication Middleware
// Protects routes by verifying Bearer tokens on every request
// =============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.warn(`🔒 [Auth] Unauthorized access attempt to: ${req.originalUrl}`);
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // 2. Verify the token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch the user from DB (ensures user still exists)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token invalid. User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact support.",
      });
    }

    // 4. Attach user to request for downstream controllers
    req.user = user;
    console.log(`✅ [Auth] Authenticated: ${user.email} → ${req.originalUrl}`);
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }
    console.error(`❌ [Auth] Token verification error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Authentication error. Please try again.",
    });
  }
};

module.exports = { protect };
