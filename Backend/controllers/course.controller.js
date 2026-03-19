/**
 * Course Controller  
 * Handles course routes and delegates to course service
 */

const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getInstructorCourses,
  updateCourse,
  publishCourse,
  deleteCourse,
} = require("../services/course.service");
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../services/section.service");
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../services/subsection.service");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const APIError = require("../utils/apiError");
const { HTTP_STATUS, FILE_UPLOAD } = require("../constants");
const {
  validateRequired,
  validatePrice,
  validatePagination,
  validateObjectId,
} = require("../utils/validators");

/**
 * Create course
 */
exports.createCourse = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;

  if (!req.files?.thumbnail) {
    throw APIError.validation("Thumbnail image is required");
  }

  // Validate file size
  const thumbnail = req.files.thumbnail;
  if (thumbnail.size > FILE_UPLOAD.MAX_IMAGE_SIZE) {
    throw APIError.validation(`Thumbnail size must not exceed ${FILE_UPLOAD.MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
  }

  validateRequired(req.body.title, "Course title");
  validateRequired(req.body.description, "Course description");
  validateRequired(req.body.category, "Category");
  validatePrice(req.body.price);

  const result = await createCourse(instructorId, req.body, thumbnail);

  res
    .status(HTTP_STATUS.CREATED)
    .json(APIResponse.created(result.course, result.message));
});

/**
 * Get all courses
 */
exports.getAllCourses = asyncHandler(async (req, res) => {
  const { page, limit } = validatePagination(req.query.page, req.query.limit);
  const { search, category } = req.query;

  const result = await getAllCourses(page, limit, { search, category });

  res
    .status(HTTP_STATUS.OK)
    .json(
      APIResponse.paginated(
        result.data,
        result.pagination.total,
        page,
        limit,
        "Courses retrieved successfully"
      )
    );
});

/**
 * Get course details
 */
exports.getCourseDetails = asyncHandler(async (req, res) => {
  validateRequired(req.params.courseId, "Course ID");

  const result = await getCourseDetails(req.params.courseId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.data, "Course details retrieved"));
});

/**
 * Get instructor courses
 */
exports.getInstructorCourses = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const { page, limit } = validatePagination(req.query.page, req.query.limit);

  const result = await getInstructorCourses(instructorId, page, limit);

  res
    .status(HTTP_STATUS.OK)
    .json(
      APIResponse.paginated(
        result.data,
        result.pagination.total,
        page,
        limit,
        "Instructor courses retrieved"
      )
    );
});

/**
 * Update course
 */
exports.editCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId;
  const instructorId = req.user.id;

  validateRequired(courseId, "Course ID");

  const thumbnail = req.files?.thumbnail;

  const result = await updateCourse(courseId, instructorId, req.body, thumbnail);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.course, result.message));
});

/**
 * Publish course
 */
exports.publishCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId;
  const instructorId = req.user.id;

  validateRequired(courseId, "Course ID");

  const result = await publishCourse(courseId, instructorId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.course, result.message));
});

/**
 * Delete course
 */
exports.deleteCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId;
  const instructorId = req.user.id;

  validateRequired(courseId, "Course ID");

  const result = await deleteCourse(courseId, instructorId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, result.message));
});

/**
 * Create section
 */
exports.createSection = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const courseId = req.body.courseId;

  validateRequired(courseId, "Course ID");
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
  const sectionId = req.params.sectionId;
  const instructorId = req.user.id;

  validateRequired(sectionId, "Section ID");

  const result = await updateSection(sectionId, instructorId, req.body);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.section, result.message));
});

/**
 * Delete section
 */
exports.deleteSection = asyncHandler(async (req, res) => {
  const sectionId = req.params.sectionId;
  const instructorId = req.user.id;

  validateRequired(sectionId, "Section ID");

  const result = await deleteSection(sectionId, instructorId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, result.message));
});

/**
 * Create subsection/video
 */
exports.createSubSection = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;
  const sectionId = req.body.sectionId;

  validateRequired(sectionId, "Section ID");
  validateRequired(req.body.title, "Video title");
  validateRequired(req.body.description, "Video description");

  if (!req.files?.video) {
    throw APIError.validation("Video file is required");
  }

  const video = req.files.video;
  if (video.size > FILE_UPLOAD.MAX_VIDEO_SIZE) {
    throw APIError.validation(
      `Video size must not exceed ${FILE_UPLOAD.MAX_VIDEO_SIZE / (1024 * 1024)}MB`
    );
  }

  const notes = req.files?.notes || null;

  const result = await createSubSection(sectionId, instructorId, req.body, video, notes);

  res
    .status(HTTP_STATUS.CREATED)
    .json(APIResponse.created(result.subsection, result.message));
});

/**
 * Update subsection
 */
exports.updateSubSection = asyncHandler(async (req, res) => {
  const subSectionId = req.params.subSectionId;
  const instructorId = req.user.id;

  validateRequired(subSectionId, "SubSection ID");

  const video = req.files?.video || null;
  const notes = req.files?.notes || null;

  const result = await updateSubSection(
    subSectionId,
    instructorId,
    req.body,
    video,
    notes
  );

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result.subsection, result.message));
});

/**
 * Delete subsection
 */
exports.deleteSubSection = asyncHandler(async (req, res) => {
  const subSectionId = req.params.subSectionId;
  const instructorId = req.user.id;

  validateRequired(subSectionId, "SubSection ID");

  const result = await deleteSubSection(subSectionId, instructorId);

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(result, result.message));
});
