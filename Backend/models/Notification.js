const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "enrollment",   // student enrolled in your course
        "review",       // student left a review
        "quiz",         // quiz submitted
        "assignment",   // assignment submitted / graded
        "payment",      // payment success / refund
        "certificate",  // certificate issued
        "system",       // platform announcements
        "message",      // direct message
      ],
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      // frontend route to navigate to on click
      type: String,
      default: "",
    },
    relatedId: {
      // ObjectId of the related resource (course, quiz, etc.)
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);