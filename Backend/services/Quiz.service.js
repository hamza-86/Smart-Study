/**
 * Quiz Service
 * Handles quiz CRUD, student attempts, and grading
 */

const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");
const APIError = require("../utils/apiError");
const logger = require("../utils/logger");

// ─── createQuiz ──────────────────────────────────────────────────────────────

const createQuiz = async (instructorId, quizData) => {
  const {
    courseId,
    subSectionId,
    sectionId,
    title,
    description,
    questions,
    passingScore,
    timeLimit,
    maxAttempts,
    shuffleQuestions,
    showAnswers,
  } = quizData;

  // Verify course ownership
  const course = await Course.findOne({
    _id:       courseId,
    instructor: instructorId,
  });
  if (!course) {
    throw APIError.authorization("Not authorized or course not found");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw APIError.validation("At least one question is required");
  }

  const quiz = await Quiz.create({
    title,
    description,
    course:           courseId,
    subSection:       subSectionId || null,
    section:          sectionId    || null,
    questions,
    passingScore:     passingScore  ?? 60,
    timeLimit:        timeLimit     ?? 0,
    maxAttempts:      maxAttempts   ?? 0,
    shuffleQuestions: shuffleQuestions || false,
    showAnswers:      showAnswers !== false,
    isPublished:      true,
  });

  // Link quiz to SubSection if provided
  if (subSectionId) {
    await SubSection.findByIdAndUpdate(subSectionId, {
      $addToSet: { quizzes: quiz._id },
    });
  }

  logger.info("Quiz created", { quizId: quiz._id, courseId });

  return { success: true, message: "Quiz created successfully", quiz };
};

// ─── updateQuiz ──────────────────────────────────────────────────────────────

const updateQuiz = async (quizId, instructorId, updateData) => {
  const quiz = await Quiz.findById(quizId).populate("course", "instructor");
  if (!quiz) {
    throw APIError.notFound("Quiz");
  }

  if (quiz.course.instructor.toString() !== instructorId.toString()) {
    throw APIError.authorization("Not authorized to update this quiz");
  }

  const allowed = [
    "title", "description", "questions", "passingScore",
    "timeLimit", "maxAttempts", "shuffleQuestions", "showAnswers", "isPublished",
  ];
  allowed.forEach((f) => {
    if (updateData[f] !== undefined) quiz[f] = updateData[f];
  });

  await quiz.save();

  return { success: true, message: "Quiz updated successfully", quiz };
};

// ─── deleteQuiz ──────────────────────────────────────────────────────────────

const deleteQuiz = async (quizId, instructorId) => {
  const quiz = await Quiz.findById(quizId).populate("course", "instructor");
  if (!quiz) {
    throw APIError.notFound("Quiz");
  }

  if (quiz.course.instructor.toString() !== instructorId.toString()) {
    throw APIError.authorization("Not authorized to delete this quiz");
  }

  // Unlink from SubSection
  if (quiz.subSection) {
    await SubSection.findByIdAndUpdate(quiz.subSection, {
      $pull: { quizzes: quizId },
    });
  }

  await Quiz.findByIdAndDelete(quizId);

  return { success: true, message: "Quiz deleted successfully" };
};

// ─── getQuizForStudent (answers stripped) ────────────────────────────────────

const getQuizForStudent = async (quizId, userId) => {
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz || !quiz.isPublished) {
    throw APIError.notFound("Quiz");
  }

  // Check attempt limits
  if (quiz.maxAttempts > 0) {
    const count = await QuizAttempt.countDocuments({ quiz: quizId, user: userId });
    if (count >= quiz.maxAttempts) {
      throw APIError.validation(
        `Maximum ${quiz.maxAttempts} attempt(s) allowed for this quiz`
      );
    }
  }

  // Strip correct answers
  let questions = quiz.questions.map((q) => ({
    _id:          q._id,
    questionText: q.questionText,
    questionType: q.questionType,
    marks:        q.marks,
    options: q.options.map((o) => ({ _id: o._id, text: o.text })),
  }));

  if (quiz.shuffleQuestions) {
    questions = questions.sort(() => Math.random() - 0.5);
  }

  return {
    success: true,
    quiz: {
      _id:          quiz._id,
      title:        quiz.title,
      description:  quiz.description,
      timeLimit:    quiz.timeLimit,
      passingScore: quiz.passingScore,
      questions,
    },
  };
};

// ─── submitQuizAttempt ───────────────────────────────────────────────────────

