/**
 * Payment Service
 * Handles payment orders, verification, enrollment, and free course access
 */

const { instance, hasRazorpayConfig } = require("../config/razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");
const CourseProgress = require("../models/CourseProgress");
const InstructorEarning = require("../models/InstructorEarnings");
const Notification = require("../models/Notification");
const Coupon = require("../models/Coupon.js");
const mailSender = require("../utils/mailSender");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");

// ─── Shared: complete enrollment for one course ──────────────────────────────

const _enrollStudent = async (userId, courseId, amountPaid, paymentId, session) => {
  // Prevent duplicate enrollment
  const existing = await Enrollment.findOne({
    user: userId,
    course: courseId,
  }).session(session);

  if (existing) {
    if (existing.status === "Active") {
      throw APIError.conflict(`Already enrolled in course ${courseId}`);
    }
    // Reactivate if previously cancelled/refunded
    existing.status = "Active";
    await existing.save({ session });
  } else {
    await Enrollment.create(
      [{ user: userId, course: courseId, payment: paymentId, amountPaid, status: "Active" }],
      { session }
    );
  }

  // Add course to user.courses
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { courses: courseId } },
    { session }
  );

  const courseBefore = await Course.findById(courseId)
    .select("studentsEnrolled")
    .session(session);
  const alreadyInStudentList = courseBefore?.studentsEnrolled?.some(
    (id) => id.toString() === userId.toString()
  );

  await Course.findByIdAndUpdate(
    courseId,
    {
      $addToSet: { studentsEnrolled: userId },
      ...(alreadyInStudentList ? {} : { $inc: { totalStudents: 1 } }),
    },
    { session }
  );

  // Initialize course progress
  await CourseProgress.findOneAndUpdate(
    { userId, courseId },
    { $setOnInsert: { userId, courseId, completedVideos: [], completionPercentage: 0 } },
    { upsert: true, session, new: true }
  );

  // Instructor earnings
  const course = await Course.findById(courseId)
    .select("instructor title instructorRevenuePercent")
    .session(session);

  if (amountPaid > 0 && course) {
    const revenuePercent = course.instructorRevenuePercent || 70;
    const platformPercent = 100 - revenuePercent;
    const platformFee = (amountPaid * platformPercent) / 100;
    const netEarning = amountPaid - platformFee;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId }).session(session);

    await InstructorEarning.create(
      [{
        instructor: course.instructor,
        course: courseId,
        enrollment: enrollment._id,
        student: userId,
        grossAmount: amountPaid,
        platformFeePercent: platformPercent,
        platformFeeAmount: platformFee,
        netEarning,
        status: "Pending",
      }],
      { session }
    );

    await User.findByIdAndUpdate(
      course.instructor,
      { $inc: { totalEarnings: netEarning, pendingPayout: netEarning } },
      { session }
    );
  }
};

// ─── createPaymentOrder ──────────────────────────────────────────────────────

const createPaymentOrder = async (userId, courseIds, couponCode = null) => {
  if (!hasRazorpayConfig || !instance) {
    throw APIError.externalAPI("Payment gateway is not configured on server");
  }

  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    throw APIError.validation("Please provide valid course IDs");
  }

  let totalAmount = 0;
  const courses = [];

  for (const courseId of courseIds) {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw APIError.validation(`Invalid course ID: ${courseId}`);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw APIError.notFound(`Course ${courseId}`);
    }
    if (course.status !== "Published") {
      throw APIError.validation(`Course "${course.title}" is not available`);
    }

    // Check not already enrolled
    const already = await Enrollment.findOne({
      user: userId,
      course: courseId,
      status: "Active",
    });
    if (already) {
      throw APIError.conflict(`Already enrolled in "${course.title}"`);
    }

    const price = course.discountedPrice ?? course.price;
    totalAmount += price;
    courses.push(course);
  }

  // Apply coupon
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (!coupon) {
      throw APIError.validation("Invalid or expired coupon code");
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw APIError.validation("Coupon usage limit reached");
    }
    if (coupon.usagePerUser > 0) {
      const userUsed = coupon.usedBy.filter(
        (id) => id.toString() === userId.toString()
      ).length;
      if (userUsed >= coupon.usagePerUser) {
        throw APIError.validation("You have already used this coupon");
      }
    }
    if (totalAmount < coupon.minOrderAmount) {
      throw APIError.validation(
        `Minimum order amount ₹${coupon.minOrderAmount} required for this coupon`
      );
    }

    if (coupon.discountType === "Percentage") {
      const discount = (totalAmount * coupon.discountValue) / 100;
      const capped = coupon.maxDiscountAmount
        ? Math.min(discount, coupon.maxDiscountAmount)
        : discount;
      totalAmount = Math.max(0, totalAmount - capped);
    } else {
      totalAmount = Math.max(0, totalAmount - coupon.discountValue);
    }
  }

  // If total is zero after coupon, route to free enrollment
  if (totalAmount === 0) {
    return { isFree: true, courses, amount: 0 };
  }

  const receiptId = `rcpt_${Date.now()}`;

  const order = await instance.orders.create({
    amount: Math.round(totalAmount * 100), // paise
    currency: "INR",
    receipt: receiptId,
    notes: { userId: userId.toString(), courseIds: courseIds.join(",") },
  });

  // Store pending payment record
  await Payment.create({
    user: userId,
    courses: courseIds,
    razorpayOrderId: order.id,
    amount: totalAmount,
    currency: "INR",
    receipt: receiptId,
    status: "Pending",
  });

  logger.info("Payment order created", { userId, orderId: order.id, amount: totalAmount });

  return {
    isFree: false,
    order,
    courses,
    amount: totalAmount,
    currency: "INR",
  };
};

