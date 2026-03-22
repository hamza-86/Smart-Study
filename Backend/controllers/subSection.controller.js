/**
 * SubSection Controller
 * Handles subsection (lecture) CRUD — delegates to subsection service
 */

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../services/subsection.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const APIError = require("../utils/apiError");
const { HTTP_STATUS, FILE_UPLOAD } = require("../constants");
const { validateRequired } = require("../utils/validators");

/**
 * Create subsection (lecture)
 * Body: sectionId, courseId, title, description, isPreview, type
 * Files: video/image/file (type-based), notes (optional, PDF/doc)
 */
exports.createSubSection = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const sectionId    = req.body.sectionId;
  const courseId     = req.body.courseId;

  validateRequired(sectionId,        "Section ID");
  validateRequired(courseId,         "Course ID");
  validateRequired(req.body.title, "Subsection title");
  validateRequired(req.body.description, "Subsection description");

  const type = String(req.body.type || "video").toLowerCase();
  const mediaFile = req.files?.video || req.files?.image || req.files?.file || null;
  if ((type === "video" || type === "image") && !mediaFile) {
    throw APIError.validation(`${type === "video" ? "Video" : "Image"} file is required`);
  }

  if (type === "video" && mediaFile?.size > FILE_UPLOAD.MAX_VIDEO_SIZE) {
    throw APIError.validation(
      `Video size must not exceed ${FILE_UPLOAD.MAX_VIDEO_SIZE / (1024 * 1024)}MB`
    );
  }

  // Notes can be a single file or array of files
  const notes = req.files?.notes
    ? Array.isArray(req.files.notes)
      ? req.files.notes
      : [req.files.notes]
    : [];

  const result = await createSubSection(
    sectionId,
    courseId,
    instructorId,
    req.body,
    mediaFile,
    notes
  );

  res
    .status(HTTP_STATUS.CREATED)
    .json(APIResponse.created(result.subsection, result.message));
});

/**
 * Update subsection
 * Body: title, description, isPreview, order, type
 * Files: video/image/file (optional replacement), notes (optional)
 */
exports.updateSubSection = asyncHandler(async (req, res) => {
  const subSectionId = req.params.subSectionId || req.params.id;
  const instructorId = req.user.id;

  validateRequired(subSectionId, "SubSection ID");

  const mediaFile = req.files?.video || req.files?.image || req.files?.file || null;
  const notes = req.files?.notes
    ? Array.isArray(req.files.notes)
      ? req.files.notes
      : [req.files.notes]
    : null;

  const result = await updateSubSection(
    subSectionId,
    instructorId,
    req.body,
    mediaFile,
    notes
  );

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.subsection, result.message));
});

/**
 * Delete subsection
 * Body: sectionId (so section's subSections array is cleaned up)
 */
exports.deleteSubSection = asyncHandler(async (req, res) => {
  const subSectionId = req.params.subSectionId || req.params.id;
  const instructorId = req.user.id;
  const sectionId    = req.body.sectionId;
  const courseId     = req.body.courseId;

  validateRequired(subSectionId, "SubSection ID");
  validateRequired(sectionId,    "Section ID");

  const result = await deleteSubSection(
    subSectionId,
    sectionId,
    courseId,
    instructorId
  );

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, result.message));
});
