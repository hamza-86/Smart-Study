/**
 * Section Controller
 * Handles section CRUD — delegates to section service
 */

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../services/section.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const APIError = require("../utils/apiError");
const { HTTP_STATUS } = require("../constants");
const { validateRequired } = require("../utils/validators");

/**
 * Create section
 */
exports.createSection = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const courseId     = req.body.courseId;

  validateRequired(courseId,           "Course ID");
  validateRequired(req.body.sectionName, "Section name");

  const result = await createSection(courseId, instructorId, req.body);

  res
    .status(HTTP_STATUS.CREATED)
    .json(APIResponse.created(result.section, result.message));
});

/**
 * Update section
 */
exports.updateSection = asyncHandler(async (req, res) => {
  const sectionId    = req.params.sectionId;
  const instructorId = req.user.id;

  validateRequired(sectionId, "Section ID");

  const result = await updateSection(sectionId, instructorId, req.body);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.section, result.message));
});

/**
 * Delete section (also deletes all its subsections)
 */
exports.deleteSection = asyncHandler(async (req, res) => {
  const sectionId    = req.params.sectionId;
  const instructorId = req.user.id;
  // courseId passed in body so the course's courseContent array gets cleaned up
  const courseId     = req.body.courseId;

  validateRequired(sectionId, "Section ID");
  validateRequired(courseId,  "Course ID");

  const result = await deleteSection(sectionId, courseId, instructorId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, result.message));
});