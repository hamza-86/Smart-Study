/**
 * Profile Controller
 * Handles profile routes and delegates to profile service
 */

const {
  getUserProfile,
  updateProfile,
  uploadProfileImage,
  changePassword,
  getWishlist,
  toggleWishlist,
} = require("../services/profile.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const APIError = require("../utils/apiError");
const { HTTP_STATUS } = require("../constants");
const { validateRequired, validatePassword } = require("../utils/validators");

/**
 * Get user profile (works for both Student and Instructor)
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await getUserProfile(userId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.data, "Profile retrieved successfully"));
});

/**
 * Update user profile
 * Student fields:  firstName, lastName, phone, bio, dateOfBirth, gender
 * Instructor adds: headline, website, twitter, linkedin, youtube
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    firstName,
    lastName,
    phone,
    bio,
    dateOfBirth,
    gender,
    // Instructor specific
    headline,
    website,
    twitter,
    linkedin,
    youtube,
  } = req.body;

  const result = await updateProfile(userId, {
    firstName,
    lastName,
    phone,
    bio,
    dateOfBirth,
    gender,
    headline,
    website,
    twitter,
    linkedin,
    youtube,
  });

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.user, result.message));
});

/**
 * Upload profile avatar
 */
exports.uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  validateRequired(req.files?.avatar, "Avatar image");

  const result = await uploadProfileImage(userId, req.files.avatar);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.avatar, result.message));
});

/**
 * Change password (authenticated user)
 */
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

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, result.message));
});

/**
 * Get wishlist
 */
exports.getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await getWishlist(userId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.wishlist, "Wishlist retrieved"));
});

/**
 * Toggle course in wishlist (add if not present, remove if present)
 */
exports.toggleWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  validateRequired(courseId, "Course ID");

  const result = await toggleWishlist(userId, courseId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, result.message));
});