const submitQuizAttempt = async (quizId, userId, submissionData) => {
  const { answers, timeTaken, courseId } = submissionData;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw APIError.notFound("Quiz");
  }

  // Attempt limit check
  const prevAttempts = await QuizAttempt.countDocuments({ quiz: quizId, user: userId });
  if (quiz.maxAttempts > 0 && prevAttempts >= quiz.maxAttempts) {
    throw APIError.validation("Maximum attempts reached");
  }

  // Grade answers
  let totalMarks    = 0;
  let obtainedMarks = 0;
  const gradedAnswers = [];

  for (const q of quiz.questions) {
    totalMarks += q.marks;

    const userAnswer = answers.find(
      (a) => a.questionId?.toString() === q._id.toString()
    );

    if (!userAnswer) {
      gradedAnswers.push({
        questionId:      q._id,
        selectedOptions: [],
        isCorrect:       false,
        marksObtained:   0,
      });
      continue;
    }

    let isCorrect     = false;
    let marksObtained = 0;

    if (q.questionType === "MCQ" || q.questionType === "TrueFalse") {
      const correctOpt = q.options.find((o) => o.isCorrect);
      isCorrect =
        userAnswer.selectedOptions?.length === 1 &&
        userAnswer.selectedOptions[0]?.toString() ===
          correctOpt?._id.toString();
      marksObtained = isCorrect ? q.marks : 0;
    } else if (q.questionType === "MultiSelect") {
      const correctIds = q.options
        .filter((o) => o.isCorrect)
        .map((o) => o._id.toString())
        .sort();
      const selectedIds = (userAnswer.selectedOptions || [])
        .map((id) => id.toString())
        .sort();
      isCorrect     = JSON.stringify(correctIds) === JSON.stringify(selectedIds);
      marksObtained = isCorrect ? q.marks : 0;
    } else if (q.questionType === "ShortAnswer") {
      isCorrect =
        userAnswer.textAnswer?.toLowerCase().trim() ===
        q.correctAnswer?.toLowerCase().trim();
      marksObtained = isCorrect ? q.marks : 0;
    }

    obtainedMarks += marksObtained;
    gradedAnswers.push({
      questionId:      q._id,
      selectedOptions: userAnswer.selectedOptions || [],
      textAnswer:      userAnswer.textAnswer,
      isCorrect,
      marksObtained,
    });
  }

  const scorePercent =
    totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  const passed = scorePercent >= quiz.passingScore;

  const attempt = await QuizAttempt.create({
    quiz:          quizId,
    user:          userId,
    course:        courseId,
    answers:       gradedAnswers,
    totalMarks,
    obtainedMarks,
    scorePercent,
    passed,
    timeTaken:     timeTaken || 0,
    attemptNumber: prevAttempts + 1,
  });

  // Sync quiz score into CourseProgress
  if (courseId) {
    const progress = await CourseProgress.findOne({ userId, courseId });
    if (progress) {
      const existing = progress.quizScores.find(
        (q) => q.quizId.toString() === quizId.toString()
      );
      if (existing) {
        existing.attemptCount += 1;
        if (scorePercent > existing.bestScore) {
          existing.bestScore = scorePercent;
          existing.passed    = passed;
        }
      } else {
        progress.quizScores.push({
          quizId,
          bestScore:    scorePercent,
          attemptCount: 1,
          passed,
        });
      }
      await progress.save();
    }
  }

  logger.info("Quiz submitted", {
    quizId,
    userId,
    scorePercent,
    passed,
  });

  const result = {
    scorePercent,
    obtainedMarks,
    totalMarks,
    passed,
    attemptNumber: prevAttempts + 1,
  };

  if (quiz.showAnswers) {
    result.gradedAnswers = gradedAnswers;
    result.questions     = quiz.questions; // full questions with correct answers
  }

  return result;
};

// ─── getMyAttempts ───────────────────────────────────────────────────────────

const getMyAttempts = async (quizId, userId) => {
  const attempts = await QuizAttempt.find({ quiz: quizId, user: userId })
    .sort("-submittedAt")
    .lean();

  return { success: true, attempts };
};

// ─── getAllAttempts (instructor) ─────────────────────────────────────────────

const getAllAttempts = async (quizId, instructorId) => {
  const quiz = await Quiz.findById(quizId).populate("course", "instructor");
  if (!quiz) {
    throw APIError.notFound("Quiz");
  }

  if (quiz.course.instructor.toString() !== instructorId.toString()) {
    throw APIError.authorization("Not authorized");
  }

  const attempts = await QuizAttempt.find({ quiz: quizId })
    .populate("user", "firstName lastName email avatar")
    .sort("-submittedAt")
    .lean();

  return { success: true, attempts };
};

module.exports = {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizForStudent,
  submitQuizAttempt,
  getMyAttempts,
  getAllAttempts,
};