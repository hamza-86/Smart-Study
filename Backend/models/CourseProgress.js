const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    // ── Video progress ─────────────────────────────────────────
    completedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection",
      },
    ],
    lastWatchedVideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },

    // ── Time stats ─────────────────────────────────────────────
    totalWatchedMinutes: {
      type: Number,
      default: 0,
    },

    // ── Completion ─────────────────────────────────────────────
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ── Certificate ────────────────────────────────────────────
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
    },

    // ── Quiz summary (best scores per quiz) ───────────────────
    quizScores: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        bestScore: { type: Number, default: 0 },
        attemptCount: { type: Number, default: 0 },
        passed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);