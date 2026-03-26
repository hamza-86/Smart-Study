/**
 * Assignment Service
 * Handles assignment creation, submissions, and grading
 */

const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Course = require("../models/Course");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");

// ─── createAssignment ────────────────────────────────────────────────────────

const createAssignment = async (instructorId, assignmentData, attachmentFiles = []) => {
  const {
    title,
    description,
    courseId,
    sectionId,
    dueDate,
    maxMarks,
    passingMarks,
  } = assignmentData;

  const course = await Course.findOne({
    _id:       courseId,
    instructor: instructorId,
  });
  if (!course) {
    throw APIError.authorization("Not authorized or course not found");
  }

  // Upload attachments
  const attachments = [];
  for (const file of attachmentFiles) {
    const uploaded = await uploadImageToCloudinary(
      file,
      `${process.env.FOLDER_NAME || "EduFlow"}/assignments`
    );
    attachments.push({
      name: file.name || uploaded.original_filename,
      url:  uploaded.secure_url,
      type: (file.name || "").split(".").pop().toLowerCase() || "other",
    });
  }

  const assignment = await Assignment.create({
    title:        title.trim(),
    description:  description.trim(),
    course:       courseId,
    section:      sectionId || null,
    attachments,
    dueDate:      dueDate || null,
    maxMarks:     maxMarks     ?? 100,
    passingMarks: passingMarks ?? 40,
    isPublished:  true,
  });

  logger.info("Assignment created", { assignmentId: assignment._id, courseId });

  return {
    success:    true,
    message:    "Assignment created successfully",
    assignment,
  };
};

// ─── getCourseAssignments ────────────────────────────────────────────────────

const getCourseAssignments = async (courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw APIError.validation("Invalid course ID");
  }

  const assignments = await Assignment.find({
    course:      courseId,
    isPublished: true,
  })
    .sort("-createdAt")
    .lean();

  return { success: true, assignments };
};

// ─── submitAssignment ────────────────────────────────────────────────────────

const submitAssignment = async (userId, assignmentId, submissionData, files = []) => {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    throw APIError.validation("Invalid assignment ID");
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw APIError.notFound("Assignment");
  }

  // Check due date
  if (assignment.dueDate && new Date() > assignment.dueDate) {
    throw APIError.validation("Assignment submission deadline has passed");
  }

  // One submission per student
  const existing = await AssignmentSubmission.findOne({
    assignment: assignmentId,
    student:    userId,
  });
  if (existing) {
    throw APIError.conflict("You have already submitted this assignment");
  }

  // Upload submission files
  const uploadedFiles = [];
  for (const file of files) {
    const uploaded = await uploadImageToCloudinary(
      file,
      `${process.env.FOLDER_NAME || "EduFlow"}/submissions`
    );
    uploadedFiles.push({
      name: file.name || uploaded.original_filename,
      url:  uploaded.secure_url,
      type: (file.name || "").split(".").pop().toLowerCase() || "other",
    });
  }

  const submission = await AssignmentSubmission.create({
    assignment:  assignmentId,
    student:     userId,
    course:      assignment.course,
    files:       uploadedFiles,
    notes:       submissionData.notes?.trim() || "",
    status:      "Submitted",
    submittedAt: new Date(),
  });

  // Notify instructor
  const course = await Course.findById(assignment.course).select("instructor title");
  const user   = await User.findById(userId).select("firstName lastName");

  if (course) {
    await Notification.create({
      user:      course.instructor,
      title:     "Assignment Submitted",
      message:   `${user.firstName} ${user.lastName} submitted "${assignment.title}"`,
      type:      "assignment",
      link:      `/instructor/assignments/${assignmentId}/submissions`,
      relatedId: assignment._id,
    });
  }

  logger.info("Assignment submitted", { assignmentId, userId });

  return {
    success:    true,
    message:    "Assignment submitted successfully",
    submission,
  };
};

// ─── gradeSubmission ─────────────────────────────────────────────────────────

const gradeSubmission = async (submissionId, instructorId, gradeData) => {
  if (!mongoose.Types.ObjectId.isValid(submissionId)) {
    throw APIError.validation("Invalid submission ID");
  }

  const submission = await AssignmentSubmission.findById(submissionId).populate({
    path:   "assignment",
    select: "title maxMarks passingMarks course",
  });

  if (!submission) {
    throw APIError.notFound("Submission");
  }

  // Verify instructor owns the course
  const course = await Course.findOne({
    _id:       submission.assignment.course,
    instructor: instructorId,
  });
  if (!course) {
    throw APIError.authorization("Not authorized to grade this submission");
  }

  const { marksObtained, feedback } = gradeData;

  if (marksObtained > submission.assignment.maxMarks) {
    throw APIError.validation(
      `Marks cannot exceed maximum marks (${submission.assignment.maxMarks})`
    );
  }

  submission.marksObtained = marksObtained;
  submission.feedback      = feedback?.trim() || "";
  submission.reviewedAt    = new Date();
  submission.reviewedBy    = instructorId;
  submission.status =
    marksObtained >= submission.assignment.passingMarks ? "Passed" : "Failed";

  await submission.save();

  // Notify student
  await Notification.create({
    user:      submission.student,
    title:     "Assignment Graded",
    message:   `Your submission for "${submission.assignment.title}" scored ${marksObtained}/${submission.assignment.maxMarks}`,
    type:      "assignment",
    relatedId: submission._id,
  });

  logger.info("Submission graded", { submissionId, marksObtained });

  return {
    success:    true,
    message:    "Submission graded successfully",
    submission,
  };
};

// ─── getSubmissions (instructor) ─────────────────────────────────────────────

const getSubmissions = async (assignmentId, instructorId) => {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    throw APIError.validation("Invalid assignment ID");
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw APIError.notFound("Assignment");
  }

  const course = await Course.findOne({
    _id:       assignment.course,
    instructor: instructorId,
  });
  if (!course) {
    throw APIError.authorization("Not authorized");
  }

  const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
    .populate("student", "firstName lastName email avatar")
    .sort("-submittedAt")
    .lean();

  return { success: true, submissions };
};

// ─── getMySubmissions (student) ──────────────────────────────────────────────

const getMySubmissions = async (userId, courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw APIError.validation("Invalid course ID");
  }

  const submissions = await AssignmentSubmission.find({
    student: userId,
    course:  courseId,
  })
    .populate("assignment", "title maxMarks passingMarks dueDate")
    .sort("-submittedAt")
    .lean();

  return { success: true, submissions };
};

module.exports = {
  createAssignment,
  getCourseAssignments,
  submitAssignment,
  gradeSubmission,
  getSubmissions,
  getMySubmissions,
};