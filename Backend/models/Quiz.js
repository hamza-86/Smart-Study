const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    questionType: {
      type: String,
      enum: ["MCQ", "MultiSelect", "TrueFalse", "ShortAnswer"],
      default: "MCQ",
    },
    options: [
      {
        text: { type: String, required: true, trim: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    // For ShortAnswer type
    correctAnswer: {
      type: String,
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
    marks: {
      type: Number,
      default: 1,
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    subSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
      index: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
    questions: [questionSchema],
    passingScore: {
      // percentage 0-100
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    timeLimit: {
      // in minutes, 0 = no limit
      type: Number,
      default: 0,
    },
    maxAttempts: {
      // 0 = unlimited
      type: Number,
      default: 0,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    showAnswers: {
      // show correct answers after submission
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);