/**
 * InstructorStudents Page
 * FILE: src/pages/instructor/InstructorStudents.jsx
 *
 * Displays all students enrolled in instructor's courses with analytics
 */

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../../components/Footer";
import EmptyState from "../../components/common/EmptyState";
import { fadeIn } from "../../utils/motion";

const StudentRow = ({ student, index }) => (
  <motion.tr
    variants={fadeIn("left", "spring", index * 0.1, 1)}
    className="border-b border-richblack-700 hover:bg-richblack-800 transition"
  >
    <td className="px-6 py-4 text-richblack-200 text-sm">{student.name}</td>
    <td className="px-6 py-4 text-richblack-300 text-sm">{student.email}</td>
    <td className="px-6 py-4 text-richblack-300 text-sm">{student.courseCount}</td>
    <td className="px-6 py-4 text-richblack-300 text-sm">{student.progress}%</td>
    <td className="px-6 py-4">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        student.progress === 100
          ? "bg-caribbeangreen-900 text-caribbeangreen-200"
          : student.progress >= 50
          ? "bg-yellow-900 text-yellow-200"
          : "bg-richblack-700 text-richblack-300"
      }`}>
        {student.progress === 100 ? "Completed" : "In Progress"}
      </span>
    </td>
  </motion.tr>
);

const InstructorStudents = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const loading = useSelector((state) => state.auth.loading);

  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    
    // TODO: Fetch students from backend
    // Placeholder data
    setStudents([
      { id: 1, name: "John Doe", email: "john@example.com", courseCount: 2, progress: 100 },
      { id: 2, name: "Jane Smith", email: "jane@example.com", courseCount: 3, progress: 75 },
      { id: 3, name: "Bob Wilson", email: "bob@example.com", courseCount: 1, progress: 45 },
    ]);
  }, [token, dispatch, navigate]);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="mt-16 w-full max-w-5xl px-4 pb-16">
          {/* Header */}
          <div className="pt-10 mb-8">
            <h1 className="text-richblack-5 font-bold text-3xl">My Students</h1>
            <p className="text-richblack-400 text-sm mt-2">
              Total students: {students.length}
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-richblack-700 border border-richblack-600 text-richblack-5 rounded-lg focus:outline-none focus:border-caribbeangreen-200"
            />
          </div>

          {/* Table */}
          {filteredStudents.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-richblack-800 border border-richblack-700 rounded-lg overflow-hidden"
            >
              <table className="w-full">
                <thead className="bg-richblack-700 border-b border-richblack-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-richblack-200 text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-richblack-200 text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-richblack-200 text-sm font-semibold">Courses</th>
                    <th className="px-6 py-4 text-left text-richblack-200 text-sm font-semibold">Progress</th>
                    <th className="px-6 py-4 text-left text-richblack-200 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <StudentRow key={student.id} student={student} index={index} />
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <EmptyState
              title="No Students Found"
              message="No students matching your search criteria."
            />
          )}
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default InstructorStudents;
