/**
 * Student Dashboard Controller
 * Dashboard stats, notifications, certificates — delegates to student service
 */

const {
  getStudentDashboard,
  getNotifications,
  markNotificationsRead,
  getCertificates,
} = require("../services/Student.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../constants");
const { validateRequired } = require("../utils/validators");

/**
 * Full student dashboard — enrolled courses + progress + quiz stats + recent activity
 */
exports.getStudentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await getStudentDashboard(userId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, "Dashboard retrieved"));
});

/**
 * Get notifications (latest 50, sorted newest first)
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await getNotifications(userId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.notifications, "Notifications retrieved"));
});

/**
 * Mark notifications as read
 * Body: ids[] — if empty array, marks ALL as read
 */
exports.markNotificationsRead = asyncHandler(async (req, res) => {
  const userId     = req.user.id;
  const { ids }    = req.body;

  const result = await markNotificationsRead(userId, ids || []);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(null, result.message));
});

/**
 * Get all certificates earned by student
 */
exports.getCertificates = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await getCertificates(userId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.certificates, "Certificates retrieved"));
});

