const express = require("express");
const router = express.Router();

const {
  getStudentDashboard,
  getNotifications,
  markNotificationsRead,
  getCertificates,
} = require("../controllers/Student.controller");

const { auth, isStudent } = require("../middlewares/auth");

// All routes require Student role
router.use(auth, isStudent);

// ── Student Dashboard ───────────────────────────────────────────────────
// Full dashboard: enrolled courses + progress + quiz stats + streak + recent activity
router.get("/dashboard", getStudentDashboard);

// Notifications
router.get("/notifications", getNotifications);
router.put("/notifications/read", markNotificationsRead);

// Certificates earned
router.get("/certificates", getCertificates);

module.exports = router;