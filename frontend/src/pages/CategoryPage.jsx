/**
 * Category Page
 * FILE: src/pages/CategoryPage.jsx
 *
 * Was completely empty in your original.
 * Now shows courses filtered by category slug from the URL.
 * Uses fetchCategoryDetails from courseServices.
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CourseCard from "../components/CourseCard";
import Footer     from "../components/Footer";
import { fetchCategoryDetails } from "../services/courseServices";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate       = useNavigate();

  const [category, setCategory] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    const load = async () => {
      setLoading(true);
      const result = await fetchCategoryDetails(categoryId);
      if (result?.selectedCategory) {
        setCategory(result.selectedCategory);
      }
      setLoading(false);
    };
    load();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-richblack-900">
        <div className="loader" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="grid min-h-screen place-items-center bg-richblack-900">
        <div className="text-center">
          <p className="text-richblack-300 text-xl mb-4">Category not found</p>
          <button
            onClick={() => navigate("/allCourses")}
            className="px-5 py-2.5 rounded-lg bg-yellow-50 text-richblack-900 font-semibold"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  const courses = category.courses || [];

  return (
    <>
      <div className="bg-richblack-900 min-h-screen">

        {/* Header */}
        <div className="bg-richblack-800 pt-24 pb-10 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-richblack-400 text-sm mb-1">Category</p>
              <h1 className="text-richblack-5 font-bold text-3xl lg:text-4xl mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-richblack-300 text-sm max-w-xl">
                  {category.description}
                </p>
              )}
              <p className="text-richblack-400 text-sm mt-3">
                {courses.length} course{courses.length !== 1 ? "s" : ""}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Courses grid */}
        <div className="max-w-6xl mx-auto px-4 py-10">
          {courses.length > 0 ? (
            <motion.div
              className="flex flex-wrap gap-6 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {courses.map((course, index) => (
                <CourseCard
                  key={course._id}
                  index={index}
                  courseId={course._id}
                  title={course.title}
                  category={category.name}
                  price={course.price}
                  discountedPrice={course.discountedPrice}
                  thumbnail={course.thumbnail}
                  instructor={
                    course.instructor
                      ? `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim()
                      : "Unknown Instructor"
                  }
                  averageRating={course.averageRating}
                  totalStudents={course.totalStudents}
                  level={course.level}
                />
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center py-24">
              <p className="text-richblack-300 text-xl mb-4">
                No published courses in this category yet.
              </p>
              <button
                onClick={() => navigate("/allCourses")}
                className="px-5 py-2.5 rounded-lg bg-yellow-50 text-richblack-900 font-semibold hover:bg-yellow-100 transition"
              >
                Browse All Courses
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CategoryPage;