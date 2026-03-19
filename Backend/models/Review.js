const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    isVerifiedPurchase: {
      // true only if user has active enrollment
      type: Boolean,
      default: false,
    },
    instructorReply: {
      text: { type: String, trim: true },
      repliedAt: { type: Date },
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
