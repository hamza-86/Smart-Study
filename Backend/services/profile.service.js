/**
 * Profile Service
 * Handles all profile-related business logic
 */

const bcrypt = require("bcrypt");
const User = require("../models/User");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");
const { validatePassword, validatePhone } = require("../utils/validators");

// ─── getUserProfile ─────────────────────────────────────────────────────────

const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -resetPasswordToken -resetPasswordExpiry -avatarPublicId")
    .populate("courses", "title thumbnail averageRating totalStudents status")
    .populate("courseProgress")
    .lean();

  if (!user) {
    throw APIError.notFound("User");
  }

  return { success: true, data: user };
};

// ─── updateProfile ──────────────────────────────────────────────────────────

const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw APIError.notFound("User");
  }

  // ── Common fields ──────────────────────────────────────────
  if (updateData.firstName !== undefined) {
    if (!updateData.firstName.trim()) {
      throw APIError.validation("First name cannot be empty");
    }
    user.firstName = updateData.firstName.trim();
  }

  if (updateData.lastName !== undefined) {
    if (!updateData.lastName.trim()) {
      throw APIError.validation("Last name cannot be empty");
    }
    user.lastName = updateData.lastName.trim();
  }

  if (updateData.phone !== undefined) {
    if (updateData.phone && !/^\+?[\d\s\-()]{7,15}$/.test(updateData.phone)) {
      throw APIError.validation("Invalid phone number");
    }
    user.phone = updateData.phone.trim();
  }

  if (updateData.bio !== undefined) {
    if (updateData.bio.length > 1000) {
      throw APIError.validation("Bio must be less than 1000 characters");
    }
    user.bio = updateData.bio.trim();
  }

  if (updateData.dateOfBirth !== undefined) {
    user.dateOfBirth = updateData.dateOfBirth;
  }

  if (updateData.gender !== undefined) {
    const allowed = ["Male", "Female", "Other", "Prefer not to say"];
    if (!allowed.includes(updateData.gender)) {
      throw APIError.validation(`Gender must be one of: ${allowed.join(", ")}`);
    }
    user.gender = updateData.gender;
  }

  // ── Instructor-only fields ─────────────────────────────────
  if (user.accountType === "Instructor") {
    if (updateData.headline !== undefined) {
      if (updateData.headline.length > 200) {
        throw APIError.validation("Headline must be under 200 characters");
      }
      user.headline = updateData.headline.trim();
    }
    if (updateData.website  !== undefined) user.website  = updateData.website.trim();
    if (updateData.twitter  !== undefined) user.twitter  = updateData.twitter.trim();
    if (updateData.linkedin !== undefined) user.linkedin = updateData.linkedin.trim();
    if (updateData.youtube  !== undefined) user.youtube  = updateData.youtube.trim();
  }

  await user.save();

  logger.info("Profile updated", { userId });

  // Return without sensitive fields
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpiry;
  delete userObj.avatarPublicId;

  return {
    success: true,
    message: "Profile updated successfully",
    user: userObj,
  };
};

// ─── uploadProfileImage ─────────────────────────────────────────────────────

const uploadProfileImage = async (userId, imageFile) => {
  if (!imageFile) {
    throw APIError.validation("Image file is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw APIError.notFound("User");
  }

  // Delete old avatar from Cloudinary if it exists
  if (user.avatarPublicId) {
    try {
      const cloudinary = require("cloudinary").v2;
      await cloudinary.uploader.destroy(user.avatarPublicId);
    } catch (err) {
      logger.warn("Could not delete old avatar from Cloudinary", {
        userId,
        publicId: user.avatarPublicId,
      });
    }
  }

  const uploaded = await uploadImageToCloudinary(
    imageFile,
    `${process.env.FOLDER_NAME || "EduFlow"}/avatars`,
    400, // width
    400  // height — square crop
  );

  user.avatar          = uploaded.secure_url;
  user.avatarPublicId  = uploaded.public_id;
  await user.save();

  logger.info("Avatar uploaded", { userId });

  return {
    success: true,
    message: "Profile image updated successfully",
    avatar: user.avatar,
  };
};

// ─── changePassword ─────────────────────────────────────────────────────────

const changePassword = async (userId, oldPassword, newPassword, confirmPassword) => {
  if (newPassword !== confirmPassword) {
    throw APIError.validation("New passwords do not match");
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

  logger.info("Password changed via profile", { userId });

  return { success: true, message: "Password changed successfully" };
};

// ─── getWishlist ─────────────────────────────────────────────────────────────

const getWishlist = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: "wishlist",
      select:
        "title thumbnail price discountedPrice instructor averageRating totalStudents level language status",
      populate: { path: "instructor", select: "firstName lastName avatar headline" },
    })
    .lean();

  if (!user) {
    throw APIError.notFound("User");
  }

  return { success: true, wishlist: user.wishlist || [] };
};

// ─── toggleWishlist ──────────────────────────────────────────────────────────

const toggleWishlist = async (userId, courseId) => {
  const user = await User.findById(userId).select("wishlist");
  if (!user) {
    throw APIError.notFound("User");
  }

  const course = await Course.findById(courseId).select("_id title");
  if (!course) {
    throw APIError.notFound("Course");
  }

  const isWishlisted = user.wishlist.some(
    (id) => id.toString() === courseId.toString()
  );

  if (isWishlisted) {
    user.wishlist.pull(courseId);
  } else {
    user.wishlist.push(courseId);
  }

  await user.save();

  return {
    success: true,
    wishlisted: !isWishlisted,
    message: isWishlisted
      ? "Removed from wishlist"
      : "Added to wishlist",
  };
};

module.exports = {
  getUserProfile,
  updateProfile,
  uploadProfileImage,
  changePassword,
  getWishlist,
  toggleWishlist,
};