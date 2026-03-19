/**
 * Instructor Service
 * Dashboard stats, earnings, student analytics, watch/quiz analytics
 */

const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const InstructorEarnings = require("../models/InstructorEarnings");
const CourseProgress = require("../models/CourseProgress");
const QuizAttempt = require("../models/QuizAttempt");
const WatchHistory = require("../models/Watchhistory");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");

// ─── getDashboardStats ───────────────────────────────────────────────────────

const getDashboardStats = async (instructorId) => {
  const courses = await Course.find({ instructor: instructorId }).select(
    "_id title thumbnail status totalStudents averageRating totalRatings totalDuration totalLectures"
  );

  const courseIds = courses.map((c) => c._id);

  // Earnings summary
  const earningsAgg = await InstructorEarning.aggregate([
    { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
    {
      $group: {
        _id: "$status",
        total: { $sum: "$netEarning" },
        count: { $sum: 1 },
      },
    },
  ]);

  const earnings = { Pending: 0, Settled: 0, Refunded: 0, total: 0 };
  earningsAgg.forEach((e) => {
    earnings[e._id] = e.total;
  });
  earnings.total = earnings.Pending + earnings.Settled;

  // Monthly revenue (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyRevenue = await InstructorEarning.aggregate([
    {
      $match: {
        instructor: new mongoose.Types.ObjectId(instructorId),
        earnedAt: { $gte: twelveMonthsAgo },
        status: { $ne: "Refunded" },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$earnedAt" },
          month: { $month: "$earnedAt" },
        },
        revenue: { $sum: "$netEarning" },
        enrollments: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Course-level revenue map
  const courseRevAgg = await InstructorEarning.aggregate([
    {
      $match: {
        instructor: new mongoose.Types.ObjectId(instructorId),
        status: { $ne: "Refunded" },
      },
    },
    {
      $group: {
        _id: "$course",
        revenue: { $sum: "$netEarning" },
        enrollments: { $sum: 1 },
      },
    },
  ]);
  const courseRevMap = {};
  courseRevAgg.forEach((c) => {
    courseRevMap[c._id.toString()] = {
      revenue: c.revenue,
      enrollments: c.enrollments,
    };
  });

  const coursesWithStats = courses.map((c) => ({
    ...c.toObject(),
    revenue: courseRevMap[c._id.toString()]?.revenue || 0,
    paidEnrollments: courseRevMap[c._id.toString()]?.enrollments || 0,
  }));

  // Recent enrollments (last 8)
  const recentEnrollments = await Enrollment.find({
    course: { $in: courseIds },
  })
    .sort("-enrolledAt")
    .limit(8)
    .populate("user", "firstName lastName avatar email")
    .populate("course", "title thumbnail")
    .lean();

  // Overall stats
  const totalStudents = courses.reduce((s, c) => s + c.totalStudents, 0);
  const totalRatings = courses.reduce((s, c) => s + c.totalRatings, 0);
  const avgRating =
    courses.reduce((s, c) => s + c.averageRating * c.totalRatings, 0) /
    (totalRatings || 1);

  return {
    stats: {
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.status === "Published").length,
      draftCourses: courses.filter((c) => c.status === "Draft").length,
      totalStudents,
      averageRating: Math.round(avgRating * 10) / 10,
      totalEarnings: earnings.total,
      pendingPayout: earnings.Pending,
      settledPayout: earnings.Settled,
    },
    monthlyRevenue,
    courses: coursesWithStats,
    recentEnrollments,
  };
};

// ─── getStudents ─────────────────────────────────────────────────────────────

const getStudents = async (instructorId, { courseId, page = 1, limit = 20 }) => {
  let courseFilter = { instructor: instructorId };
  if (courseId) courseFilter._id = courseId;

  const courses = await Course.find(courseFilter).select("_id title");
  const courseIds = courses.map((c) => c._id);

  const skip = (page - 1) * limit;
  const total = await Enrollment.countDocuments({
    course: { $in: courseIds },
    status: "Active",
  });

  const enrollments = await Enrollment.find({
    course: { $in: courseIds },
    status: "Active",
  })
    .sort("-enrolledAt")
    .skip(skip)
    .limit(Number(limit))
    .populate("user", "firstName lastName email avatar createdAt")
    .populate("course", "title thumbnail")
    .lean();

  // Attach progress
  const progressList = await CourseProgress.find({
    courseId: { $in: courseIds },
  }).lean();

  const progressMap = {};
  progressList.forEach((p) => {
    progressMap[`${p.userId}_${p.courseId}`] = p;
  });

  const data = enrollments.map((e) => ({
    student: e.user,
    course: e.course,
    enrolledAt: e.enrolledAt,
    amountPaid: e.amountPaid,
    progress:
      progressMap[`${e.user?._id}_${e.course?._id}`] || null,
  }));

  return {
    success: true,
    data,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
  };
};

// ─── getEarnings ─────────────────────────────────────────────────────────────

const getEarnings = async (instructorId, { status, page = 1, limit = 20 }) => {
  const filter = { instructor: instructorId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const total = await InstructorEarning.countDocuments(filter);

  const data = await InstructorEarning.find(filter)
    .sort("-earnedAt")
    .skip(skip)
    .limit(Number(limit))
    .populate("course", "title thumbnail")
    .populate("student", "firstName lastName avatar")
    .lean();

  return {
    success: true,
    data,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
  };
};

// ─── getWatchAnalytics ───────────────────────────────────────────────────────

const getWatchAnalytics = async (instructorId, courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw APIError.validation("Invalid course ID");
  }

  const course = await Course.findOne({ _id: courseId, instructor: instructorId });
  if (!course) {
    throw APIError.authorization("Not authorized or course not found");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyWatchTime = await WatchHistory.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
        lastWatchedAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$lastWatchedAt" },
        },
        totalMinutes: { $sum: { $divide: ["$watchedSeconds", 60] } },
        uniqueStudents: { $addToSet: "$user" },
      },
    },
    {
      $project: {
        date: "$_id",
        totalMinutes: { $round: ["$totalMinutes", 1] },
        uniqueStudents: { $size: "$uniqueStudents" },
      },
    },
    { $sort: { date: 1 } },
  ]);

  const topLectures = await WatchHistory.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: "$subSection",
        totalWatches: { $sum: "$watchCount" },
        avgCompletion: {
          $avg: {
            $cond: [
              { $gt: ["$totalSeconds", 0] },
              { $divide: ["$watchedSeconds", "$totalSeconds"] },
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "subsections",
        localField: "_id",
        foreignField: "_id",
        as: "lecture",
      },
    },
    { $unwind: "$lecture" },
    {
      $project: {
        title: "$lecture.title",
        totalWatches: 1,
        avgCompletion: {
          $round: [{ $multiply: ["$avgCompletion", 100] }, 1],
        },
      },
    },
    { $sort: { totalWatches: -1 } },
    { $limit: 10 },
  ]);

  return { dailyWatchTime, topLectures };
};

// ─── getQuizAnalytics ────────────────────────────────────────────────────────

const getQuizAnalytics = async (instructorId) => {
  const courses = await Course.find({ instructor: instructorId }).select("_id");
  const courseIds = courses.map((c) => c._id);

  const quizStats = await QuizAttempt.aggregate([
    { $match: { course: { $in: courseIds } } },
    {
      $group: {
        _id: "$quiz",
        avgScore: { $avg: "$scorePercent" },
        attempts: { $sum: 1 },
        passed: { $sum: { $cond: ["$passed", 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "quizzes",
        localField: "_id",
        foreignField: "_id",
        as: "quiz",
      },
    },
    { $unwind: "$quiz" },
    {
      $project: {
        quizTitle: "$quiz.title",
        avgScore: { $round: ["$avgScore", 1] },
        attempts: 1,
        passed: 1,
        passRate: {
          $round: [
            { $multiply: [{ $divide: ["$passed", "$attempts"] }, 100] },
            1,
          ],
        },
      },
    },
    { $sort: { attempts: -1 } },
  ]);

  return { success: true, quizStats };
};

module.exports = {
  getDashboardStats,
  getStudents,
  getEarnings,
  getWatchAnalytics,
  getQuizAnalytics,
};