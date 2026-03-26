/**
 * Coupon Service
 * Admin creates coupons; students validate them at checkout
 */

const Coupon = require("../models/Coupon");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");

// ─── createCoupon ────────────────────────────────────────────────────────────

const createCoupon = async (adminId, couponData) => {
  const {
    code,
    discountType,
    discountValue,
    maxDiscountAmount,
    minOrderAmount,
    applicableCourses,
    applicableCategories,
    usageLimit,
    usagePerUser,
    validFrom,
    validUntil,
  } = couponData;

  if (!["Percentage", "Flat"].includes(discountType)) {
    throw APIError.validation("Discount type must be 'Percentage' or 'Flat'");
  }

  if (discountType === "Percentage" && (discountValue < 1 || discountValue > 100)) {
    throw APIError.validation("Percentage discount must be between 1 and 100");
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    throw APIError.conflict("Coupon code already exists");
  }

  const coupon = await Coupon.create({
    code:                code.toUpperCase().trim(),
    discountType,
    discountValue:       Number(discountValue),
    maxDiscountAmount:   maxDiscountAmount  ? Number(maxDiscountAmount)  : null,
    minOrderAmount:      minOrderAmount     ? Number(minOrderAmount)     : 0,
    applicableCourses:   applicableCourses  || [],
    applicableCategories: applicableCategories || [],
    usageLimit:          usageLimit         ? Number(usageLimit)         : 0,
    usagePerUser:        usagePerUser       ? Number(usagePerUser)       : 1,
    validFrom:           validFrom          ? new Date(validFrom)        : new Date(),
    validUntil:          new Date(validUntil),
    isActive:            true,
    createdBy:           adminId,
  });

  logger.info("Coupon created", { code: coupon.code, adminId });

  return { success: true, message: "Coupon created successfully", coupon };
};

// ─── validateCoupon ──────────────────────────────────────────────────────────

const validateCoupon = async (userId, code, courseIds = [], totalAmount) => {
  const coupon = await Coupon.findOne({
    code:       code.toUpperCase(),
    isActive:   true,
    validFrom:  { $lte: new Date() },
    validUntil: { $gte: new Date() },
  });

  if (!coupon) {
    throw APIError.validation("Invalid or expired coupon code");
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw APIError.validation("This coupon has reached its usage limit");
  }

  if (coupon.usagePerUser > 0) {
    const timesUsed = coupon.usedBy.filter(
      (id) => id.toString() === userId.toString()
    ).length;
    if (timesUsed >= coupon.usagePerUser) {
      throw APIError.validation("You have already used this coupon");
    }
  }

  if (Number(totalAmount) < coupon.minOrderAmount) {
    throw APIError.validation(
      `Minimum order amount ₹${coupon.minOrderAmount} required for this coupon`
    );
  }

  // Scope check (if restricted to specific courses or categories)
  if (
    coupon.applicableCourses.length > 0 &&
    courseIds.length > 0
  ) {
    const valid = courseIds.every((id) =>
      coupon.applicableCourses.some((c) => c.toString() === id.toString())
    );
    if (!valid) {
      throw APIError.validation("Coupon is not applicable to one or more selected courses");
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "Percentage") {
    discountAmount = (Number(totalAmount) * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  const finalAmount = Math.max(0, Number(totalAmount) - discountAmount);

  return {
    success:        true,
    code:           coupon.code,
    discountType:   coupon.discountType,
    discountValue:  coupon.discountValue,
    discountAmount: Math.round(discountAmount * 100) / 100,
    originalAmount: Number(totalAmount),
    finalAmount:    Math.round(finalAmount * 100) / 100,
  };
};

// ─── getAllCoupons ────────────────────────────────────────────────────────────

const getAllCoupons = async () => {
  const coupons = await Coupon.find().sort("-createdAt").lean();
  return { success: true, coupons };
};

// ─── deleteCoupon ────────────────────────────────────────────────────────────

const deleteCoupon = async (couponId) => {
  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) {
    throw APIError.notFound("Coupon");
  }

  logger.info("Coupon deleted", { couponId });

  return { success: true, message: "Coupon deleted successfully" };
};

module.exports = {
  createCoupon,
  validateCoupon,
  getAllCoupons,
  deleteCoupon,
};