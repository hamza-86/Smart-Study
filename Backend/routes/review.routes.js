const express = require("express");
const router = express.Router();

const {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

const { auth, isStudent } = require("../middlewares/auth");

// ================= REVIEW ROUTES =================
router.post("/createReview", auth, isStudent, createReview);
router.get("/getCourseReviews/:courseId", getCourseReviews);
router.put("/updateReview/:reviewId", auth, isStudent, updateReview);
router.delete("/deleteReview/:reviewId", auth, isStudent, deleteReview);

module.exports = router;
