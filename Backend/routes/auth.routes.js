const express = require("express");
const router  = express.Router();

const {
  sendotp,
  signup,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/auth.controller");

const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getWishlist,
  toggleWishlist,
} = require("../controllers/profile.controller");

const { auth } = require("../middlewares/auth");

// ── OTP & Auth ──────────────────────────────────────────────────────────
router.post("/sendotp",                       sendotp);
router.post("/signup",                        signup);
router.post("/login",                         login);
router.post("/logout",           auth,        logout);
router.post("/refresh-token",                 refreshToken);

// ── Password ────────────────────────────────────────────────────────────
router.post("/forgot-password",               forgotPassword);
router.post("/reset-password/:token",         resetPassword);
router.put("/change-password",   auth,        changePassword);

// ── Profile ─────────────────────────────────────────────────────────────
router.get("/profile",           auth,        getProfile);
router.put("/profile",           auth,        updateProfile);
router.post("/upload-avatar",    auth,        uploadAvatar);

// ── Wishlist ────────────────────────────────────────────────────────────
router.get("/wishlist",          auth,        getWishlist);
router.post("/wishlist/:courseId", auth,      toggleWishlist);

module.exports = router;