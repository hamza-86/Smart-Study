const express = require("express");
const router = express.Router();

const {
  capturePayment,
  verifyPayment,
  getEnrolledCourses,
} = require("../controllers/payment.controller");

const { auth, isStudent } = require("../middlewares/auth");

// ================= PAYMENT ROUTES =================
router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifyPayment", auth, isStudent, verifyPayment);
router.get("/getEnrolledCourses", auth, isStudent, getEnrolledCourses);

module.exports = router;
