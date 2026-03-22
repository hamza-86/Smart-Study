/**
 * Course Service
 * Handles all course-related business logic
 */

const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
const Section = require("../models/Section");
const SubSection = require("../models/subSection");
const Enrollment = require("../models/Enrollment");
const InstructorEarning = require("../models/InstructorEarnings");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");
const { COURSE_STATUS } = require("../constants");

// ─── Helper: parse JSON array fields sent as strings from multipart ──────────
const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return [field];
  }
};

const resolveCategoryId = async (categoryInput, session) => {
  if (mongoose.Types.ObjectId.isValid(categoryInput)) {
    const category = await Category.findById(categoryInput).session(session);
    if (category) return category._id;
  }

  const normalized = String(categoryInput || "").trim();
  if (!normalized) return null;

  const byName = await Category.findOne({
    name: { $regex: new RegExp(`^${normalized}$`, "i") },
  }).session(session);
  if (byName) return byName._id;

  const slug = normalized
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  const bySlug = await Category.findOne({ slug }).session(session);
  return bySlug?._id || null;
};

// ─── createCourse ────────────────────────────────────────────────────────────

const createCourse = async (instructorId, courseData, thumbnail) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      title,
      subtitle,
      description,
      price,
      discountedPrice,
      whatYouWillLearn,
      requirements,
      targetAudience,
      tags,
      category,
      level,
      language,
      hasCertificate,
      instructorRevenuePercent,
    } = courseData;

    if (!title || !description || !category || price === undefined || price === null) {
      throw APIError.validation("title, description, price, and category are required");
    }
    if (!thumbnail) {
      throw APIError.validation("Course thumbnail is required");
    }

    const parsedPrice = parseFloat(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      throw APIError.validation("Price must be a non-negative number");
    }

    const resolvedCategoryId = await resolveCategoryId(category, session);
    if (!resolvedCategoryId) {
      throw APIError.notFound("Category");
    }

    // Upload thumbnail
    let thumbnailUrl = "";
    if (thumbnail) {
      const uploaded = await uploadImageToCloudinary(
        thumbnail,
        `${process.env.FOLDER_NAME || "EduFlow"}/thumbnails`
      );
      thumbnailUrl = uploaded.secure_url;
    }

    const newCourse = await Course.create(
      [
        {
          title:          title.trim(),
          subtitle:       subtitle?.trim() || "",
          description:    description.trim(),
          price:          parsedPrice,
          discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
          isFree:         parsedPrice === 0,
          instructor:     instructorId,
          whatYouWillLearn: parseArrayField(whatYouWillLearn),
          requirements:   parseArrayField(requirements),
          targetAudience: parseArrayField(targetAudience),
          tags:           parseArrayField(tags),
          category: resolvedCategoryId,
          thumbnail:      thumbnailUrl,
          level:          level || "All Levels",
          language:       language || "English",
          hasCertificate: hasCertificate !== "false" && hasCertificate !== false,
          instructorRevenuePercent: instructorRevenuePercent
            ? parseInt(instructorRevenuePercent)
            : 70,
          status: COURSE_STATUS.DRAFT,
        },
      ],
      { session }
    );

    // Add course to instructor's courses list
    await User.findByIdAndUpdate(
      instructorId,
      { $push: { courses: newCourse[0]._id } },
      { session }
    );

    // Add course to category
    await Category.findByIdAndUpdate(
      resolvedCategoryId,
      { $push: { courses: newCourse[0]._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    logger.info("Course created", {
      courseId: newCourse[0]._id,
      instructorId,
    });

    return {
      success: true,
      message: "Course created successfully",
      course: newCourse[0],
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Create course error", error);
    throw error;
  }
};

// ─── getAllCourses ────────────────────────────────────────────────────────────

const getAllCourses = async (page = 1, limit = 12, filters = {}) => {
  try {
    const skip  = (page - 1) * limit;
    const query = { status: COURSE_STATUS.PUBLISHED };

    if (filters.category) query.category = filters.category;
    if (filters.level)    query.level    = filters.level;
    if (filters.language) query.language = filters.language;

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }

    if (filters.search) {
      query.$or = [
        { title:       { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { tags:        { $regex: filters.search, $options: "i" } },
      ];
    }

    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
      .select(
        "title subtitle thumbnail price discountedPrice isFree level language averageRating totalRatings totalStudents totalDuration totalLectures instructor category tags status"
      )
      .populate("instructor", "firstName lastName avatar headline")
      .populate("category", "name slug")
      .sort(filters.sort || "-createdAt")
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return {
      success: true,
      data: courses,
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Get all courses error", error);
    throw error;
  }
};

// ─── getCourseDetails (public — strips video URLs for non-enrolled) ───────────

const getCourseDetails = async (courseId, requestingUserId = null) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw APIError.validation("Invalid course ID");
  }

  const course = await Course.findById(courseId)
    .populate("instructor", "firstName lastName avatar headline bio totalStudents")
    .populate("category", "name slug")
    .populate({
      path: "courseContent",
      options: { sort: { order: 1 } },
      populate: {
        path: "subSections",
        options: { sort: { order: 1 } },
        populate: {
          path: "quizzes",
        },
      },
    })
    .lean();

  if (!course) {
    throw APIError.notFound("Course");
  }

  // Check if requesting user is enrolled
  let isEnrolled = false;
  const isOwner =
    Boolean(requestingUserId) &&
    String(course.instructor?._id) === String(requestingUserId);

  if (requestingUserId) {
    const enrollment = await Enrollment.findOne({
      user:   requestingUserId,
      course: courseId,
      status: "Active",
    });
    isEnrolled = !!enrollment;
  }

  if (isOwner) {
    const [enrollments, earningsAgg] = await Promise.all([
      Enrollment.find({ course: courseId, status: "Active" })
        .populate("user", "firstName lastName email avatar")
        .sort("-enrolledAt")
        .lean(),
      InstructorEarning.aggregate([
        {
          $match: {
            course: new mongoose.Types.ObjectId(courseId),
            instructor: new mongoose.Types.ObjectId(requestingUserId),
            status: { $ne: "Refunded" },
          },
        },
        { $group: { _id: null, totalEarnings: { $sum: "$netEarning" } } },
      ]),
    ]);

    course.totalStudents = enrollments.length;
    course.totalEarnings = earningsAgg[0]?.totalEarnings || 0;
    course.enrolledStudents = enrollments.map((en) => ({
      _id: en.user?._id,
      firstName: en.user?.firstName,
      lastName: en.user?.lastName,
      email: en.user?.email,
      avatar: en.user?.avatar,
      enrolledAt: en.enrolledAt,
    }));
  }

  // For non-enrolled non-owner users: strip gated media URLs
  if (!isEnrolled && !isOwner) {
    course.courseContent = course.courseContent?.map((section) => ({
      ...section,
      subSections: section.subSections?.map((sub) => {
        if (!sub.isPreview) {
          const { videoUrl, contentUrl, textContent, attachments, quizzes, ...rest } = sub;
          return rest;
        }
        return sub;
      }),
    }));
  }

  course.sections = (course.courseContent || []).map((section) => ({
    ...section,
    title: section.sectionName,
    subsections: section.subSections || [],
  }));

  return { success: true, data: course, isEnrolled };
};

// ─── getCourseContent (enrolled students + instructor) ───────────────────────

const getCourseContent = async (courseId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw APIError.validation("Invalid course ID");
  }

  // Must be enrolled
  const enrollment = await Enrollment.findOne({
    user:   userId,
    course: courseId,
    status: "Active",
  });

  if (!enrollment) {
    throw APIError.authorization("You must be enrolled to access course content");
  }

  const course = await Course.findById(courseId)
    .populate({
      path: "courseContent",
      populate: {
        path: "subSections",
        populate: {
          path: "quizzes",
          select: "title timeLimit passingScore questions._id questions.questionText questions.marks",
        },
      },
    })
    .lean();

  if (!course) {
    throw APIError.notFound("Course");
  }

  course.sections = (course.courseContent || []).map((section) => ({
    ...section,
    title: section.sectionName,
    subsections: section.subSections || [],
  }));

  return { success: true, data: course };
};

// ─── getInstructorCourses ────────────────────────────────────────────────────

const getInstructorCourses = async (instructorId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const total = await Course.countDocuments({ instructor: instructorId });

  const courses = await Course.find({ instructor: instructorId })
    .select(
      "title thumbnail status price totalStudents totalRatings averageRating totalDuration totalLectures totalSections createdAt publishedAt"
    )
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit))
    .lean();

  return {
    success: true,
    data: courses,
    pagination: {
      total,
      page:  parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

const getInstructorCourseDetails = async (courseId, instructorId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw APIError.validation("Invalid course ID");
  }

  const course = await Course.findOne({ _id: courseId, instructor: instructorId })
    .populate("instructor", "firstName lastName email avatar")
    .populate("category", "name slug")
    .populate({
      path: "courseContent",
      options: { sort: { order: 1 } },
      populate: {
        path: "subSections",
        options: { sort: { order: 1 } },
        populate: { path: "quizzes" },
      },
    })
    .lean();

  if (!course) {
    throw APIError.notFound("Course");
  }

  const [enrollments, earningsAgg] = await Promise.all([
    Enrollment.find({ course: courseId, status: "Active" })
      .populate("user", "firstName lastName email avatar")
      .sort("-enrolledAt")
      .lean(),
    InstructorEarning.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
          instructor: new mongoose.Types.ObjectId(instructorId),
          status: { $ne: "Refunded" },
        },
      },
      { $group: { _id: null, totalEarnings: { $sum: "$netEarning" } } },
    ]),
  ]);

  return {
    success: true,
    data: {
      ...course,
      totalStudents: enrollments.length,
      totalEarnings: earningsAgg[0]?.totalEarnings || 0,
      enrolledStudents: enrollments.map((en) => ({
        _id: en.user?._id,
        firstName: en.user?.firstName,
        lastName: en.user?.lastName,
        email: en.user?.email,
        avatar: en.user?.avatar,
        enrolledAt: en.enrolledAt,
      })),
    },
  };
};

