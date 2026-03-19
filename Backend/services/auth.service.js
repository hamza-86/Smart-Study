/**
 * Authentication Service
 * Handles all auth-related business logic
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const otpGenerator = require("otp-generator");
const User = require("../models/User");
const OTP = require("../models/OTP");
const mailSender = require("../utils/mailSender");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");
const { TOKEN_EXPIRY, ACCOUNT_TYPES } = require("../constants");

// ─── Token helpers ──────────────────────────────────────────────────────────

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, accountType: user.accountType },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN || "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY.REFRESH_TOKEN || "7d" }
  );

// ─── sendOTP ────────────────────────────────────────────────────────────────

const sendOTP = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw APIError.conflict("Email already registered");
  }

  // Delete any previous OTP for this email
  await OTP.deleteMany({ email: normalizedEmail });

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  await OTP.create({
    email: normalizedEmail,
    otp,
    createdAt: new Date(),
    // TTL index handles expiry; also store explicit field for manual check
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await mailSender(
    normalizedEmail,
    "Email Verification OTP — EduFlow",
    `<p>Your OTP for EduFlow registration is: <strong>${otp}</strong></p>
     <p>This OTP expires in 10 minutes.</p>`
  );

  logger.info("OTP sent", { email: normalizedEmail });

  return { success: true };
};

// ─── signup ─────────────────────────────────────────────────────────────────

const signup = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    accountType,
    otp,
  } = userData;

  if (password !== confirmPassword) {
    throw APIError.validation("Passwords do not match");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw APIError.conflict("User already exists");
  }

  // Verify OTP (latest one for this email)
  const recentOTP = await OTP.findOne({ email: normalizedEmail }).sort({
    createdAt: -1,
  });

  if (!recentOTP) {
    throw APIError.validation("OTP not found. Please request a new OTP");
  }
  if (recentOTP.otp !== otp) {
    throw APIError.validation("Invalid OTP");
  }
  if (recentOTP.expiresAt && recentOTP.expiresAt < new Date()) {
    throw APIError.validation("OTP has expired");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const validAccountType = Object.values(ACCOUNT_TYPES).includes(accountType)
    ? accountType
    : ACCOUNT_TYPES.STUDENT;

  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    accountType: validAccountType,
    isVerified: true,
    isActive: true,
    lastLogin: new Date(),
  });

  await OTP.deleteMany({ email: normalizedEmail });

  // Welcome email
  await mailSender(
    normalizedEmail,
    "Welcome to EduFlow!",
    `<p>Hi ${user.firstName}, welcome to EduFlow! Start learning today.</p>`
  );

  logger.info("User registered", { userId: user._id, email: normalizedEmail });

  return {
    success: true,
    message: "User registered successfully",
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,           // virtual
      email: user.email,
      accountType: user.accountType,
      avatar: user.avatar,
    },
  };
};

// ─── login ──────────────────────────────────────────────────────────────────

const login = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password"
  );

  if (!user) {
    throw APIError.authentication("Invalid email or password");
  }

  if (!user.isActive) {
    throw APIError.authorization("Your account has been deactivated");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw APIError.authentication("Invalid email or password");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  logger.info("User logged in", { userId: user._id });

  return {
    success: true,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken,
  };
};

// ─── refreshAccessToken ─────────────────────────────────────────────────────

const refreshAccessToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch {
    throw APIError.authentication("Invalid or expired refresh token");
  }

  // Fetch fresh user (ensures isActive / accountType are current)
  const user = await User.findById(decoded.id);
  if (!user) {
    throw APIError.authentication("User not found");
  }
  if (!user.isActive) {
    throw APIError.authorization("Account is deactivated");
  }

  const newAccessToken = generateAccessToken(user);

  return { success: true, accessToken: newAccessToken };
};

// ─── forgotPassword ─────────────────────────────────────────────────────────

const forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  // Always return success to prevent user enumeration
  if (!user) {
    logger.info("Forgot password: email not found (silent)", {
      email: normalizedEmail,
    });
    return { success: true };
  }

  // Generate a secure random token
  const rawToken   = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.resetPasswordToken  = hashedToken;
  user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await user.save({ validateBeforeSave: false });

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  await mailSender(
    normalizedEmail,
    "Password Reset — EduFlow",
    `<p>Hi ${user.firstName},</p>
     <p>Click the link below to reset your password. It expires in 15 minutes.</p>
     <a href="${resetLink}">${resetLink}</a>
     <p>If you didn't request this, ignore this email.</p>`
  );

  logger.info("Reset link sent", { userId: user._id });

  return { success: true };
};

// ─── resetPassword ──────────────────────────────────────────────────────────

const resetPassword = async (rawToken, newPassword, confirmPassword) => {
  if (newPassword !== confirmPassword) {
    throw APIError.validation("Passwords do not match");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpiry: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpiry");

  if (!user) {
    throw APIError.validation("Reset token is invalid or has expired");
  }

  user.password            = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  logger.info("Password reset successful", { userId: user._id });

  return { success: true, message: "Password reset successful" };
};

// ─── changePassword ─────────────────────────────────────────────────────────

const changePassword = async (userId, oldPassword, newPassword, confirmPassword) => {
  if (newPassword !== confirmPassword) {
    throw APIError.validation("Passwords do not match");
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw APIError.notFound("User");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw APIError.authentication("Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  logger.info("Password changed", { userId });

  return { success: true, message: "Password changed successfully" };
};

module.exports = {
  sendOTP,
  signup,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  changePassword,
  generateAccessToken,
  generateRefreshToken,
};