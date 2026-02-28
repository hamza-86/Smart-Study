const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");
const Section = require("../models/Section");
const SubSection = require("../models/subSection");
const Category = require("../models/Category");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");

/* ====================================================
   CREATE COURSE
==================================================== */
exports.createCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const instructorId = req.user.id;

    const {
      title,
      description,
      price,
      whatYouWillLearn,
      tags,
      category,
    } = req.body;

    const thumbnail = req.files?.thumbnail;

    if (
      !title ||
      !description ||
      !price ||
      !whatYouWillLearn ||
      !category ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const instructor = await User.findById(instructorId).session(session);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    const categoryDetails = await Category.findById(category).session(session);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const uploadedThumbnail = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    const newCourse = await Course.create(
      [
        {
          title,
          description,
          price,
          instructor: instructor._id,
          whatYouWillLearn,
          tags,
          category,
          thumbnail: uploadedThumbnail.secure_url,
        },
      ],
      { session }
    );

    await User.findByIdAndUpdate(
      instructor._id,
      { $push: { courses: newCourse[0]._id } },
      { session }
    );

    await Category.findByIdAndUpdate(
      category,
      { $push: { courses: newCourse[0]._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse[0],
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Create Course Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

/* ====================================================
   GET ALL COURSES
==================================================== */
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: courses,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

/* ====================================================
   GET COURSE DETAILS
==================================================== */
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId)
      .populate("instructor", "name email")
      .populate("category", "name")
      .populate({
        path: "courseContent",
        populate: { path: "subSections" },
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let totalSeconds = 0;

    course.courseContent.forEach((section) => {
      section.subSections.forEach((sub) => {
        totalSeconds += parseInt(sub.timeDuration);
      });
    });

    const totalDuration = convertSecondsToDuration(totalSeconds);

    return res.status(200).json({
      success: true,
      data: { course, totalDuration },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course details",
    });
  }
};

/* ====================================================
   EDIT COURSE (SAFE UPDATE)
==================================================== */
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;

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

    const allowedUpdates = [
      "title",
      "description",
      "price",
      "whatYouWillLearn",
      "tags",
      "category",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    if (req.files?.thumbnail) {
      const uploaded = await uploadImageToCloudinary(
        req.files.thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = uploaded.secure_url;
    }

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

/* ====================================================
   DELETE COURSE (TRANSACTION SAFE)
==================================================== */
exports.deleteCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;

    const course = await Course.findById(courseId).session(session);

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

    await User.updateMany(
      { courses: courseId },
      { $pull: { courses: courseId } },
      { session }
    );

    await Section.deleteMany(
      { _id: { $in: course.courseContent } },
      { session }
    );

    await Course.findByIdAndDelete(courseId).session(session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

/* ====================================================
   GET INSTRUCTOR COURSES
==================================================== */
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await Course.find({ instructor: instructorId })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: courses,
    });

  } catch (error) {
    console.error("Get Instructor Courses Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor courses",
    });
  }
};

/* ====================================================
   GET ENROLLED COURSES (STUDENT)
==================================================== */
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: "courses",
      populate: [
        { path: "instructor", select: "name email" },
        { path: "category", select: "name" },
      ],
      options: { sort: { createdAt: -1 } },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user.courses || [],
    });
  } catch (error) {
    console.error("Get Enrolled Courses Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses",
    });
  }
};
