/**
 * Assignment Controller
 * Handles assignment CRUD, submissions, and grading — delegates to assignment service
 */

const {
  createAssignment,
  getCourseAssignments,
  submitAssignment,
  gradeSubmission,
  getSubmissions,
  getMySubmissions,
} = require("../services/assignment.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const APIError = require("../utils/apiError");
const { HTTP_STATUS, FILE_UPLOAD } = require("../constants");
const { validateRequired } = require("../utils/validators");

/**
 * Create assignment (Instructor)
 * Body: title, description, courseId, sectionId, dueDate, maxMarks, passingMarks
 * Files: attachments (optional)
 */
exports.createAssignment = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;

  validateRequired(req.body.title,    "Assignment title");
  validateRequired(req.body.courseId, "Course ID");
  validateRequired(req.body.description, "Description");

  const attachments = req.files?.attachments
    ? Array.isArray(req.files.attachments)
      ? req.files.attachments
      : [req.files.attachments]
    : [];

  const result = await createAssignment(instructorId, req.body, attachments);

  res
    .status(HTTP_STATUS.CREATED)
    .json(APIResponse.created(result.assignment, result.message));
});

/**
 * Get assignments for a course
 */
exports.getCourseAssignments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  validateRequired(courseId, "Course ID");

  const result = await getCourseAssignments(courseId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.assignments, "Assignments retrieved"));
});

/**
 * Submit assignment (Student)
 * Body: notes
 * Files: files (required)
 */
exports.submitAssignment = asyncHandler(async (req, res) => {
  const userId       = req.user.id;
  const assignmentId = req.params.assignmentId;

  validateRequired(assignmentId, "Assignment ID");

  const files = req.files?.files
    ? Array.isArray(req.files.files)
      ? req.files.files
      : [req.files.files]
    : [];

  if (files.length === 0) {
    throw APIError.validation("At least one submission file is required");
  }

  const result = await submitAssignment(userId, assignmentId, req.body, files);

  res
    .status(HTTP_STATUS.CREATED)
    .json(APIResponse.created(result.submission, result.message));
});

/**
 * Grade a submission (Instructor)
 * Body: marksObtained, feedback
 */
exports.gradeSubmission = asyncHandler(async (req, res) => {
  const instructorId   = req.user.id;
  const submissionId   = req.params.submissionId;

  validateRequired(submissionId,          "Submission ID");
  validateRequired(req.body.marksObtained, "Marks obtained");
  validateRequired(req.body.feedback,      "Feedback");

  const result = await gradeSubmission(submissionId, instructorId, {
    marksObtained: req.body.marksObtained,
    feedback:      req.body.feedback,
  });

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.submission, result.message));
});

/**
 * Get all submissions for an assignment (Instructor)
 */
exports.getSubmissions = asyncHandler(async (req, res) => {
  const instructorId   = req.user.id;
  const assignmentId   = req.params.assignmentId;

  validateRequired(assignmentId, "Assignment ID");

  const result = await getSubmissions(assignmentId, instructorId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.submissions, "Submissions retrieved"));
});

/**
 * Get student's own submissions
 */
exports.getMySubmissions = asyncHandler(async (req, res) => {
  const userId   = req.user.id;
  const courseId = req.params.courseId;

  validateRequired(courseId, "Course ID");

  const result = await getMySubmissions(userId, courseId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.submissions, "Your submissions retrieved"));
});
