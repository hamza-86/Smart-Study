const express = require("express");
const router  = express.Router();

const {
  getDashboardStats,
  getStudents,
  getEarnings,
  getWatchAnalytics,
  getQuizAnalytics,
} = require("../controllers/instructor.controller");

const { auth, isInstructor } = require("../middlewares/auth");

// All routes require Instructor role
router.use(auth, isInstructor);

// ── Dashboard ───────────────────────────────────────────────────────────
// Main stats: total students, revenue, course count, recent enrollments, monthly chart
router.get("/dashboard",                    getDashboardStats);

// All students across instructor's courses (optional ?courseId filter)
router.get("/students",                     getStudents);

// Earnings history (optional ?status=Pending|Settled|Refunded)
router.get("/earnings",                     getEarnings);

// Watch analytics for a specific course
router.get("/watch-analytics/:courseId",    getWatchAnalytics);

// Quiz analytics: avg scores + pass rates across all courses
router.get("/quiz-analytics",               getQuizAnalytics);

module.exports = router;