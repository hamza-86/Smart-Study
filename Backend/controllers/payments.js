const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const crypto = require("crypto");
const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mailTemplate/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mailTemplate/paymentSuccessEmail");

/* =========================================
   CAPTURE PAYMENT
========================================= */
exports.capturePayment = async (req, res) => {
  try {
    const { courses } = req.body;
    const userId = req.user.id;

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid course IDs",
      });
    }

    let totalAmount = 0;

    for (const courseId of courses) {
      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (course.studentsEnrolled.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "Already enrolled in one of the selected courses",
        });
      }

      totalAmount += course.price;
    }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    console.error("Capture Payment Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
    });
  }
};


/* =========================================
   VERIFY PAYMENT
========================================= */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courses,
    } = req.body;

    const userId = req.user.id;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courses ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    await enrollStudentsTransaction(courses, userId);

    return res.status(200).json({
      success: true,
      message: "Payment verified & enrollment successful",
    });

  } catch (error) {
    console.error("Verify Payment Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};


/* =========================================
   SEND PAYMENT SUCCESS EMAIL
========================================= */
exports.sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentId || !amount || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await User.findById(userId);

    await mailSender(
      user.email,
      "Payment Received",
      paymentSuccessEmail(
        user.name,
        amount / 100,
        orderId,
        paymentId
      )
    );

    return res.status(200).json({
      success: true,
      message: "Payment success email sent",
    });

  } catch (error) {
    console.error("Email Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};


/* =========================================
   ENROLL STUDENTS (TRANSACTION SAFE)
========================================= */
const enrollStudentsTransaction = async (courses, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const courseId of courses) {
      const course = await Course.findById(courseId).session(session);

      if (!course) throw new Error("Course not found");

      if (course.studentsEnrolled.includes(userId))
        throw new Error("Already enrolled");

      course.studentsEnrolled.push(userId);
      await course.save({ session });

      await User.findByIdAndUpdate(
        userId,
        { $push: { courses: courseId } },
        { session }
      );

      await mailSender(
        (await User.findById(userId)).email,
        `Enrolled in ${course.title}`,
        courseEnrollmentEmail(course.title, (await User.findById(userId)).name)
      );
    }

    await session.commitTransaction();
    session.endSession();

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};