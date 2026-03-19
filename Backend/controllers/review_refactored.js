/**
 * Review Controller
 * Handles review routes and delegates to review service
 */

const {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  replyToReview,
} = require("../services/review.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../constants");
const {
  validateRequired,
  validatePagination,
  validateRating,
} = require("../utils/validators");

/**
 * Create course review (Student only — must be enrolled)
 */
exports.createReview = asyncHandler(async (req, res) => {
  const userId   = req.user.id;
  const courseId = req.body.courseId;

  validateRequired(courseId, "Course ID");
  validateRequired(req.body.rating, "Rating");
  validateRequired(req.body.review, "Review");
  validateRating(req.body.rating);

  const result = await createReview(userId, courseId, {
    rating: req.body.rating,
    review: req.body.review,
  });

  res
    .status(HTTP_STATUS.CREATED)
    .json(APIResponse.created(result.review, result.message));
});

/**
 * Get all reviews for a course (public)
 */
exports.getCourseReviews = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId;
  const { page, limit } = validatePagination(req.query.page, req.query.limit);

  validateRequired(courseId, "Course ID");

  const result = await getCourseReviews(courseId, page, limit);

  res
    .status(HTTP_STATUS.OK)
    .json(
      APIResponse.paginated(
        result.data,
        result.pagination.total,
        page,
        limit,
        "Course reviews retrieved"
      )
    );
});

/**
 * Update own review
 */
exports.updateReview = asyncHandler(async (req, res) => {
  const userId   = req.user.id;
  const reviewId = req.params.reviewId;

  validateRequired(reviewId, "Review ID");

  const result = await updateReview(reviewId, userId, {
    rating: req.body.rating,
    review: req.body.review,
  });

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.review, result.message));
});

/**
 * Delete own review
 */
exports.deleteReview = asyncHandler(async (req, res) => {
  const userId   = req.user.id;
  const reviewId = req.params.reviewId;

  validateRequired(reviewId, "Review ID");

  const result = await deleteReview(reviewId, userId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(null, result.message));
});

/**
 * Instructor reply to a review on their course
 */
exports.replyToReview = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const reviewId     = req.params.reviewId;

  validateRequired(reviewId, "Review ID");
  validateRequired(req.body.text, "Reply text");

  const result = await replyToReview(reviewId, instructorId, req.body.text);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.review, result.message));
});