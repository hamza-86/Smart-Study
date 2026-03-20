/**
 * Payment Controller
 * Handles payment routes and delegates to payment service
 */

const {
  createPaymentOrder,
  verifyPayment,
  getEnrolledCourses,
  enrollFreeCourse,
} = require("../services/payment.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const APIError = require("../utils/apiError");
const { HTTP_STATUS } = require("../constants");
const { validateRequired, validateArray } = require("../utils/validators");

/**
 * Initiate course payment
 */
exports.capturePayment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { courseIds, courses, couponCode } = req.body;
  const normalizedCourseIds = Array.isArray(courseIds)
    ? courseIds
    : Array.isArray(courses)
    ? courses
    : null;

  validateRequired(normalizedCourseIds, "Course IDs");
  validateArray(normalizedCourseIds, "courseIds");

  const result = await createPaymentOrder(userId, normalizedCourseIds, couponCode || null);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, "Payment order created"));
});

/**
 * Verify and process payment
 */
exports.verifyPayment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
    paymentId,
    signature,
    courseIds,
    courses,
  } = req.body;

  const normalizedOrderId = razorpay_order_id || orderId;
  const normalizedPaymentId = razorpay_payment_id || paymentId;
  const normalizedSignature = razorpay_signature || signature;
  const normalizedCourseIds = Array.isArray(courseIds)
    ? courseIds
    : Array.isArray(courses)
    ? courses
    : null;

  validateRequired(normalizedOrderId, "Order ID");
  validateRequired(normalizedPaymentId, "Payment ID");
  validateRequired(normalizedSignature, "Signature");
  validateRequired(normalizedCourseIds, "Course IDs");
  validateArray(normalizedCourseIds, "courseIds");

  await verifyPayment({
    razorpay_order_id: normalizedOrderId,
    razorpay_payment_id: normalizedPaymentId,
    razorpay_signature: normalizedSignature,
    courseIds: normalizedCourseIds,
    userId,
  });

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(null, "Payment verified and courses enrolled"));
});

/**
 * Get enrolled courses
 */
exports.getEnrolledCourses = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const result = await getEnrolledCourses(userId, page, limit);

  res
    .status(HTTP_STATUS.OK)
    .json(
      APIResponse.paginated(
        result.data,
        result.pagination.total,
        page,
        limit,
        "Enrolled courses retrieved"
      )
    );
});

exports.enrollFreeCourse = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;

  validateRequired(courseId, "Course ID");

  const result = await enrollFreeCourse(userId, courseId);
  res.status(HTTP_STATUS.OK).json(APIResponse.success(result, result.message));
});
