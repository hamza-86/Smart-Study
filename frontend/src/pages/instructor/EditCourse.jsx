/**
 * EditCourse Page
 * FILE: src/pages/instructor/EditCourse.jsx
 *
 * Allows instructors to edit their courses' basic info and publish
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { VscArrowLeft } from "react-icons/vsc";
import Footer from "../../components/Footer";
import EmptyState from "../../components/common/EmptyState";
import { fetchCourseDetails } from "../../services/courseServices";
import { textVariant } from "../../utils/motion";

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const loading = useSelector((state) => state.auth.loading);

  const [course, setCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseTitle: "",
    courseDescription: "",
    price: 0,
    discountedPrice: 0,
  });

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (!courseId) { navigate("/dashboard/my-courses"); return; }
    
    fetchCourseDetails(courseId, dispatch).then((result) => {
      if (result) {
        setCourse(result);
        setFormData({
          courseTitle: result.courseTitle || "",
          courseDescription: result.courseDescription || "",
          price: result.price || 0,
          discountedPrice: result.discountedPrice || 0,
        });
      }
    });
  }, [courseId, token, dispatch, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("price") ? Number(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    // TODO: Implement save logic with backend API
    alert("Save functionality would be implemented here");
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-richblack-900">
        <div className="loader" />
      </div>
    );
  }

  if (!course) {
    return (
      <EmptyState
        title="Course Not Found"
        message="The course you're looking for doesn't exist."
        actionText="Back to Courses"
        onAction={() => navigate("/dashboard/my-courses")}
      />
    );
  }

  return (
    <>
      <motion.div
        className="w-full flex justify-center items-start bg-richblack-900 min-h-screen"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mt-16 w-full max-w-3xl px-4 pb-16">
          {/* Header */}
          <button
            onClick={() => navigate("/dashboard/my-courses")}
            className="flex items-center gap-2 text-richblack-200 hover:text-richblack-5 mb-8"
          >
            <VscArrowLeft size={20} />
            Back to My Courses
          </button>

          <motion.h1
            variants={textVariant(0.1)}
            initial="hidden"
            animate="show"
            className="text-richblack-5 font-bold text-3xl mb-8"
          >
            Edit Course
          </motion.h1>

          {/* Form */}
          <div className="bg-richblack-800 rounded-lg p-8 border border-richblack-700">
            <div className="space-y-6">
              <div>
                <label className="block text-richblack-200 text-sm font-medium mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  name="courseTitle"
                  value={formData.courseTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 text-richblack-5 rounded-lg focus:outline-none focus:border-caribbeangreen-200"
                  placeholder="Enter course title"
                />
              </div>

              <div>
                <label className="block text-richblack-200 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="courseDescription"
                  value={formData.courseDescription}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 text-richblack-5 rounded-lg focus:outline-none focus:border-caribbeangreen-200"
                  placeholder="Enter course description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-richblack-200 text-sm font-medium mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 text-richblack-5 rounded-lg focus:outline-none focus:border-caribbeangreen-200"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-richblack-200 text-sm font-medium mb-2">
                    Discounted Price
                  </label>
                  <input
                    type="number"
                    name="discountedPrice"
                    value={formData.discountedPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 text-richblack-5 rounded-lg focus:outline-none focus:border-caribbeangreen-200"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-caribbeangreen-500 text-richblack-900 font-semibold rounded-lg hover:bg-caribbeangreen-600 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => navigate("/dashboard/my-courses")}
                  className="px-6 py-2 bg-richblack-600 text-richblack-200 font-semibold rounded-lg hover:bg-richblack-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default EditCourse;
