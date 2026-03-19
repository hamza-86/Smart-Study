const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
  publishCourse,
} = require("../controllers/course.controller");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/section.controller");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/subSection.controller");

const {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizForStudent,
  submitQuizAttempt,
  getMyAttempts,
  getAllAttempts,
} = require("../controllers/Quiz.controller");

const {
  createAssignment,
  getCourseAssignments,
  submitAssignment,
  gradeSubmission,
  getSubmissions,
  getMySubmissions,
} = require("../controllers/Assignment.controller");

const {
  auth,
  isInstructor,
  isStudent,
  optionalAuth,
} = require("../middlewares/auth");

// ── Public course browsing ──────────────────────────────────────────────
router.get("/getAllCourses", getAllCourses);
router.get("/getCourseDetails/:courseId", optionalAuth, getCourseDetails);

// ── Instructor: course management ──────────────────────────────────────
router.post("/createCourse", auth, isInstructor, createCourse);
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
router.put("/editCourse/:courseId", auth, isInstructor, editCourse);
router.delete("/deleteCourse/:courseId", auth, isInstructor, deleteCourse);
router.put("/publishCourse/:courseId", auth, isInstructor, publishCourse);

// ── Section routes ──────────────────────────────────────────────────────
router.post("/createSection", auth, isInstructor, createSection);
router.put("/updateSection/:sectionId", auth, isInstructor, updateSection);
router.delete("/deleteSection/:sectionId", auth, isInstructor, deleteSection);

// ── SubSection (lecture/video) routes ───────────────────────────────────
router.post("/createSubSection", auth, isInstructor, createSubSection);
router.put("/updateSubSection/:subSectionId", auth, isInstructor, updateSubSection);
router.delete("/deleteSubSection/:subSectionId", auth, isInstructor, deleteSubSection);

// ── Quiz: instructor management ─────────────────────────────────────────
router.post("/quiz", auth, isInstructor, createQuiz);
router.put("/quiz/:quizId", auth, isInstructor, updateQuiz);
router.delete("/quiz/:quizId", auth, isInstructor, deleteQuiz);
// Instructor: view all student attempts
router.get("/quiz/:quizId/attempts", auth, isInstructor, getAllAttempts);

// ── Quiz: student ───────────────────────────────────────────────────────
router.get("/quiz/:quizId", auth, isStudent, getQuizForStudent);
router.post("/quiz/:quizId/submit", auth, isStudent, submitQuizAttempt);
router.get("/quiz/:quizId/my-attempts", auth, isStudent, getMyAttempts);

// ── Assignment: instructor ──────────────────────────────────────────────
router.post("/assignments", auth, isInstructor, createAssignment);
router.put("/assignments/submissions/:submissionId/grade",
  auth, isInstructor, gradeSubmission);
router.get("/assignments/:assignmentId/submissions",
  auth, isInstructor, getSubmissions);

// ── Assignment: student ─────────────────────────────────────────────────
router.get("/assignments/course/:courseId", auth, getCourseAssignments);
router.post("/assignments/:assignmentId/submit",
  auth, isStudent, submitAssignment);
router.get("/assignments/my/:courseId", auth, isStudent, getMySubmissions);

module.exports = router;