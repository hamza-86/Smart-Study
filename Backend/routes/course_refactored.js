const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
  createSection,
  updateSection,
  deleteSection,
  createSubSection,
  updateSubSection,
  deleteSubSection,
  publishCourse,
} = require("../controllers/course.controller");

const { auth, isInstructor, isStudent } = require("../middlewares/auth");

// ================= PUBLIC ROUTES =================
router.get("/getAllCourses", getAllCourses);
router.get("/getCourseDetails/:courseId", getCourseDetails);

// ================= INSTRUCTOR ROUTES =================
router.post("/createCourse", auth, isInstructor, createCourse);
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
router.put("/editCourse/:courseId", auth, isInstructor, editCourse);
router.delete("/deleteCourse/:courseId", auth, isInstructor, deleteCourse);
router.put("/publishCourse/:courseId", auth, isInstructor, publishCourse);

// ================= SECTION ROUTES =================
router.post("/createSection", auth, isInstructor, createSection);
router.put("/updateSection/:sectionId", auth, isInstructor, updateSection);
router.delete("/deleteSection/:sectionId", auth, isInstructor, deleteSection);

// ================= SUBSECTION (VIDEO) ROUTES =================
router.post("/createSubSection", auth, isInstructor, createSubSection);
router.put("/updateSubSection/:subSectionId", auth, isInstructor, updateSubSection);
router.delete("/deleteSubSection/:subSectionId", auth, isInstructor, deleteSubSection);

module.exports = router;
