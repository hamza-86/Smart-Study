/**
 * Category Controller
 * Handles category routes — raw controller style (no service layer needed for simple CRUD)
 */

const Category = require("../models/Category");
const APIError = require("../utils/apiError");
const { asyncHandler } = require("../middlewares/errorHandler");
const APIResponse = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../constants");
const { validateRequired } = require("../utils/validators");

const DEFAULT_CATEGORIES = [
  { name: "Web Development", description: "Frontend, backend, and full-stack web development" },
  { name: "App Development", description: "Mobile app development for Android and iOS" },
  { name: "Data Science", description: "Data analysis, visualization, and statistics" },
  { name: "Machine Learning", description: "ML models, algorithms, and production pipelines" },
  { name: "Artificial Intelligence", description: "AI fundamentals and practical applications" },
  { name: "Cyber Security", description: "Security concepts, pentesting, and secure coding" },
  { name: "DevOps", description: "CI/CD, automation, infrastructure, and deployment" },
  { name: "Cloud Computing", description: "Cloud architecture and services" },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const ensureDefaultCategories = async () => {
  const count = await Category.countDocuments();
  if (count > 0) return;

  const payload = DEFAULT_CATEGORIES.map((item) => ({
    ...item,
    slug: slugify(item.name),
  }));

  await Category.insertMany(payload, { ordered: false });
};

/**
 * Create category (Admin only)
 */
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, parentCategory } = req.body;

  validateRequired(name, "Category name");

  const existing = await Category.findOne({ name });
  if (existing) {
    throw APIError.conflict("Category already exists");
  }

  // Auto-generate slug from name
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  const category = await Category.create({
    name,
    description,
    icon,
    slug,
    parentCategory: parentCategory || null,
  });

  res
    .status(HTTP_STATUS.CREATED)
    .json(APIResponse.created(category, "Category created successfully"));
});

/**
 * Get all active categories
 */
exports.showAllCategories = asyncHandler(async (req, res) => {
  await ensureDefaultCategories();

  const categories = await Category.find({ isActive: true })
    .populate("parentCategory", "name slug")
    .select("-courses")
    .lean();

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(categories, "Categories retrieved successfully"));
});

/**
 * Get category page details with courses
 */
exports.categoryPageDetails = asyncHandler(async (req, res) => {
  const { categoryId } = req.body;

  validateRequired(categoryId, "Category ID");

  const selectedCategory = await Category.findById(categoryId)
    .populate({
      path: "courses",
      match: { status: "Published" },
      select:
        "title subtitle thumbnail price discountedPrice averageRating totalStudents level instructor",
      populate: { path: "instructor", select: "firstName lastName avatar headline" },
    })
    .lean();

  if (!selectedCategory) {
    throw APIError.notFound("Category not found");
  }

  if (!selectedCategory.courses || selectedCategory.courses.length === 0) {
    throw APIError.notFound("No published courses found for this category");
  }

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success({ selectedCategory }, "Category details retrieved"));
});

/**
 * Get category by slug (for SEO-friendly URLs)
 */
exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug, isActive: true })
    .populate({
      path: "courses",
      match: { status: "Published" },
      select:
        "title subtitle thumbnail price discountedPrice averageRating totalStudents level instructor",
      populate: { path: "instructor", select: "firstName lastName avatar" },
    })
    .lean();

  if (!category) {
    throw APIError.notFound("Category not found");
  }

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(category, "Category retrieved"));
});

/**
 * Update category (Admin only)
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name, description, icon, isActive } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw APIError.notFound("Category not found");
  }

  if (name) {
    category.name = name;
    category.slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  if (description !== undefined) category.description = description;
  if (icon !== undefined) category.icon = icon;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(category, "Category updated successfully"));
});

/**
 * Delete category (Admin only)
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw APIError.notFound("Category not found");
  }

  // Soft delete — just deactivate so existing courses aren't broken
  category.isActive = false;
  await category.save();

  res
    .status(HTTP_STATUS.OK)
    .json(APIResponse.success(null, "Category deactivated successfully"));
});
