/**
 * Global Error Handling Middleware
 */

const logger = require("../utils/logger");
const APIError = require("../utils/apiError");
const { HTTP_STATUS } = require("../constants");

/**
 * Central error handler
 * Handles: APIError, Mongoose errors, JWT errors, Multer/file errors, Cloudinary errors
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message    = "Internal Server Error";
  let errorType  = "InternalError";
  let details    = null;

  // ── Custom APIError ──────────────────────────────────────
  if (err instanceof APIError) {
    statusCode = err.statusCode;
    message    = err.message;
    errorType  = err.errorType;
    details    = err.details;
  }

  // ── Mongoose Validation Error ────────────────────────────
  else if (err.name === "ValidationError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorType  = "ValidationError";
    message    = "Validation failed";
    details    = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
  }

  // ── Mongoose CastError (invalid ObjectId) ────────────────
  else if (err.name === "CastError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorType  = "CastError";
    message    = `Invalid ${err.path}: ${err.value}`;
  }

  // ── MongoDB Duplicate Key ────────────────────────────────
  else if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    errorType  = "DuplicateKeyError";
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message    = `${field} already exists`;
  }

  // ── JWT Invalid ──────────────────────────────────────────
  else if (err.name === "JsonWebTokenError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    errorType  = "JWTError";
    message    = "Invalid token";
  }

  // ── JWT Expired ──────────────────────────────────────────
  else if (err.name === "TokenExpiredError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    errorType  = "TokenExpiredError";
    message    = "Token has expired";
  }

  // ── Multer / file upload errors ──────────────────────────
  else if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorType  = "FileSizeError";
    message    = "File size exceeds the allowed limit";
  }

  else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorType  = "FileFieldError";
    message    = `Unexpected file field: ${err.field}`;
  }

  // ── Cloudinary upload error ──────────────────────────────
  else if (err.http_code) {
    statusCode = err.http_code >= 400 && err.http_code < 600
      ? err.http_code
      : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    errorType  = "CloudinaryError";
    message    = err.message || "File upload failed";
  }

  // ── Log ─────────────────────────────────────────────────
  logger.error("Request Error:", err, {
    path:       req.path,
    method:     req.method,
    statusCode,
    errorType,
  });

  // ── Send response ────────────────────────────────────────
  res.status(statusCode).json({
    success:   false,
    statusCode,
    errorType,
    message,
    details,
    timestamp: new Date(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Async handler — wraps controller so thrown errors reach errorHandler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler — mount AFTER all routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new APIError(
    HTTP_STATUS.NOT_FOUND,
    `Route not found: ${req.originalUrl}`,
    "NotFoundError"
  );
  res.status(HTTP_STATUS.NOT_FOUND).json(error.toJSON());
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
};