const getCourseStudents = async (courseId, instructorId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw APIError.validation("Invalid course ID");
  }

  const course = await Course.findOne({ _id: courseId, instructor: instructorId }).lean();
  if (!course) {
    throw APIError.notFound("Course");
  }

  const enrollments = await Enrollment.find({ course: courseId, status: "Active" })
    .populate("user", "firstName lastName email avatar")
    .sort("-enrolledAt")
    .lean();

  return {
    success: true,
    data: {
      totalStudents: enrollments.length,
      students: enrollments.map((en) => ({
        _id: en.user?._id,
        firstName: en.user?.firstName,
        lastName: en.user?.lastName,
        email: en.user?.email,
        avatar: en.user?.avatar,
      })),
    },
  };
};

// ─── updateCourse ────────────────────────────────────────────────────────────

const updateCourse = async (courseId, instructorId, updateData, thumbnail) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw APIError.validation("Invalid course ID");
    }

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      throw APIError.notFound("Course");
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      throw APIError.authorization("You are not authorized to update this course");
    }

    // Scalar fields
    const scalarFields = [
      "title", "subtitle", "description", "price", "discountedPrice",
      "level", "language", "hasCertificate", "instructorRevenuePercent",
    ];
    scalarFields.forEach((f) => {
      if (updateData[f] !== undefined) course[f] = updateData[f];
    });

    // Auto-set isFree
    if (updateData.price !== undefined) {
      course.isFree = parseFloat(updateData.price) === 0;
    }

    // Array fields
    const arrayFields = ["whatYouWillLearn", "requirements", "targetAudience", "tags"];
    arrayFields.forEach((f) => {
      if (updateData[f] !== undefined) {
        course[f] = parseArrayField(updateData[f]);
      }
    });

    // Category change — update old & new category
    if (updateData.category && updateData.category !== course.category.toString()) {
      await Category.findByIdAndUpdate(course.category, {
        $pull: { courses: courseId },
      }, { session });
      await Category.findByIdAndUpdate(updateData.category, {
        $push: { courses: courseId },
      }, { session });
      course.category = updateData.category;
    }

    // Thumbnail
    if (thumbnail) {
      const uploaded = await uploadImageToCloudinary(
        thumbnail,
        `${process.env.FOLDER_NAME || "EduFlow"}/thumbnails`
      );
      course.thumbnail           = uploaded.secure_url;
      course.thumbnailPublicId   = uploaded.public_id;
    }

    await course.save({ session });

    await session.commitTransaction();
    session.endSession();

    logger.info("Course updated", { courseId });

    return { success: true, message: "Course updated successfully", course };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Update course error", error);
    throw error;
  }
};

