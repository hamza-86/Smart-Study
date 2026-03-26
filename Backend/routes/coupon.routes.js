const express = require("express");
const router = express.Router();

const {
  createCoupon,
  validateCoupon,
  getAllCoupons,
  deleteCoupon,
} = require("../controllers/coupon.controller");

const { auth, isAdmin, isStudent } = require("../middlewares/auth");

// ── Admin: manage coupons ───────────────────────────────────────────────
router.post("/createCoupon", auth, isAdmin, createCoupon);
router.get("/getAllCoupons", auth, isAdmin, getAllCoupons);
router.delete("/deleteCoupon/:couponId", auth, isAdmin, deleteCoupon);

// ── Student: validate coupon at checkout ────────────────────────────────
router.post("/validateCoupon", auth, isStudent, validateCoupon);

module.exports = router;
