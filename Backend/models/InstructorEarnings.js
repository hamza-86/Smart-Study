const mongoose = require("mongoose");

const instructorEarningsSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    grossAmount: {
      // what student paid
      type: Number,
      required: true,
    },
    platformFeePercent: {
      type: Number,
      default: 30,
    },
    platformFeeAmount: {
      type: Number,
      required: true,
    },
    netEarning: {
      // instructor's cut
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["Pending", "Settled", "Refunded"],
      default: "Pending",
      index: true,
    },
    settledAt: {
      type: Date,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InstructorEarning", instructorEarningsSchema);