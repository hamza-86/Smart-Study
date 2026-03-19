/**
 * Course Progress Controller
 * Handles video progress, watch history, completion, and certificate trigger
 */

const CourseProgress = require("../models/CourseProgress");
const WatchHistory = require("../models/Watchhistory");
const Course = require("../models/Course");
const Certificate = require("../models/Certificate");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const APIError = require("../utils/apiError");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../constants");
const { validateRequired } = require("../utils/validators");
const crypto = require("crypto");

/* ─── Helpers ──────────────────────────────────────────────────────────── */

/** Count total subsections across all sections of a course */
async function getTotalSubSections(courseId) {
  const course = await Course.findById(courseId).populate({
    path: "courseContent",
    select: "subSections",
  });
  if (!course) return 0;
  return course.courseContent.reduce(
    (sum, section) => sum + section.subSections.length,
    0
  );
}

/** Recalculate and persist completionPercentage on CourseProgress */
async function recalcCompletion(progress, courseId) {
  const total = await getTotalSubSections(courseId);
  progress.completionPercentage =
    total > 0 ? Math.round((progress.completedVideos.length / total) * 100) : 0;
  await progress.save();
  return progress.completionPercentage;
}

/** Issue certificate once course is 100% complete */
async function tryIssueCertificate(userId, courseId, progress) {
  if (progress.certificateIssued) return; // already issued

  const course = await Course.findById(courseId).select(
    "title hasCertificate instructor"
  );
  if (!course || !course.hasCertificate) return;

  const { User } = require("../models");
  const user = await User.findById(userId).select("firstName lastName email");
  if (!user) return;

  const uniqueCode = crypto
    .createHash("sha256")
    .update(`${userId}${courseId}${Date.now()}`)
    .digest("hex")
    .slice(0, 16)
    .toUpperCase();

  // Certificate URL: can be replaced with PDF generator later
  const certificateUrl = `${process.env.CLIENT_URL}/certificates/verify/${uniqueCode}`;

  const cert = await Certificate.create({
    user: userId,
    course: courseId,
    certificateUrl,
    uniqueCode,
  });

  progress.certificateIssued = true;
  progress.certificate = cert._id;
  await progress.save();

  await Notification.create({
    user: userId,
    title: "Certificate Earned! 🎓",
    message: `Congratulations! Your certificate for "${course.title}" is ready.`,
    type: "certificate",
    link: `/student/certificates/${cert._id}`,
    relatedId: cert._id,
  });
}

/* ─── Controllers ──────────────────────────────────────────────────────── */

/**
 * Update course progress — mark a video as complete
 * Called whenever user watches >= 90% of a video
 */
exports.updateCourseProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { courseId, subSectionId } = req.body;

  validateRequired(courseId, "Course ID");
  validateRequired(subSectionId, "SubSection ID");

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw APIError.validation("Invalid course ID");
  }
  if (!mongoose.Types.ObjectId.isValid(subSectionId)) {
    throw APIError.validation("Invalid subSection ID");
  }

  let progress = await CourseProgress.findOne({ userId, courseId });

  if (!progress) {
    progress = await CourseProgress.create({
      userId,
      courseId,
      completedVideos: [subSectionId],
      lastWatchedVideo: subSectionId,
      lastAccessedAt: new Date(),
    });
  } else {
    // Update last watched regardless
    progress.lastWatchedVideo = subSectionId;
    progress.lastAccessedAt = new Date();

    if (!progress.completedVideos.includes(subSectionId)) {
      progress.completedVideos.push(subSectionId);
    }
    await progress.save();
  }

  const completionPercentage = await recalcCompletion(progress, courseId);

  // Trigger certificate if fully complete
  if (completionPercentage >= 100) {
    await tryIssueCertificate(userId, courseId, progress);
  }

  res.status(HTTP_STATUS.OK).json(
    APIResponse.success(
      { completionPercentage, completedVideos: progress.completedVideos },
      "Progress updated"
    )
  );
});

/**
 * Update watch time — called periodically while video is playing
 */
