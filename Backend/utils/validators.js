/**
 * Input Validation Utilities
 */

const { REGEX_PATTERNS } = require("../constants");
const APIError = require("./apiError");

// ── Email ─────────────────────────────────────────────────────────────────────

const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    throw APIError.validation("Email is required and must be a string");
  }

  const normalized = email.toLowerCase().trim();

  if (!REGEX_PATTERNS.EMAIL.test(normalized)) {
    throw APIError.validation("Invalid email format");
  }

  return normalized;
};

// ── Password ──────────────────────────────────────────────────────────────────

const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    throw APIError.validation("Password is required and must be a string");
  }

  if (password.length < 8) {
    throw APIError.validation("Password must be at least 8 characters long");
  }

  if (!REGEX_PATTERNS.PASSWORD.test(password)) {
    throw APIError.validation(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
  }

  return password;
};

// ── Name (generic single field) ───────────────────────────────────────────────

const validateName = (name) => {
  if (!name || typeof name !== "string") {
    throw APIError.validation("Name is required and must be a string");
  }

  const trimmed = name.trim();

  if (trimmed.length < 2 || trimmed.length > 50) {
    throw APIError.validation("Name must be between 2 and 50 characters");
  }

  return trimmed;
};

/** Alias for first name */
const validateFirstName = (firstName) => {
  if (!firstName || typeof firstName !== "string") {
    throw APIError.validation("First name is required");
  }
  const trimmed = firstName.trim();
  if (trimmed.length < 2 || trimmed.length > 50) {
    throw APIError.validation("First name must be between 2 and 50 characters");
  }
  return trimmed;
};

/** Alias for last name */
const validateLastName = (lastName) => {
  if (!lastName || typeof lastName !== "string") {
    throw APIError.validation("Last name is required");
  }
  const trimmed = lastName.trim();
  if (trimmed.length < 1 || trimmed.length > 50) {
    throw APIError.validation("Last name must be between 1 and 50 characters");
  }
  return trimmed;
};

// ── Phone ─────────────────────────────────────────────────────────────────────

const validatePhone = (phone) => {
  if (!phone) return null;

  if (typeof phone !== "string") {
    throw APIError.validation("Phone must be a string");
  }

  const clean = phone.replace(/\D/g, "");

  if (!REGEX_PATTERNS.PHONE.test(clean)) {
    throw APIError.validation(
      "Invalid phone number — must be 7 to 15 digits"
    );
  }

  return clean;
};

// ── URL ───────────────────────────────────────────────────────────────────────

const validateURL = (url) => {
  if (!url || typeof url !== "string") {
    throw APIError.validation("URL is required and must be a string");
  }

  if (!REGEX_PATTERNS.URL.test(url)) {
    throw APIError.validation("Invalid URL format — must start with http:// or https://");
  }

  return url;
};

// ── OTP ───────────────────────────────────────────────────────────────────────

const validateOTP = (otp) => {
  if (!otp) {
    throw APIError.validation("OTP is required");
  }

  // Accept number or string
  const otpStr = String(otp).trim();

  if (!/^\d{6}$/.test(otpStr)) {
    throw APIError.validation("OTP must be exactly 6 digits");
  }

  return otpStr;
};

// ── ObjectId ──────────────────────────────────────────────────────────────────

const validateObjectId = (id, fieldName = "ID") => {
  if (!id) {
    throw APIError.validation(`${fieldName} is required`);
  }

  if (!REGEX_PATTERNS.MONGO_ID.test(String(id))) {
    throw APIError.validation(`Invalid ${fieldName} format`);
  }

  return String(id);
};

// ── Pagination ────────────────────────────────────────────────────────────────

const validatePagination = (page, limit) => {
  let pageNum  = parseInt(page)  || 1;
  let limitNum = parseInt(limit) || 10;

  if (pageNum  < 1)   pageNum  = 1;
  if (limitNum < 1)   limitNum = 10;
  if (limitNum > 100) limitNum = 100; // hard cap

  return { page: pageNum, limit: limitNum };
};

// ── Price ─────────────────────────────────────────────────────────────────────

const validatePrice = (price) => {
  const priceNum = parseFloat(price);

  if (isNaN(priceNum) || priceNum < 0) {
    throw APIError.validation("Price must be a non-negative number");
  }

  return priceNum;
};

// ── Rating ────────────────────────────────────────────────────────────────────

const validateRating = (rating) => {
  const ratingNum = parseFloat(rating);

  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw APIError.validation("Rating must be between 1 and 5");
  }

  return ratingNum;
};

// ── Required ──────────────────────────────────────────────────────────────────

const validateRequired = (value, fieldName) => {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && !value.trim()) ||
    (Array.isArray(value) && value.length === 0)
  ) {
    throw APIError.validation(`${fieldName} is required`);
  }

  return value;
};

// ── String length ─────────────────────────────────────────────────────────────

const validateStringLength = (value, fieldName, minLength, maxLength) => {
  if (typeof value !== "string") {
    throw APIError.validation(`${fieldName} must be a string`);
  }

  const len = value.trim().length;

  if (len < minLength || len > maxLength) {
    throw APIError.validation(
      `${fieldName} must be between ${minLength} and ${maxLength} characters`
    );
  }

  return value.trim();
};

// ── Array ─────────────────────────────────────────────────────────────────────

const validateArray = (value, fieldName) => {
  if (!Array.isArray(value)) {
    throw APIError.validation(`${fieldName} must be an array`);
  }

  if (value.length === 0) {
    throw APIError.validation(`${fieldName} cannot be empty`);
  }

  return value;
};

// ── Enum ──────────────────────────────────────────────────────────────────────

const validateEnum = (value, fieldName, allowedValues) => {
  if (!allowedValues.includes(value)) {
    throw APIError.validation(
      `${fieldName} must be one of: ${allowedValues.join(", ")}`
    );
  }
  return value;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateFirstName,
  validateLastName,
  validatePhone,
  validateURL,
  validateOTP,
  validateObjectId,
  validatePagination,
  validatePrice,
  validateRating,
  validateRequired,
  validateStringLength,
  validateArray,
  validateEnum,
};