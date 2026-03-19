/**
 * Review Service
 * Handles all review-related business logic
 */

const mongoose = require("mongoose");
const Review = require("../models/Review");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Notification = require("../models/Notification");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");

// ─── Helper: recalculate course average rating ───────────────────────────────

const _recalcCourseRating = async (courseId, session) => {
  const allReviews = await Review.find({
    course:    courseId,
    isVisible: true,
  }).session(session);

  const totalRatings  = allReviews.length;
  const averageRating =
    totalRatings > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

  await Course.findByIdAndUpdate(
    courseId,
    {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
    },
    { session }
  );
};

// ─── createReview ────────────────────────────────────────────────────────────

const createReview = async (userId, courseId, reviewData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rating, review } = reviewData;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw APIError.validation("Invalid course ID");
    }

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      throw APIError.notFound("Course");
    }

    // Must be enrolled to review
    const enrollment = await Enrollment.findOne({
      user:   userId,
      course: courseId,
      status: "Active",
    }).session(session);

    if (!enrollment) {
      throw APIError.authorization(
        "You must be enrolled in this course to leave a review"
      );
    }

    // One review per student per course
    const existing = await Review.findOne({
      course: courseId,
      user:   userId,
    }).session(session);

    if (existing) {
      throw APIError.conflict("You have already reviewed this course");
    }

    if (!review || review.trim().length < 10) {
      throw APIError.validation("Review must be at least 10 characters");
    }

    const newReview = await Review.create(
      [{
        user:                userId,
        course:              courseId,
        rating:              Number(rating),
        review:              review.trim(),
        isVerifiedPurchase:  true,
        isVisible:           true,
      }],
      { session }
    );

    await _recalcCourseRating(courseId, session);

    // Notify instructor
    await Notification.create(
      [{
        user:      course.instructor,
        title:     "New Review",
        message:   `A student left a ${rating}★ review on "${course.title}"`,
        type:      "review",
        link:      `/instructor/courses/${courseId}/reviews`,
        relatedId: courseId,
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    logger.info("Review created", { courseId, userId, rating });

    return {
      success: true,
      message: "Review submitted successfully",
      review:  newReview[0],
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Create review error", error);
    throw error;
  }
};

// ─── getCourseReviews ────────────────────────────────────────────────────────

const getCourseReviews = async (courseId, page = 1, limit = 10) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw APIError.validation("Invalid course ID");
  }

  const skip  = (page - 1) * limit;
  const query = { course: courseId, isVisible: true };

  const total   = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate("user", "firstName lastName avatar")
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit))
    .lean();

  return {
    success: true,
    data: reviews,
    pagination: {
      total,
      page:  parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

// ─── updateReview ────────────────────────────────────────────────────────────

const updateReview = async (reviewId, userId, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      throw APIError.validation("Invalid review ID");
    }

    const review = await Review.findById(reviewId).session(session);
    if (!review) {
      throw APIError.notFound("Review");
    }

    if (review.user.toString() !== userId.toString()) {
      throw APIError.authorization("Not authorized to update this review");
    }

    if (updateData.rating !== undefined) {
      review.rating = Number(updateData.rating);
    }
    if (updateData.review !== undefined) {
      if (updateData.review.trim().length < 10) {
        throw APIError.validation("Review must be at least 10 characters");
      }
      review.review = updateData.review.trim();
    }

    await review.save({ session });
    await _recalcCourseRating(review.course, session);

    await session.commitTransaction();
    session.endSession();

    logger.info("Review updated", { reviewId });

    return {
      success: true,
      message: "Review updated successfully",
      review,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Update review error", error);
    throw error;
  }
};

// ─── deleteReview ────────────────────────────────────────────────────────────

const deleteReview = async (reviewId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      throw APIError.validation("Invalid review ID");
    }

    const review = await Review.findById(reviewId).session(session);
    if (!review) {
      throw APIError.notFound("Review");
    }

    if (review.user.toString() !== userId.toString()) {
      throw APIError.authorization("Not authorized to delete this review");
    }

    const courseId = review.course;
    await Review.findByIdAndDelete(reviewId, { session });
    await _recalcCourseRating(courseId, session);

    await session.commitTransaction();
    session.endSession();

    logger.info("Review deleted", { reviewId });

    return { success: true, message: "Review deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Delete review error", error);
    throw error;
  }
};

// ─── replyToReview ───────────────────────────────────────────────────────────

const replyToReview = async (reviewId, instructorId, replyText) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw APIError.validation("Invalid review ID");
  }

  const review = await Review.findById(reviewId).populate("course", "instructor");
  if (!review) {
    throw APIError.notFound("Review");
  }

  // Verify the replying user is the course instructor
  if (review.course.instructor.toString() !== instructorId.toString()) {
    throw APIError.authorization(
      "Only the course instructor can reply to reviews"
    );
  }

  review.instructorReply = { text: replyText.trim(), repliedAt: new Date() };
  await review.save();

  logger.info("Instructor replied to review", { reviewId, instructorId });

  return {
    success: true,
    message: "Reply posted successfully",
    review,
  };
};

module.exports = {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  replyToReview,
};