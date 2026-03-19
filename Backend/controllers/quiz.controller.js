/**
 * Quiz Controller
 * Handles quiz CRUD and attempt submission — delegates to quiz service
 */

const {
  createQuiz,
  getQuizForStudent,
  submitQuizAttempt,
  getMyAttempts,
  getAllAttempts,
  updateQuiz,
  deleteQuiz,
} = require("../services/quiz.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const APIError = require("../utils/apiError");
const { HTTP_STATUS } = require("../constants");
const { validateRequired } = require("../utils/validators");

/**
 * Create quiz (Instructor)
 * Body: courseId, subSectionId, sectionId, title, questions[], passingScore, timeLimit, maxAttempts
 */
exports.createQuiz = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;

  validateRequired(req.body.courseId, "Course ID");
  validateRequired(req.body.title,    "Quiz title");
  validateRequired(req.body.questions, "Questions");

  const result = await createQuiz(instructorId, req.body);

  res
    .status(HTTP_STATUS.CREATED)
    .json(APIResponse.created(result.quiz, result.message));
});

/**
 * Update quiz (Instructor)
 */
exports.updateQuiz = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const quizId       = req.params.quizId;

  validateRequired(quizId, "Quiz ID");

  const result = await updateQuiz(quizId, instructorId, req.body);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.quiz, result.message));
});

/**
 * Delete quiz (Instructor)
 */
exports.deleteQuiz = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const quizId       = req.params.quizId;

  validateRequired(quizId, "Quiz ID");

  const result = await deleteQuiz(quizId, instructorId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(null, result.message));
});

/**
 * Get quiz for student — correct answers stripped out
 */
exports.getQuizForStudent = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const quizId = req.params.quizId;

  validateRequired(quizId, "Quiz ID");

  const result = await getQuizForStudent(quizId, userId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.quiz, "Quiz retrieved"));
});

/**
 * Submit quiz attempt (Student)
 * Body: answers[], timeTaken, courseId
 */
exports.submitQuizAttempt = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const quizId = req.params.quizId;

  validateRequired(quizId,           "Quiz ID");
  validateRequired(req.body.answers, "Answers");
  validateRequired(req.body.courseId, "Course ID");

  const result = await submitQuizAttempt(quizId, userId, req.body);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, "Quiz submitted"));
});

/**
 * Get student's own attempts for a quiz
 */
exports.getMyAttempts = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const quizId = req.params.quizId;

  validateRequired(quizId, "Quiz ID");

  const result = await getMyAttempts(quizId, userId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.attempts, "Attempts retrieved"));
});

/**
 * Get all attempts for a quiz (Instructor only)
 */
exports.getAllAttempts = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const quizId       = req.params.quizId;

  validateRequired(quizId, "Quiz ID");

  const result = await getAllAttempts(quizId, instructorId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.attempts, "All attempts retrieved"));
});
