const express = require("express");
const router  = express.Router();

const {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  replyToReview,
} = require("../controllers/review_refactored");

const { auth, isStudent, isInstructor } = require("../middlewares/auth");

// ── Reviews ─────────────────────────────────────────────────────────────
// Public: anyone can read reviews
router.get   ("/getCourseReviews/:courseId",           getCourseReviews);

// Student only: create, update, delete own review
router.post  ("/createReview",              auth, isStudent,    createReview);
router.put   ("/updateReview/:reviewId",    auth, isStudent,    updateReview);
router.delete("/deleteReview/:reviewId",    auth, isStudent,    deleteReview);

// Instructor only: reply to a review on their course
router.post  ("/replyToReview/:reviewId",   auth, isInstructor, replyToReview);

module.exports = router;
