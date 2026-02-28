const express = require("express");
const router = express.Router();

// ================= CONTROLLERS =================
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  editCourse,
  deleteCourse,
  getInstructorCourses,
  getEnrolledCourses,
} = require("../controllers/course");

const {
  createCategory,
  showAllCategories,
  categoryPageDetails,
} = require("../controllers/category");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/section");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/subSection");

const { auth, isInstructor, isStudent } = require("../middlewares/auth");

// ================= COURSE ROUTES =================
router.post("/createCourse", auth, isInstructor, createCourse);
router.put("/editCourse/:courseId", auth, isInstructor, editCourse);
router.delete("/deleteCourse/:courseId", auth, isInstructor, deleteCourse);

router.get("/getAllCourses", getAllCourses);
router.get("/getCourseDetails/:courseId", getCourseDetails);
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
router.get("/getEnrolledCourses", auth, isStudent, getEnrolledCourses);

// ================= SECTION ROUTES =================
router.post("/createSection", auth, isInstructor, createSection);
router.put("/updateSection/:sectionId", auth, isInstructor, updateSection);
router.delete("/deleteSection", auth, isInstructor, deleteSection);

// ================= SUBSECTION ROUTES =================
router.post("/createSubSection", auth, isInstructor, createSubSection);
router.put("/updateSubSection/:subSectionId", auth, isInstructor, updateSubSection);
router.delete("/deleteSubSection", auth, isInstructor, deleteSubSection);

// ================= CATEGORY ROUTES =================
router.post("/createCategory", auth, isInstructor, createCategory);
router.get("/showAllCategories", showAllCategories);
router.get("/categoryPageDetails", categoryPageDetails);

module.exports = router;
