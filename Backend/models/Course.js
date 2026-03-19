const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    // ── Core info ──────────────────────────────────────────────
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
    },
    thumbnailPublicId: {
      type: String,
      select: false,
    },
    previewVideo: {
      // Free preview trailer
      type: String,
    },
    previewVideoPublicId: {
      type: String,
      select: false,
    },

    // ── Taxonomy ───────────────────────────────────────────────
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    language: {
      type: String,
      default: "English",
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      default: "All Levels",
    },

    // ── Pricing ────────────────────────────────────────────────
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discountedPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    isFree: {
      type: Boolean,
      default: false,
    },

    // ── Instructor ─────────────────────────────────────────────
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ── Content ────────────────────────────────────────────────
    courseContent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
      },
    ],
    totalDuration: {
      // in minutes — recomputed on save
      type: Number,
      default: 0,
    },
    totalLectures: {
      type: Number,
      default: 0,
    },
    totalSections: {
      type: Number,
      default: 0,
    },

    // ── Learning outcomes ──────────────────────────────────────
    whatYouWillLearn: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    targetAudience: [
      {
        type: String,
        trim: true,
      },
    ],
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    // ── Students ───────────────────────────────────────────────
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalStudents: {
      type: Number,
      default: 0,
    },

    // ── Ratings ────────────────────────────────────────────────
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },

    // ── Publishing ─────────────────────────────────────────────
    status: {
      type: String,
      enum: ["Draft", "UnderReview", "Published", "Archived"],
      default: "Draft",
      index: true,
    },
    publishedAt: {
      type: Date,
    },

    // ── Certificate ────────────────────────────────────────────
    hasCertificate: {
      type: Boolean,
      default: true,
    },

    // ── Revenue share ──────────────────────────────────────────
    instructorRevenuePercent: {
      // e.g. 70 means instructor gets 70%
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual: effective price
courseSchema.virtual("effectivePrice").get(function () {
  return this.discountedPrice != null ? this.discountedPrice : this.price;
});

// Full-text search
courseSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Course", courseSchema);