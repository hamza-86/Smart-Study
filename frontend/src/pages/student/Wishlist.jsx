/**
 * Wishlist Page
 * FILE: src/pages/student/Wishlist.jsx
 *
 * Displays wishlist of courses saved by the student
 */

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { VscTrash } from "react-icons/vsc";
import Footer from "../../components/Footer";
import CourseCard from "../../components/CourseCard";
import EmptyState from "../../components/common/EmptyState";
import { fadeIn } from "../../utils/motion";

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const loading = useSelector((state) => state.auth.loading);

  const [wishlistCourses, setWishlistCourses] = useState([]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    
    // TODO: Fetch wishlist from backend
    // Placeholder data
    setWishlistCourses([
      {
        _id: "1",
        courseTitle: "Advanced React Patterns",
        thumbnail: "https://via.placeholder.com/300x200",
        instructor: { firstName: "John", lastName: "Doe" },
        rating: 4.8,
        reviewCount: 245,
        price: 99.99,
      },
      {
        _id: "2",
        courseTitle: "Node.js & Express Mastery",
        thumbnail: "https://via.placeholder.com/300x200",
        instructor: { firstName: "Jane", lastName: "Smith" },
        rating: 4.7,
        reviewCount: 189,
        price: 89.99,
      },
      {
        _id: "3",
        courseTitle: "Full Stack Development 2024",
        thumbnail: "https://via.placeholder.com/300x200",
        instructor: { firstName: "Bob", lastName: "Johnson" },
        rating: 4.9,
        reviewCount: 312,
        price: 129.99,
      },
    ]);
  }, [token, dispatch, navigate]);

  const handleRemoveFromWishlist = (courseId) => {
    setWishlistCourses((prev) =>
      prev.filter((course) => course._id !== courseId)
    );
  };

  const handleAddToCart = (courseId) => {
    // TODO: Implement add to cart functionality
    alert("Add to cart functionality would be implemented here");
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-richblack-900">
        <div className="loader" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full flex justify-center items-start bg-richblack-900 min-h-screen"
      >
        <div className="mt-16 w-full max-w-6xl px-4 pb-16">
          {/* Header */}
          <div className="pt-10 mb-8">
            <h1 className="text-richblack-5 font-bold text-3xl">My Wishlist</h1>
            <p className="text-richblack-400 text-sm mt-2">
              {wishlistCourses.length} course{wishlistCourses.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          {/* Courses Grid */}
          {wishlistCourses.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {wishlistCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  variants={fadeIn("up", "spring", index * 0.1, 1)}
                  className="bg-richblack-800 border border-richblack-700 rounded-lg overflow-hidden hover:border-caribbeangreen-200 transition h-full flex flex-col"
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="h-40 bg-richblack-700 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.courseTitle}
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="text-richblack-5 font-bold text-sm cursor-pointer hover:text-caribbeangreen-200 line-clamp-2"
                    >
                      {course.courseTitle}
                    </h3>

                    <p className="text-richblack-400 text-xs mt-1">
                      {course.instructor?.firstName} {course.instructor?.lastName}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2 text-xs text-richblack-400">
                      <span className="text-yellow-400">★</span>
                      <span>{course.rating}</span>
                      <span>({course.reviewCount})</span>
                    </div>

                    {/* Price and Actions */}
                    <div className="mt-auto pt-4 space-y-3">
                      <p className="text-richblack-5 font-bold text-lg">
                        ${course.price}
                      </p>
                      <button
                        onClick={() => handleAddToCart(course._id)}
                        className="w-full px-4 py-2 bg-caribbeangreen-500 text-richblack-900 font-semibold rounded-lg hover:bg-caribbeangreen-600 transition text-sm"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(course._id)}
                        className="w-full px-4 py-2 bg-richblack-700 text-richblack-200 font-semibold rounded-lg hover:bg-richblack-600 transition text-sm flex items-center justify-center gap-2"
                      >
                        <VscTrash size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title="Your Wishlist is Empty"
              message="Start adding courses to your wishlist to save them for later."
              actionText="Browse Courses"
              onAction={() => navigate("/allCourses")}
            />
          )}
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default Wishlist;
