/**
 * Authentication Service
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

const OTP_EXPIRY_MS = TOKEN_EXPIRY.OTP_EXPIRY_MS || 10 * 60 * 1000;
const MAX_RESET_ATTEMPTS = Number(process.env.RESET_OTP_MAX_ATTEMPTS || 5);

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

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

const sendOTP = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw APIError.conflict("Email already registered");
  }

  await OTP.deleteMany({ email: normalizedEmail, purpose: "signup" });

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  await OTP.create({
    email: normalizedEmail,
    otp,
    purpose: "signup",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
  });

  await mailSender(
    normalizedEmail,
    "Email Verification OTP - SmartStudy",
    `<p>Your verification OTP is: <strong>${otp}</strong></p><p>This OTP expires in 10 minutes.</p>`
  );

  logger.info("Signup OTP sent", { email: normalizedEmail });
  return { success: true };
};

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

  const recentOTP = await OTP.findOne({ email: normalizedEmail, purpose: "signup" }).sort({
    createdAt: -1,
  });

  if (!recentOTP) {
    throw APIError.validation("OTP not found. Please request a new OTP");
  }
  if (recentOTP.otp !== String(otp)) {
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

  await OTP.deleteMany({ email: normalizedEmail, purpose: "signup" });

  await mailSender(
    normalizedEmail,
    "Welcome to SmartStudy",
    `<p>Hi ${user.firstName}, welcome to SmartStudy!</p>`
  );

  logger.info("User registered", { userId: user._id, email: normalizedEmail });

  return {
    success: true,
    message: "User registered successfully",
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      avatar: user.avatar,
    },
  };
};

const login = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

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

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken(user);
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

  const user = await User.findById(decoded.id);
  if (!user) {
    throw APIError.authentication("User not found");
  }
  if (!user.isActive) {
    throw APIError.authorization("Account is deactivated");
  }

  return { success: true, accessToken: generateAccessToken(user) };
};

const forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+passwordResetOtpAttempts +passwordResetOtpLastSentAt"
  );

  if (!user) {
    logger.info("Forgot password requested for unknown email", { email: normalizedEmail });
    return { success: true };
  }

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  user.passwordResetOtpHash = hashOtp(otp);
  user.passwordResetOtpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
  user.passwordResetOtpAttempts = 0;
  user.passwordResetOtpLastSentAt = new Date();

  await user.save({ validateBeforeSave: false });

  await mailSender(
    normalizedEmail,
    "SmartStudy Password Reset OTP",
    `<p>Your password reset OTP is: <strong>${otp}</strong></p><p>Expires in 10 minutes.</p>`
  );

  logger.info("Password reset OTP sent", { userId: user._id });
  return { success: true };
};

const resetPassword = async ({ email, otp, newPassword, confirmPassword }) => {
  if (newPassword !== confirmPassword) {
    throw APIError.validation("Passwords do not match");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password +passwordResetOtpHash +passwordResetOtpExpiry +passwordResetOtpAttempts"
  );

  if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiry) {
    throw APIError.validation("Reset request is invalid or expired");
  }

  if (user.passwordResetOtpExpiry < new Date()) {
    throw APIError.validation("OTP has expired. Please request a new one.");
  }

  if (user.passwordResetOtpAttempts >= MAX_RESET_ATTEMPTS) {
    throw APIError.rateLimit("Too many invalid OTP attempts. Please request a new OTP.");
  }

  const isOtpValid = hashOtp(otp) === user.passwordResetOtpHash;
  if (!isOtpValid) {
    user.passwordResetOtpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    throw APIError.authentication("Invalid OTP");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetOtpHash = undefined;
  user.passwordResetOtpExpiry = undefined;
  user.passwordResetOtpAttempts = 0;
  user.passwordResetOtpLastSentAt = undefined;

  await user.save({ validateBeforeSave: false });

  logger.info("Password reset successful", { userId: user._id });
  return { success: true, message: "Password reset successful" };
};

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
