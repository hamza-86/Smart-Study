/**
 * Custom API Error Class
 */

const { ERROR_TYPES, HTTP_STATUS } = require("../constants");

class APIError extends Error {
  constructor(
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message    = "Internal Server Error",
    errorType  = ERROR_TYPES.INTERNAL_ERROR,
    details    = null
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errorType  = errorType;
    this.details    = details;
    this.timestamp  = new Date();
    this.isAPIError = true; // easy duck-typing check

    Error.captureStackTrace(this, this.constructor);
  }

  // ── Static factories ────────────────────────────────────────────────────

  /** Generic factory — use when no specific helper fits */
  static create(statusCode, message, errorType = ERROR_TYPES.INTERNAL_ERROR, details = null) {
    return new APIError(statusCode, message, errorType, details);
  }

  /** 400 Bad Request — validation failures */
  static validation(message, details = null) {
    return new APIError(
      HTTP_STATUS.BAD_REQUEST,
      message,
      ERROR_TYPES.VALIDATION_ERROR,
      details
    );
  }

  /** 401 Unauthorized — missing or invalid credentials / token */
  static authentication(message = "Authentication failed") {
    return new APIError(
      HTTP_STATUS.UNAUTHORIZED,
      message,
      ERROR_TYPES.AUTHENTICATION_ERROR
    );
  }

  /** 403 Forbidden — authenticated but not allowed */
  static authorization(message = "Access denied") {
    return new APIError(
      HTTP_STATUS.FORBIDDEN,
      message,
      ERROR_TYPES.AUTHORIZATION_ERROR
    );
  }

  /** 404 Not Found */
  static notFound(resource = "Resource") {
    return new APIError(
      HTTP_STATUS.NOT_FOUND,
      `${resource} not found`,
      ERROR_TYPES.NOT_FOUND_ERROR
    );
  }

  /** 409 Conflict — duplicate records etc. */
  static conflict(message) {
    return new APIError(
      HTTP_STATUS.CONFLICT,
      message,
      ERROR_TYPES.CONFLICT_ERROR
    );
  }

  /** 500 Internal — database failures */
  static database(message = "Database operation failed", details = null) {
    return new APIError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message,
      ERROR_TYPES.DATABASE_ERROR,
      details
    );
  }

  /** 503 Service Unavailable — external API failures (Razorpay, Cloudinary, etc.) */
  static externalAPI(message = "External service unavailable", details = null) {
    return new APIError(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      message,
      ERROR_TYPES.EXTERNAL_API_ERROR,
      details
    );
  }

  /** 429 Too Many Requests */
  static rateLimit(message = "Too many requests. Please slow down.") {
    return new APIError(
      HTTP_STATUS.TOO_MANY_REQUESTS,
      message,
      ERROR_TYPES.RATE_LIMIT_ERROR
    );
  }

  /** 400 Bad Request — file upload failures */
  static fileUpload(message = "File upload failed", details = null) {
    return new APIError(
      HTTP_STATUS.BAD_REQUEST,
      message,
      ERROR_TYPES.FILE_UPLOAD_ERROR,
      details
    );
  }

  // ── Serialization ────────────────────────────────────────────────────────

  toJSON() {
    return {
      success:    false,
      statusCode: this.statusCode,
      errorType:  this.errorType,
      message:    this.message,
      details:    this.details,
      timestamp:  this.timestamp,
    };
  }
}

module.exports = APIError;