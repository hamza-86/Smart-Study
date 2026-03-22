const express = require("express");
const router = express.Router();

const { createSubSection, updateSubSection, deleteSubSection } = require("../controllers/subSection.controller");
const { auth, isInstructor } = require("../middlewares/auth");

router.use(auth, isInstructor);
router.post("/", createSubSection);
router.put("/:subSectionId", updateSubSection);
router.put("/:id", updateSubSection);
router.delete("/:subSectionId", deleteSubSection);
router.delete("/:id", deleteSubSection);

module.exports = router;
