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
  const { courseIds } = req.body;

  validateRequired(courseIds, "Course IDs");
  validateArray(courseIds, "courseIds");

  const result = await createPaymentOrder(userId, courseIds);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, "Payment order created"));
});

/**
 * Verify and process payment
 */
exports.verifyPayment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseIds } =
    req.body;

  validateRequired(razorpay_order_id, "Order ID");
  validateRequired(razorpay_payment_id, "Payment ID");
  validateRequired(razorpay_signature, "Signature");
  validateRequired(courseIds, "Course IDs");
  validateArray(courseIds, "courseIds");

  await verifyPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courseIds,
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