exports.updateWatchTime = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { courseId, subSectionId, watchedSeconds, totalSeconds, lastPosition } =
    req.body;

  validateRequired(courseId, "Course ID");
  validateRequired(subSectionId, "SubSection ID");

  // Upsert watch history entry
  const history = await WatchHistory.findOneAndUpdate(
    { user: userId, subSection: subSectionId },
    {
      $set: {
        course: courseId,
        totalSeconds: totalSeconds || 0,
        lastPosition: lastPosition || 0,
        lastWatchedAt: new Date(),
      },
      $max: { watchedSeconds: watchedSeconds || 0 },
    },
    { upsert: true, new: true }
  );

  // Auto-complete if watched >= 90%
  const watchRatio =
    history.totalSeconds > 0
      ? history.watchedSeconds / history.totalSeconds
      : 0;

  let completionPercentage = null;

  if (watchRatio >= 0.9 && !history.completed) {
    history.completed = true;
    await history.save();

    // Mark video as complete in progress
    let progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress) {
      progress = await CourseProgress.create({
        userId,
        courseId,
        completedVideos: [subSectionId],
        lastWatchedVideo: subSectionId,
        lastAccessedAt: new Date(),
      });
    } else if (!progress.completedVideos.includes(subSectionId)) {
      progress.completedVideos.push(subSectionId);
      progress.lastWatchedVideo = subSectionId;
      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    completionPercentage = await recalcCompletion(progress, courseId);

    if (completionPercentage >= 100) {
      await tryIssueCertificate(userId, courseId, progress);
    }
  }

  // Keep lastAccessedAt fresh on CourseProgress
  await CourseProgress.findOneAndUpdate(
    { userId, courseId },
    { $set: { lastWatchedVideo: subSectionId, lastAccessedAt: new Date() } }
  );

  res.status(HTTP_STATUS.OK).json(
    APIResponse.success(
      {
        lastPosition: history.lastPosition,
        completed: history.completed,
        completionPercentage,
      },
      "Watch time updated"
    )
  );
});

/**
 * Get course progress
 */
exports.getCourseProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw APIError.validation("Invalid course ID");
  }

  const course = await Course.findById(courseId).populate({
    path: "courseContent",
    select: "subSections",
  });

  if (!course) {
    throw APIError.notFound("Course not found");
  }

  const totalSubSections = course.courseContent.reduce(
    (sum, s) => sum + s.subSections.length,
    0
  );

  const progress = await CourseProgress.findOne({ userId, courseId })
    .populate("certificate")
    .lean();

  const completedCount = progress ? progress.completedVideos.length : 0;
  const completionPercentage =
    totalSubSections > 0
      ? Math.round((completedCount / totalSubSections) * 100)
      : 0;

  res.status(HTTP_STATUS.OK).json(
    APIResponse.success(
      {
        completedVideos: progress ? progress.completedVideos : [],
        lastWatchedVideo: progress?.lastWatchedVideo || null,
        lastAccessedAt: progress?.lastAccessedAt || null,
        totalSubSections,
        completedCount,
        completionPercentage,
        certificateIssued: progress?.certificateIssued || false,
        certificate: progress?.certificate || null,
        quizScores: progress?.quizScores || [],
      },
      "Progress retrieved"
    )
  );
});

/**
 * Get resume info — last watched video + position
 */
exports.getResumeInfo = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw APIError.validation("Invalid course ID");
  }

  const progress = await CourseProgress.findOne({ userId, courseId })
    .populate("lastWatchedVideo", "title videoUrl timeDuration")
    .lean();

  let lastPosition = 0;
  if (progress?.lastWatchedVideo) {
    const history = await WatchHistory.findOne({
      user: userId,
      subSection: progress.lastWatchedVideo._id,
    }).select("lastPosition");
    lastPosition = history?.lastPosition || 0;
  }

  res.status(HTTP_STATUS.OK).json(
    APIResponse.success(
      {
        lastWatchedVideo: progress?.lastWatchedVideo || null,
        lastPosition,
        completionPercentage: progress?.completionPercentage || 0,
        lastAccessedAt: progress?.lastAccessedAt || null,
      },
      "Resume info retrieved"
    )
  );
});

/**
 * Get all progress for student dashboard
 */
exports.getAllProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const progressList = await CourseProgress.find({ userId })
    .populate("courseId", "title thumbnail totalLectures totalDuration instructor")
    .populate("certificate")
    .lean();

  res.status(HTTP_STATUS.OK).json(
    APIResponse.success(progressList, "All progress retrieved")
  );
});