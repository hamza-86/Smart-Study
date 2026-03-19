const {
  sendOTP,
  signup,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../services/auth.service");

const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const APIError = require("../utils/apiError");
const {
  validateEmail,
  validatePassword,
  validateRequired,
  validateOTP,
} = require("../utils/validators");
const { HTTP_STATUS } = require("../constants");

exports.sendotp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  validateRequired(email, "Email");
  validateEmail(email);

  const result = await sendOTP(email);
  res.status(HTTP_STATUS.OK).json(APIResponse.success(result, "OTP sent to email"));
});

exports.signup = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    accountType,
    otp,
  } = req.body;

  validateRequired(firstName, "First name");
  validateRequired(lastName, "Last name");
  validateRequired(email, "Email");
  validateRequired(password, "Password");
  validateRequired(confirmPassword, "Confirm Password");
  validateRequired(otp, "OTP");

  validateEmail(email);
  validatePassword(password);
  validateOTP(otp);

  const result = await signup({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    accountType,
    otp,
  });

  res.status(HTTP_STATUS.CREATED).json(APIResponse.created(result.user, result.message));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  validateRequired(email, "Email");
  validateRequired(password, "Password");
  validateEmail(email);

  const result = await login(email, password);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(HTTP_STATUS.OK).json(APIResponse.success(result, "Login successful"));
});

exports.logout = asyncHandler(async (_req, res) => {
  res.clearCookie("refreshToken");
  res.status(HTTP_STATUS.OK).json(APIResponse.success(null, "Logout successful"));
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw APIError.authentication("Refresh token not found");
  }

  const result = await refreshAccessToken(refreshToken);
  res.status(HTTP_STATUS.OK).json(APIResponse.success(result, "Token refreshed"));
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  validateRequired(email, "Email");
  validateEmail(email);

  const result = await forgotPassword(email);
  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, "If that email exists, an OTP has been sent"));
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  validateRequired(email, "Email");
  validateRequired(otp, "OTP");
  validateRequired(newPassword, "New Password");
  validateRequired(confirmPassword, "Confirm Password");

  validateEmail(email);
  validateOTP(otp);
  validatePassword(newPassword);

  const result = await resetPassword({ email, otp, newPassword, confirmPassword });
  res.status(HTTP_STATUS.OK).json(APIResponse.success(result, "Password reset successful"));
});

exports.changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  validateRequired(oldPassword, "Old password");
  validateRequired(newPassword, "New password");
  validateRequired(confirmNewPassword, "Confirm new password");
  validatePassword(newPassword);

  const result = await changePassword(
    userId,
    oldPassword,
    newPassword,
    confirmNewPassword
  );

  res.status(HTTP_STATUS.OK).json(APIResponse.success(result, result.message));
});
