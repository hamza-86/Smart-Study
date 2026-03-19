/**
 * Certificates Page
 * FILE: src/pages/student/Certificates.jsx
 *
 * Displays all certificates earned by the student
 */

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsDownload } from "react-icons/bs";
import Footer from "../../components/Footer";
import EmptyState from "../../components/common/EmptyState";
import { fadeIn } from "../../utils/motion";

const CertificateCard = ({ certificate, index }) => (
  <motion.div
    variants={fadeIn("up", "spring", index * 0.1, 1)}
    className="bg-richblack-800 border border-richblack-700 rounded-lg p-6 hover:border-caribbeangreen-200 transition"
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-richblack-5 font-bold text-lg">{certificate.courseTitle}</h3>
        <p className="text-richblack-400 text-sm mt-1">Completed on {certificate.completedDate}</p>
      </div>
      <button className="p-2 bg-caribbeangreen-500 text-richblack-900 rounded-lg hover:bg-caribbeangreen-600 transition">
        <BsDownload size={18} />
      </button>
    </div>

    <div className="bg-richblack-700 rounded-lg p-4 mb-4">
      <p className="text-richblack-300 text-sm">Certificate ID: {certificate.id}</p>
    </div>

    <div className="flex gap-2">
      <button className="flex-1 px-4 py-2 bg-caribbeangreen-500 text-richblack-900 font-semibold rounded-lg hover:bg-caribbeangreen-600 transition text-sm">
        View Certificate
      </button>
      <button className="flex-1 px-4 py-2 bg-richblack-600 text-richblack-200 font-semibold rounded-lg hover:bg-richblack-700 transition text-sm">
        Share
      </button>
    </div>
  </motion.div>
);

const Certificates = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const loading = useSelector((state) => state.auth.loading);

  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    
    // TODO: Fetch certificates from backend
    // Placeholder data
    setCertificates([
      { id: "CERT-001", courseTitle: "React Fundamentals", completedDate: "March 15, 2024" },
      { id: "CERT-002", courseTitle: "Advanced JavaScript", completedDate: "February 28, 2024" },
      { id: "CERT-003", courseTitle: "Web Development Basics", completedDate: "January 10, 2024" },
    ]);
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
        <div className="mt-16 w-full max-w-5xl px-4 pb-16">
          {/* Header */}
          <div className="pt-10 mb-8">
            <h1 className="text-richblack-5 font-bold text-3xl">My Certificates</h1>
            <p className="text-richblack-400 text-sm mt-2">
              {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} earned
            </p>
          </div>

          {/* Certificates Grid */}
          {certificates.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {certificates.map((certificate, index) => (
                <CertificateCard key={certificate.id} certificate={certificate} index={index} />
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title="No Certificates Yet"
              message="Complete your first course to earn a certificate."
              actionText="Explore Courses"
              onAction={() => navigate("/allCourses")}
            />
          )}
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default Certificates;
