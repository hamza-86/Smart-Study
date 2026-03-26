/**
 * Coupon Controller
 * Admin creates coupons; students validate them at checkout
 */

const {
  createCoupon,
  validateCoupon,
  getAllCoupons,
  deleteCoupon,
} = require("../services/coupon.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../constants");
const { validateRequired } = require("../utils/validators");

/**
 * Create coupon (Admin only)
 */
exports.createCoupon = asyncHandler(async (req, res) => {
  validateRequired(req.body.code, "Coupon code");
  validateRequired(req.body.discountType, "Discount type");
  validateRequired(req.body.discountValue, "Discount value");
  validateRequired(req.body.validUntil, "Valid until date");

  const result = await createCoupon(req.user.id, req.body);

  res
    .status(HTTP_STATUS.CREATED)
    .json(APIResponse.created(result.coupon, result.message));
});

/**
 * Validate coupon at checkout (Student)
 * Body: code, courseIds[], totalAmount
 */
exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, courseIds, totalAmount } = req.body;

  validateRequired(code, "Coupon code");
  validateRequired(totalAmount, "Total amount");

  const result = await validateCoupon(req.user.id, code, courseIds, totalAmount);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, "Coupon applied successfully"));
});

/**
 * Get all coupons (Admin)
 */
exports.getAllCoupons = asyncHandler(async (req, res) => {
  const result = await getAllCoupons();

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.coupons, "Coupons retrieved"));
});

/**
 * Delete coupon (Admin)
 */
exports.deleteCoupon = asyncHandler(async (req, res) => {
  validateRequired(req.params.couponId, "Coupon ID");

  const result = await deleteCoupon(req.params.couponId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(null, result.message));
});