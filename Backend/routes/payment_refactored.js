const express = require("express");
const router  = express.Router();

const {
  capturePayment,
  verifyPayment,
  getEnrolledCourses,
  enrollFree,
} = require("../controllers/payments_refactored");

const { auth, isStudent } = require("../middlewares/auth");

// ── Payment ─────────────────────────────────────────────────────────────
// Initiate Razorpay order
router.post("/capturePayment",      auth, isStudent, capturePayment);
// Verify signature and enroll
router.post("/verifyPayment",       auth, isStudent, verifyPayment);
// Enroll in a free course instantly
router.post("/enrollFree",          auth, isStudent, enrollFree);
// Get all enrolled courses
router.get("/getEnrolledCourses",   auth, isStudent, getEnrolledCourses);

module.exports = router;
