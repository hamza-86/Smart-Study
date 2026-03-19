/**
 * Request Validation Middleware
 * Uses Joi schemas passed as arguments
 */

const APIError = require("../utils/apiError");

/**
 * Validate req.body against a Joi schema
 */
const validateRequestBody = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,   // collect all errors, not just first
        allowUnknown: true,  // don't reject extra fields
        stripUnknown: true,  // remove unknown fields from value
      });

      if (error) {
        const details = error.details.map((detail) => ({
          field:   detail.path.join("."),
          message: detail.message,
        }));
        throw APIError.validation("Request body validation failed", details);
      }

      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validate req.query against a Joi schema
 */
const validateQueryParams = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        const details = error.details.map((detail) => ({
          field:   detail.path.join("."),
          message: detail.message,
        }));
        throw APIError.validation("Query parameter validation failed", details);
      }

      req.query = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validate req.params against a Joi schema
 * (Fixed typo from original: validateURlParams → validateUrlParams)
 */
const validateUrlParams = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
      });

      if (error) {
        const details = error.details.map((detail) => ({
          field:   detail.path.join("."),
          message: detail.message,
        }));
        throw APIError.validation("URL parameter validation failed", details);
      }

      req.params = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validate a file upload field
 * @param {string}   fieldName    - req.files key to check
 * @param {string[]} allowedTypes - MIME types e.g. ["image/jpeg", "image/png"]
 * @param {number}   maxSize      - bytes
 * @param {boolean}  required     - default true; set false for optional files
 */
const validateFileUpload = (fieldName, allowedTypes, maxSize, required = true) => {
  return (req, res, next) => {
    try {
      const file = req.files?.[fieldName];

      if (!file) {
        if (required) {
          throw APIError.validation(`${fieldName} file is required`);
        }
        return next(); // optional and not provided — skip
      }

      if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        throw APIError.validation(
          `Invalid file type for ${fieldName}. Allowed: ${allowedTypes.join(", ")}`
        );
      }

      if (maxSize && file.size > maxSize) {
        throw APIError.validation(
          `${fieldName} exceeds max size of ${(maxSize / (1024 * 1024)).toFixed(0)}MB`
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Rate limit by user (in-memory, simple)
 * For production use express-rate-limit or Redis instead
 */
const userRateLimit = (maxRequests, windowMs) => {
  const requests = new Map();

  return (req, res, next) => {
    try {
      const key       = req.user?.id || req.ip;
      const now       = Date.now();
      const userEntry = requests.get(key) || { count: 0, resetAt: now + windowMs };

      if (now > userEntry.resetAt) {
        userEntry.count   = 0;
        userEntry.resetAt = now + windowMs;
      }

      userEntry.count++;
      requests.set(key, userEntry);

      if (userEntry.count > maxRequests) {
        throw APIError.create(
          429,
          "Too many requests. Please slow down.",
          "RateLimitError"
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  validateRequestBody,
  validateQueryParams,
  validateUrlParams,
  // keep old typo export for backward compatibility
  validateURlParams: validateUrlParams,
  validateFileUpload,
  userRateLimit,
};