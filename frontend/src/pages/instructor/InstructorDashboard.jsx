/**
 * InstructorDashboard Page
 * FILE: src/pages/instructor/InstructorDashboard.jsx
 *
 * Displays instructor overview: courses, earnings, students, and analytics
 */

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { VscAdd } from "react-icons/vsc";
import Footer from "../../components/Footer";
import EmptyState from "../../components/common/EmptyState";
import { fadeIn } from "../../utils/motion";

const StatCard = ({ label, value, icon: Icon }) => (
  <motion.div
    variants={fadeIn("up", "spring", 0.2, 1)}
    className="bg-richblack-800 border border-richblack-700 rounded-lg p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-richblack-400 text-sm">{label}</p>
        <p className="text-richblack-5 text-2xl font-bold mt-2">{value}</p>
      </div>
      {Icon && <Icon className="text-caribbeangreen-200 text-3xl opacity-50" />}
    </div>
  </motion.div>
);

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    coursesInReview: 0,
  });

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    
    // TODO: Fetch instructor stats from backend
    // For now, using placeholder data
    setStats({
      totalCourses: 5,
      totalStudents: 324,
      totalEarnings: 45230,
      coursesInReview: 1,
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full flex justify-center items-start bg-richblack-900 min-h-screen"
      >
        <div className="mt-16 w-full max-w-6xl px-4 pb-16">
          {/* Header */}
          <div className="flex justify-between items-center pt-10 mb-8">
            <div>
              <h1 className="text-richblack-5 font-bold text-3xl">
                Welcome back, {user?.firstName || "Instructor"}
              </h1>
              <p className="text-richblack-400 text-sm mt-2">
                Here's your teaching dashboard overview
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/add-course")}
              className="flex items-center gap-2 px-4 py-2 bg-caribbeangreen-500 text-richblack-900 font-semibold rounded-lg hover:bg-caribbeangreen-600 transition"
            >
              <VscAdd size={18} />
              New Course
            </button>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <StatCard label="Total Courses" value={stats.totalCourses} />
            <StatCard label="Total Students" value={stats.totalStudents} />
            <StatCard label="Total Earnings" value={`$${stats.totalEarnings}`} />
            <StatCard label="Courses in Review" value={stats.coursesInReview} />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={fadeIn("up", "spring", 0.4, 1)}
            className="bg-richblack-800 border border-richblack-700 rounded-lg p-8"
          >
            <h2 className="text-richblack-5 font-bold text-xl mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/dashboard/my-courses")}
                className="p-4 bg-richblack-700 hover:bg-richblack-600 rounded-lg text-richblack-200 text-sm font-medium transition"
              >
                → Manage Courses
              </button>
              <button
                onClick={() => navigate("/dashboard/students")}
                className="p-4 bg-richblack-700 hover:bg-richblack-600 rounded-lg text-richblack-200 text-sm font-medium transition"
              >
                → View Students
              </button>
              <button
                onClick={() => navigate("/dashboard/earnings")}
                className="p-4 bg-richblack-700 hover:bg-richblack-600 rounded-lg text-richblack-200 text-sm font-medium transition"
              >
                → View Earnings
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default InstructorDashboard;
