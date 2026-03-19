/**
 * Authentication & Authorization Middleware
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const APIError = require("../utils/apiError");
const { ACCOUNT_TYPES } = require("../constants");

/**
 * Authentication Middleware
 * Accepts token from:
 *  1. Authorization: Bearer <token>  header
 *  2. refreshToken cookie (for cookie-based flows)
 */
exports.auth = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      // fallback: httpOnly cookie
      token = req.cookies.token;
    }

    if (!token) {
      throw APIError.authentication("Access token is missing");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw APIError.authentication("Access token has expired");
      }
      throw APIError.authentication("Invalid token");
    }

    // Fetch fresh user so we always have latest accountType + isActive
    const user = await User.findById(decoded.id).select(
      "-password -resetPasswordToken -resetPasswordExpiry"
    );

    if (!user) {
      throw APIError.authentication("User no longer exists");
    }

    if (!user.isActive) {
      throw APIError.authorization("Your account has been deactivated");
    }

    // Attach full user object — downstream can use req.user.id, req.user.accountType etc.
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Generic role-based authorization
 * Usage:  authorize("Instructor", "Admin")
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw APIError.authentication("User not authenticated");
      }

      if (!roles.includes(req.user.accountType)) {
        throw APIError.authorization(
          `This resource requires one of these roles: ${roles.join(", ")}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Shortcut role middlewares
 */
exports.isStudent    = exports.authorize(ACCOUNT_TYPES.STUDENT);
exports.isInstructor = exports.authorize(ACCOUNT_TYPES.INSTRUCTOR);
exports.isAdmin      = exports.authorize(ACCOUNT_TYPES.ADMIN);

/**
 * isInstructorOrAdmin — for shared management routes
 */
exports.isInstructorOrAdmin = exports.authorize(
  ACCOUNT_TYPES.INSTRUCTOR,
  ACCOUNT_TYPES.ADMIN
);

/**
 * Optional auth — attaches req.user if token present but does NOT block if missing.
 * Use on public routes that behave slightly differently for logged-in users
 * (e.g. course detail page showing "enrolled" badge).
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "-password -resetPasswordToken -resetPasswordExpiry"
      );
      req.user = user || null;
    } catch {
      // Invalid / expired — just treat as unauthenticated
      req.user = null;
    }

    next();  } catch (error) {
    next(error);
  }
};