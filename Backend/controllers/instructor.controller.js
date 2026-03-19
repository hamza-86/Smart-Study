/**
 * Instructor Dashboard Controller
 * Analytics, earnings, students, watch analytics — delegates to instructor service
 */

const {
  getDashboardStats,
  getStudents,
  getEarnings,
  getWatchAnalytics,
  getQuizAnalytics,
} = require("../services/instructor.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../constants");
const { validateRequired, validatePagination } = require("../utils/validators");

/**
 * Main dashboard — total students, revenue, course stats, recent enrollments, monthly chart
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;

  const result = await getDashboardStats(instructorId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, "Dashboard stats retrieved"));
});

/**
 * Get all students enrolled in instructor's courses
 * Query: courseId (optional filter)
 */
exports.getStudents = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const { courseId }  = req.query;
  const { page, limit } = validatePagination(req.query.page, req.query.limit);

  const result = await getStudents(instructorId, { courseId, page, limit });

  res
    .status(HTTP_STATUS.OK)
    .json(
      APIResponse.paginated(
        result.data,
        result.pagination.total,
        page,
        limit,
        "Students retrieved"
      )
    );
});

/**
 * Get earnings history
 * Query: status (Pending|Settled|Refunded), page, limit
 */
exports.getEarnings = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const { status }   = req.query;
  const { page, limit } = validatePagination(req.query.page, req.query.limit);

  const result = await getEarnings(instructorId, { status, page, limit });

  res
    .status(HTTP_STATUS.OK)
    .json(
      APIResponse.paginated(
        result.data,
        result.pagination.total,
        page,
        limit,
        "Earnings retrieved"
      )
    );
});

/**
 * Watch analytics for a specific course — daily watch time + top lectures
 */
exports.getWatchAnalytics = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const { courseId } = req.params;

  validateRequired(courseId, "Course ID");

  const result = await getWatchAnalytics(instructorId, courseId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, "Watch analytics retrieved"));
});

/**
 * Quiz analytics — avg scores, pass rates across instructor's courses
 */
exports.getQuizAnalytics = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;

  const result = await getQuizAnalytics(instructorId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.quizStats, "Quiz analytics retrieved"));
});