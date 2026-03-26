const express = require("express");
const router = express.Router();

const { login, signup, sendotp, logout, refreshToken, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
} = require("../controllers/profile.controller");
const { auth, isStudent, isInstructor } = require("../middlewares/auth");

// ================= AUTH ROUTES =================
router.post("/sendotp", sendotp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", auth, logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ================= PROFILE ROUTES =================
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);
router.post("/upload-avatar", auth, uploadAvatar);

module.exports = router;
