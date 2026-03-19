const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },

    // ── Video ──────────────────────────────────────────────────
    videoUrl: {
      type: String,
      required: true,
    },
    videoPublicId: {
      // Cloudinary / S3 key for deletion
      type: String,
      select: false,
    },
    timeDuration: {
      // in seconds
      type: Number,
      required: true,
      default: 0,
    },
    isPreview: {
      // free preview lecture viewable without enrollment
      type: Boolean,
      default: false,
    },

    // ── Attachments / Notes ────────────────────────────────────
    attachments: [
      {
        name: { type: String, trim: true },
        url: { type: String },
        type: { type: String, enum: ["pdf", "doc", "zip", "image", "other"] },
      },
    ],

    // ── Quizzes linked to this lecture ─────────────────────────
    quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.SubSection || mongoose.model("SubSection", subSectionSchema);