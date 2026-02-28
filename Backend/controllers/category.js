const Category = require("../models/Category");


exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({ name, description });

    return res.status(201).json({
      success: true,
      data: category,
    });

  } catch (error) {
    console.error("Create Category Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

  exports.showAllCategories = async (req, res) => {
    try {
      const allCategorys = await Category.find()
      res.status(200).json({
        success: true,
        data: allCategorys,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}

exports.categoryPageDetails = async (req, res) => {
  try {
      const { categoryId } = req.body

      // Get courses for the specified category
      const selectedCategory = await Category.findById(categoryId)
        .populate("courses")
        .exec()

      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }

      if (selectedCategory.courses.length === 0) {
        console.log("No courses found for the selected category.")
          return res.status(404).json({
            success: false,
            message: "No courses found for the selected category.",
        })

      }

      res.status(200).json({
        success: true,
        data: {
          selectedCategory
        },
      })
  }
  catch(error)
  {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}