// ─── publishCourse (toggles Draft ↔ Published) ───────────────────────────────

const publishCourse = async (courseId, instructorId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const course = await Course.findById(courseId).session(session);
    if (!course) {
      throw APIError.notFound("Course");
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      throw APIError.authorization("Not authorized");
    }

    if (
      course.status === COURSE_STATUS.DRAFT ||
      course.status === "Archived"
    ) {
      // Must have at least one section with one video
      if (!course.courseContent || course.courseContent.length === 0) {
        throw APIError.validation(
          "Course must have at least one section before publishing"
        );
      }
      course.status      = COURSE_STATUS.PUBLISHED;
      course.publishedAt = course.publishedAt || new Date();
    } else {
      course.status = COURSE_STATUS.DRAFT;
    }

    await course.save({ session });

    await session.commitTransaction();
    session.endSession();

    logger.info("Course publish status toggled", {
      courseId,
      status: course.status,
    });

    return {
      success: true,
      message: `Course is now ${course.status}`,
      course,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Publish course error", error);
    throw error;
  }
};

// ─── deleteCourse ────────────────────────────────────────────────────────────

const deleteCourse = async (courseId, instructorId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw APIError.validation("Invalid course ID");
    }

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      throw APIError.notFound("Course");
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      throw APIError.authorization("Not authorized to delete this course");
    }

    if (course.studentsEnrolled && course.studentsEnrolled.length > 0) {
      throw APIError.validation(
        "Cannot delete a course with enrolled students. Archive it instead."
      );
    }

    // Remove from instructor
    await User.findByIdAndUpdate(
      instructorId,
      { $pull: { courses: courseId } },
      { session }
    );

    // Remove from category
    await Category.findByIdAndUpdate(
      course.category,
      { $pull: { courses: courseId } },
      { session }
    );

    // Delete all sections (subsections are handled by Section model cascade or manual below)
    const sections = await Section.find({
      _id: { $in: course.courseContent },
    }).session(session);

    const subSectionIds = sections.flatMap((s) => s.subSections);
    if (subSectionIds.length > 0) {
      await SubSection.deleteMany(
        { _id: { $in: subSectionIds } },
        { session }
      );
    }

    await Section.deleteMany(
      { _id: { $in: course.courseContent } },
      { session }
    );

    await Course.findByIdAndDelete(courseId, { session });

    await session.commitTransaction();
    session.endSession();

    logger.info("Course deleted", { courseId });

    return { success: true, message: "Course deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Delete course error", error);
    throw error;
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getCourseContent,
  getInstructorCourses,
  getInstructorCourseDetails,
  getCourseStudents,
  updateCourse,
  publishCourse,
  deleteCourse,
};

