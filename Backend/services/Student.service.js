/**
 * Student Service
 * Dashboard stats, notifications, certificates
 */

const Enrollment = require("../models/Enrollment");
const CourseProgress = require("../models/CourseProgress");
const WatchHistory = require("../models/Watchhistory");
const QuizAttempt = require("../models/QuizAttempt");
const Certificate = require("../models/Certificate");
const Notification = require("../models/Notification");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");

// ─── getStudentDashboard ─────────────────────────────────────────────────────

const getStudentDashboard = async (userId) => {
  // Enrolled courses + progress
  const enrollments = await Enrollment.find({ user: userId, status: "Active" })
    .populate({
      path: "course",
      select: "title thumbnail instructor totalLectures totalDuration averageRating level",
      populate: { path: "instructor", select: "firstName lastName avatar" },
    })
    .lean();

  const progressList = await CourseProgress.find({ userId })
    .populate("certificate")
    .lean();

  const progressMap = {};
  progressList.forEach((p) => {
    progressMap[p.courseId.toString()] = p;
  });

  const coursesWithProgress = enrollments.map((e) => ({
    course: e.course,
    enrolledAt: e.enrolledAt,
    progress: progressMap[e.course?._id?.toString()] || null,
  }));

  // Total watch time
  const watchAgg = await WatchHistory.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: { $divide: ["$watchedSeconds", 60] } },
      },
    },
  ]);
  const totalWatchMinutes = Math.round(watchAgg[0]?.totalMinutes || 0);

  // Quiz stats
  const quizAgg = await QuizAttempt.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        attempts: { $sum: 1 },
        passed: { $sum: { $cond: ["$passed", 1, 0] } },
        avgScore: { $avg: "$scorePercent" },
      },
    },
  ]);
  const quizStats = quizAgg[0] || { attempts: 0, passed: 0, avgScore: 0 };

  // Certificates
  const certificates = await Certificate.find({ user: userId })
    .populate("course", "title thumbnail")
    .lean();

  // Unread notifications count
  const unreadCount = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });

  // Recent activity (last 5 watched videos)
  const recentActivity = await WatchHistory.find({ user: userId })
    .sort("-lastWatchedAt")
    .limit(5)
    .populate("subSection", "title timeDuration")
    .populate("course", "title thumbnail")
    .lean();

  // Streak: distinct days with watch activity in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const streakDays = await WatchHistory.aggregate([
    {
      $match: {
        user: userId,
        lastWatchedAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$lastWatchedAt" },
        },
      },
    },
  ]);

  return {
    totalEnrolled: enrollments.length,
    totalCompleted: progressList.filter((p) => p.completionPercentage >= 100).length,
    totalWatchMinutes,
    certificates: certificates.length,
    unreadNotifications: unreadCount,
    quizStats: {
      totalAttempts: quizStats.attempts,
      passed: quizStats.passed,
      avgScore: Math.round(quizStats.avgScore || 0),
    },
    streakDays: streakDays.length,
    coursesWithProgress,
    certificateList: certificates,
    recentActivity,
  };
};

// ─── getNotifications ────────────────────────────────────────────────────────

const getNotifications = async (userId) => {
  const notifications = await Notification.find({ user: userId })
    .sort("-createdAt")
    .limit(50)
    .lean();

  return { success: true, notifications };
};

// ─── markNotificationsRead ───────────────────────────────────────────────────

const markNotificationsRead = async (userId, ids = []) => {
  const filter = { user: userId };
  if (ids.length > 0) filter._id = { $in: ids };

  await Notification.updateMany(filter, { $set: { isRead: true } });

  return { success: true, message: "Notifications marked as read" };
};

// ─── getCertificates ─────────────────────────────────────────────────────────

const getCertificates = async (userId) => {
  const certificates = await Certificate.find({ user: userId })
    .populate("course", "title thumbnail instructor")
    .sort("-issuedAt")
    .lean();

  return { success: true, certificates };
};

module.exports = {
  getStudentDashboard,
  getNotifications,
  markNotificationsRead,
  getCertificates,
};