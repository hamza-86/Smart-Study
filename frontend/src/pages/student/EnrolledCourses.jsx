/**
 * EnrolledCourses Page
 * FILE: src/pages/student/EnrolledCourses.jsx
 *
 * Changes from original:
 *  - Fixed import: getEnrolledCourses from courseServices.js (not courseAPI)
 *  - Courses now include progress data (completionPercentage, lastAccessedAt)
 *    because getEnrolledCourses service attaches progress to each course
 *  - Improved empty state with a proper call to action
 *  - Added total count display
 */

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EnrolledCourseCard      from "../../components/student/EnrolledCourseCard";
import EnrolledCourseCardSmall from "../../components/student/EnrolledCourseCardSmall";
import Footer    from "../../components/Footer";
import EmptyState from "../../components/common/EmptyState";
import { getEnrolledCourses } from "../../services/courseServices";

const EnrolledCourses = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const token     = useSelector((state) => state.auth.token);
  const loading   = useSelector((state) => state.auth.loading);

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    getEnrolledCourses(token, dispatch).then((result) => {
      setCourses(Array.isArray(result) ? result : []);
    });
  }, [token, dispatch, navigate]);

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
        className="w-full flex justify-center items-start bg-richblack-900 min-h-screen"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mt-16 min-h-screen w-full max-w-5xl px-4 pb-16">

          {/* Header */}
          <div className="flex justify-between items-center pt-10 mb-8">
            <div>
              <h1 className="text-richblack-5 font-bold text-2xl lg:text-3xl">My Learning</h1>
              <p className="text-richblack-400 text-sm mt-1">
                {courses.length} course{courses.length !== 1 ? "s" : ""} enrolled
              </p>
            </div>
            <button
              onClick={() => navigate("/allCourses")}
              className="px-4 py-2.5 border border-yellow-50 text-yellow-50 font-medium rounded-lg hover:bg-yellow-50 hover:text-richblack-900 transition text-sm"
            >
              Browse More
            </button>
          </div>

          {courses.length > 0 ? (
            <>
              {/* Desktop */}
              <div className="hidden lg:flex flex-col gap-4">
                {courses.map((course, index) => (
                  <EnrolledCourseCard
                    key={course._id}
                    course={course}
                    token={token}
                    index={index}
                  />
                ))}
              </div>
              {/* Mobile */}
              <div className="flex lg:hidden flex-col gap-5">
                {courses.map((course, index) => (
                  <EnrolledCourseCardSmall
                    key={course._id}
                    course={course}
                    token={token}
                    index={index}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              message="You haven't enrolled in any courses yet. Start learning today!"
              actionLabel="Explore Courses"
              onAction={() => navigate("/allCourses")}
            />
          )}
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default EnrolledCourses;