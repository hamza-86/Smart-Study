const mongoose = require("mongoose");
const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/subSection");

/* ================= CREATE SECTION ================= */
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;
    const instructorId = req.user.id;

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Section name and courseId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (String(course.instructor) !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const newSection = await Section.create({
      sectionName,
      subSections: [],
    });

    course.courseContent.push(newSection._id);
    await course.save();

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: newSection,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create section",
    });
  }
};

/* ================= UPDATE SECTION ================= */
exports.updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { sectionName } = req.body;

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    if (!updatedSection) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedSection,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update section",
    });
  }
};

/* ================= DELETE SECTION ================= */
exports.deleteSection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sectionId, courseId } = req.body;

    const section = await Section.findById(sectionId).session(session);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    await SubSection.deleteMany(
      { _id: { $in: section.subSections } },
      { session }
    );

    await Section.findByIdAndDelete(sectionId).session(session);

    await Course.findByIdAndUpdate(
      courseId,
      { $pull: { courseContent: sectionId } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: "Failed to delete section",
    });
  }
};