// ─── verifyPayment ───────────────────────────────────────────────────────────

const verifyPayment = async (paymentData) => {
  if (!hasRazorpayConfig || !process.env.RAZORPAY_SECRET) {
    throw APIError.externalAPI("Payment gateway is not configured on server");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseIds,
      userId,
    } = paymentData;

    // Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw APIError.authentication("Payment verification failed — invalid signature");
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "Completed",
      },
      { new: true, session }
    );

    if (!payment) {
      throw APIError.notFound("Payment record");
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw APIError.notFound("User");
    }

    // Enroll in each course
    const amountPerCourse = payment.amount / courseIds.length;
    for (const courseId of courseIds) {
      await _enrollStudent(userId, courseId, amountPerCourse, payment._id, session);
    }

    await session.commitTransaction();
    session.endSession();

    // Post-transaction: send emails + notifications (fire-and-forget)
    _sendEnrollmentEmails(user, courseIds).catch((err) =>
      logger.error("Enrollment email error", err)
    );

    logger.info("Payment verified, enrollment complete", {
      userId,
      paymentId: razorpay_payment_id,
      courseCount: courseIds.length,
    });

    return { success: true, message: "Payment verified and enrolled successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Verify payment error", error);
    throw error;
  }
};

// ─── enrollFreeCourse ────────────────────────────────────────────────────────

const enrollFreeCourse = async (userId, courseId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const course = await Course.findById(courseId).session(session);
    if (!course) {
      throw APIError.notFound("Course");
    }
    if (course.status !== "Published") {
      throw APIError.validation("Course is not available");
    }

    const effectivePrice = course.discountedPrice ?? course.price;
    if (effectivePrice > 0) {
      throw APIError.validation("This course is not free. Please pay to enroll.");
    }

    // Create a zero-amount payment record
    const payment = await Payment.create(
      [{
        user: userId,
        courses: [courseId],
        amount: 0,
        currency: "INR",
        status: "Completed",
        receipt: `free_${Date.now()}`,
      }],
      { session }
    );

    await _enrollStudent(userId, courseId, 0, payment[0]._id, session);

    await session.commitTransaction();
    session.endSession();

    const user = await User.findById(userId);
    _sendEnrollmentEmails(user, [courseId]).catch((err) =>
      logger.error("Free enroll email error", err)
    );

    logger.info("Free course enrolled", { userId, courseId });

    return { success: true, message: "Enrolled successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Free enroll error", error);
    throw error;
  }
};

// ─── getEnrolledCourses ──────────────────────────────────────────────────────

const getEnrolledCourses = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const total = await Enrollment.countDocuments({
    user: userId,
    status: "Active",
  });

  const enrollments = await Enrollment.find({ user: userId, status: "Active" })
    .populate({
      path: "course",
      select: "title thumbnail instructor totalLectures totalDuration averageRating level",
      populate: { path: "instructor", select: "firstName lastName avatar" },
    })
    .sort("-enrolledAt")
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Attach progress
  const progressList = await CourseProgress.find({ userId }).lean();
  const progressMap = {};
  progressList.forEach((p) => {
    progressMap[p.courseId.toString()] = p;
  });

  const data = enrollments.map((e) => ({
    ...e.course,
    enrolledAt: e.enrolledAt,
    amountPaid: e.amountPaid,
    progress: progressMap[e.course?._id?.toString()] || null,
  }));

  return {
    success: true,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

// ─── _sendEnrollmentEmails (fire-and-forget helper) ──────────────────────────

const _sendEnrollmentEmails = async (user, courseIds) => {
  for (const courseId of courseIds) {
    const course = await Course.findById(courseId)
      .populate("instructor", "firstName email")
      .lean();
    if (!course) continue;

    // To student
    await mailSender(
      user.email,
      `Enrolled: ${course.title}`,
      `<p>Hi ${user.firstName}, you are now enrolled in <strong>${course.title}</strong>. Happy learning!</p>`
    );

    // To instructor
    if (course.instructor?.email) {
      await mailSender(
        course.instructor.email,
        `New enrollment in "${course.title}"`,
        `<p>${user.firstName} ${user.lastName} just enrolled in your course <strong>${course.title}</strong>.</p>`
      );
    }

    // In-app notification to instructor
    await Notification.create({
      user: course.instructor._id,
      title: "New Enrollment!",
      message: `${user.firstName} ${user.lastName} enrolled in "${course.title}"`,
      type: "enrollment",
      link: `/instructor/courses/${course._id}/students`,
      relatedId: course._id,
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  enrollFreeCourse,
  getEnrolledCourses,
};
