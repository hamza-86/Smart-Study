const express = require("express");
const router  = express.Router();

const {
  createCategory,
  showAllCategories,
  categoryPageDetails,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const { auth, isAdmin } = require("../middlewares/auth");

// ── Public ──────────────────────────────────────────────────────────────
router.get   ("/showAllCategories",          showAllCategories);
router.post  ("/categoryPageDetails",        categoryPageDetails);  // kept as POST to match original
router.get   ("/slug/:slug",                 getCategoryBySlug);

// ── Admin only ───────────────────────────────────────────────────────────
router.post  ("/createCategory",   auth, isAdmin, createCategory);
router.put   ("/updateCategory/:categoryId", auth, isAdmin, updateCategory);
router.delete("/deleteCategory/:categoryId", auth, isAdmin, deleteCategory);

module.exports = router;