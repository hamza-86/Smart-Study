const express = require("express");
const router  = express.Router();

const {
  updateCourseProgress,
  updateWatchTime,
  getCourseProgress,
  getResumeInfo,
  getAllProgress,
} = require("../controllers/courseProgress.controller");

const { auth, isStudent } = require("../middlewares/auth");

// ── Progress (student only) ─────────────────────────────────────────────

// Mark a video as complete
router.post  ("/updateCourseProgress",             auth, isStudent, updateCourseProgress);

// Called periodically while video plays — tracks seconds watched + last position
router.post  ("/updateWatchTime",                  auth, isStudent, updateWatchTime);

// Get progress for one course
router.get   ("/getCourseProgress/:courseId",      auth, isStudent, getCourseProgress);

// Get resume position (last video + timestamp)
router.get   ("/getResumeInfo/:courseId",           auth, isStudent, getResumeInfo);

// Get progress for all enrolled courses (for student dashboard)
router.get   ("/getAllProgress",                    auth, isStudent, getAllProgress);

module.exports = router;