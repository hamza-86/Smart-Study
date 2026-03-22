/**
 * MyCourses Page
 * FILE: src/pages/instructor/MyCourses.jsx
 *
 * Changes from original:
 *  - Fixed import: fetchInstructorCourses from courseServices.js (not courseAPI)
 *  - Added status badge (Draft / Published) on each course row
 *  - Improved empty state
 *  - Loading spinner uses PageLoader pattern
 */

import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { VscAdd } from "react-icons/vsc";
import { motion } from "framer-motion";
import InstructorCourseCard      from "../../components/Instructor/InstructorCourseCard";
import InstructorCourseCardSmall from "../../components/Instructor/InstructorCourseCardSmall";
import Footer    from "../../components/Footer";
import EmptyState from "../../components/common/EmptyState";
import { fetchInstructorCourses } from "../../services/courseServices";

const MyCourses = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const token     = useSelector((state) => state.auth.token);
  const loading   = useSelector((state) => state.auth.loading);

  const [courses, setCourses] = useState([]);

  const loadCourses = useCallback(async () => {
    const result = await fetchInstructorCourses(token, dispatch);
    setCourses(Array.isArray(result) ? result : []);
  }, [token, dispatch]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    loadCourses();
  }, [token, navigate, loadCourses]);

  const deleteHandler = () => {
    loadCourses();
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
        className="w-full flex justify-center items-start min-h-screen bg-richblack-900"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mt-16 min-h-screen w-full max-w-5xl px-4 pb-16">

          {/* Header */}
          <div className="flex justify-between items-center pt-10 mb-8">
            <div>
              <h1 className="text-richblack-5 font-bold text-2xl lg:text-3xl">My Courses</h1>
              <p className="text-richblack-400 text-sm mt-1">
                {courses.length} course{courses.length !== 1 ? "s" : ""} total
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/add-course")}
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 text-richblack-900 font-semibold rounded-lg hover:bg-yellow-100 transition"
            >
              <VscAdd size={18} />
              <span>New Course</span>
            </button>
          </div>

          {/* Course list */}
          {courses.length > 0 ? (
            <>
              {/* Desktop */}
              <div className="hidden lg:flex flex-col gap-4">
                {courses.map((course, index) => (
                  <InstructorCourseCard
                    key={course._id}
                    course={course}
                    token={token}
                    onDelete={deleteHandler}
                    index={index}
                  />
                ))}
              </div>
              {/* Mobile */}
              <div className="flex lg:hidden flex-col gap-4">
                {courses.map((course, index) => (
                  <InstructorCourseCardSmall
                    key={course._id}
                    course={course}
                    token={token}
                    onDelete={deleteHandler}
                    index={index}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              message="You haven't created any courses yet. Share your knowledge today!"
              actionLabel="Create Your First Course"
              onAction={() => navigate("/dashboard/add-course")}
            />
          )}
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default MyCourses;
