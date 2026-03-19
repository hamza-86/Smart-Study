/**
 * PurchaseHistory Page
 * FILE: src/pages/student/PurchaseHistory.jsx
 *
 * Changes from original:
 *  - Was a static empty "cart" page — now fetches real enrolled courses
 *    with payment amounts via getEnrolledCourses
 *  - Shows course thumbnail, title, instructor, amount paid, and enrollment date
 *  - Renamed from "Cart" to "Purchase History" (matches new route and sidebar link)
 */

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { VscCalendar, VscVerified } from "react-icons/vsc";
import Footer     from "../../components/Footer";
import EmptyState  from "../../components/common/EmptyState";
import { getEnrolledCourses } from "../../services/courseServices";

const PurchaseHistory = () => {
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

  const totalSpent = courses.reduce((sum, c) => sum + (c.amountPaid || 0), 0);

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
        className="w-full flex justify-center bg-richblack-900 min-h-screen"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mt-16 w-full max-w-4xl px-4 pb-16">

          {/* Header */}
          <div className="flex items-end justify-between pt-10 mb-6">
            <div>
              <h1 className="text-richblack-5 font-bold text-2xl lg:text-3xl">
                Purchase History
              </h1>
              <p className="text-richblack-400 text-sm mt-1">
                {courses.length} course{courses.length !== 1 ? "s" : ""} purchased
              </p>
            </div>
            {courses.length > 0 && (
              <div className="text-right">
                <p className="text-richblack-400 text-xs">Total Spent</p>
                <p className="text-yellow-50 font-bold text-xl">
                  ₹{totalSpent.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-b border-richblack-700 mb-6" />

          {courses.length > 0 ? (
            <div className="flex flex-col gap-4">
              {courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-richblack-800 rounded-xl hover:bg-richblack-700 transition cursor-pointer group"
                  onClick={() => navigate(`/dashboard/course-content/${course._id}`)}
                >
                  {/* Thumbnail */}
                  <img
                    src={course.thumbnail || "/placeholder-course.jpg"}
                    alt={course.title}
                    className="w-20 h-14 lg:w-28 lg:h-18 object-cover rounded-lg shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-richblack-5 font-medium text-sm lg:text-base truncate group-hover:text-yellow-50 transition">
                      {course.title}
                    </h3>
                    {course.instructor && (
                      <p className="text-richblack-400 text-xs mt-0.5">
                        {course.instructor.firstName} {course.instructor.lastName}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {course.enrolledAt && (
                        <span className="flex items-center gap-1 text-richblack-400 text-xs">
                          <VscCalendar size={12} />
                          {new Date(course.enrolledAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-caribbeangreen-300 text-xs">
                        <VscVerified size={12} />
                        Enrolled
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    {course.amountPaid === 0 ? (
                      <span className="text-caribbeangreen-300 font-semibold text-sm">Free</span>
                    ) : (
                      <span className="text-richblack-5 font-semibold text-sm">
                        ₹{(course.amountPaid || 0).toLocaleString()}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="You haven't purchased any courses yet."
              actionLabel="Browse Courses"
              onAction={() => navigate("/allCourses")}
            />
          )}

        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default PurchaseHistory;