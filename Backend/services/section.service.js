/**
 * Section Service
 * Handles all section-related business logic
 */

const mongoose = require("mongoose");
const Course = require("../models/Course");
const Section = require("../models/Section");
const SubSection = require("../models/subSection");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");

// ─── createSection ───────────────────────────────────────────────────────────

const createSection = async (courseId, instructorId, sectionData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sectionName = sectionData.sectionName || sectionData.title;
    const { description, order } = sectionData;

    if (!sectionName?.trim()) {
      throw APIError.validation("Section name is required");
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw APIError.validation("Invalid course ID");
    }

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      throw APIError.notFound("Course");
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      throw APIError.authorization("Not authorized to add sections to this course");
    }

    const section = await Section.create(
      [{
        sectionName:  sectionName.trim(),
        description:  description?.trim() || "",
        order:        order ?? course.courseContent.length,
        subSections:  [],
      }],
      { session }
    );

    await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { courseContent: section[0]._id },
        $inc:  { totalSections: 1 },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    logger.info("Section created", { courseId, sectionId: section[0]._id });

    return {
      success: true,
      message: "Section created successfully",
      section: section[0],
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Create section error", error);
    throw error;
  }
};

// ─── updateSection ───────────────────────────────────────────────────────────

const updateSection = async (sectionId, instructorId, sectionData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      throw APIError.validation("Invalid section ID");
    }

    const section = await Section.findById(sectionId).session(session);
    if (!section) {
      throw APIError.notFound("Section");
    }

    // Verify ownership via the course
    const course = await Course.findOne({
      courseContent: sectionId,
    }).session(session);

    if (!course) {
      throw APIError.notFound("Course for this section");
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      throw APIError.authorization("Not authorized to update this section");
    }

    const nextName = sectionData.sectionName || sectionData.title;
    if (nextName !== undefined) {
      section.sectionName = nextName.trim();
    }
    if (sectionData.description !== undefined) {
      section.description = sectionData.description.trim();
    }
    if (sectionData.order !== undefined) {
      section.order = sectionData.order;
    }

    await section.save({ session });

    await session.commitTransaction();
    session.endSession();

    logger.info("Section updated", { sectionId });

    return {
      success: true,
      message: "Section updated successfully",
      section,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Update section error", error);
    throw error;
  }
};

// ─── deleteSection ───────────────────────────────────────────────────────────

const deleteSection = async (sectionId, courseId, instructorId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      throw APIError.validation("Invalid section ID");
    }

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      throw APIError.notFound("Course");
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      throw APIError.authorization("Not authorized to delete sections from this course");
    }

    const section = await Section.findById(sectionId).session(session);
    if (!section) {
      throw APIError.notFound("Section");
    }

    // Delete all sub-sections inside this section
    if (section.subSections && section.subSections.length > 0) {
      // Get video durations to subtract from course total
      const subs = await SubSection.find({
        _id: { $in: section.subSections },
      }).session(session);

      const totalDurationToRemove = subs.reduce(
        (sum, s) => sum + (s.timeDuration || 0),
        0
      );

      await SubSection.deleteMany(
        { _id: { $in: section.subSections } },
        { session }
      );

      // Update course totals
      await Course.findByIdAndUpdate(
        courseId,
        {
          $pull: { courseContent: sectionId },
          $inc:  {
            totalSections:  -1,
            totalLectures:  -subs.length,
            totalDuration:  -(totalDurationToRemove / 60), // minutes
          },
        },
        { session }
      );
    } else {
      await Course.findByIdAndUpdate(
        courseId,
        {
          $pull: { courseContent: sectionId },
          $inc:  { totalSections: -1 },
        },
        { session }
      );
    }

    await Section.findByIdAndDelete(sectionId, { session });

    await session.commitTransaction();
    session.endSession();

    logger.info("Section deleted", { sectionId, courseId });

    return { success: true, message: "Section deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Delete section error", error);
    throw error;
  }
};

module.exports = {
  createSection,
  updateSection,
  deleteSection,
};
