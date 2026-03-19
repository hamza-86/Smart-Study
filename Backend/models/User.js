const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ── Core identity ──────────────────────────────────────────
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },
    accountType: {
      type: String,
      enum: ["Student", "Instructor", "Admin"],
      default: "Student",
      index: true,
    },

    // ── Verification & Auth ────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },

    // ── Password Reset ─────────────────────────────────────────
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },
    passwordResetOtpHash: {
      type: String,
      select: false,
    },
    passwordResetOtpExpiry: {
      type: Date,
      select: false,
    },
    passwordResetOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    passwordResetOtpLastSentAt: {
      type: Date,
      select: false,
    },

    // ── Profile ────────────────────────────────────────────────
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    avatarPublicId: {
      type: String,
      default: "",
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },

    // ── Instructor specific ────────────────────────────────────
    headline: {
      // e.g. "Full Stack Developer | Udemy Instructor"
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    twitter: {
      type: String,
      trim: true,
      default: "",
    },
    linkedin: {
      type: String,
      trim: true,
      default: "",
    },
    youtube: {
      type: String,
      trim: true,
      default: "",
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    pendingPayout: {
      type: Number,
      default: 0,
    },
    stripeAccountId: {
      // or Razorpay linked account
      type: String,
      select: false,
    },

    // ── Student: enrolled courses & progress refs ──────────────
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseProgress",
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    // ── Notifications ──────────────────────────────────────────
    notificationPreferences: {
      emailOnEnrollment: { type: Boolean, default: true },
      emailOnReview: { type: Boolean, default: true },
      emailOnAnnouncement: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: full name
userSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for password reset token lookups
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });

module.exports = mongoose.model("User", userSchema);
