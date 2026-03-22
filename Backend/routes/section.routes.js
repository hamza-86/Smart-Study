const express = require("express");
const router = express.Router();

const { createSection, updateSection, deleteSection } = require("../controllers/section.controller");
const { auth, isInstructor } = require("../middlewares/auth");

router.use(auth, isInstructor);
router.post("/", createSection);
router.put("/:sectionId", updateSection);
router.delete("/:sectionId", deleteSection);

module.exports = router;
