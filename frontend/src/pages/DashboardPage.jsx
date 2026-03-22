/**
 * DashboardPage
 * FILE: src/pages/DashboardPage.jsx
 *
 * No functional changes needed — role-based redirect logic was correct.
 * Updated to also redirect Instructor to /dashboard/instructor (overview)
 * instead of /dashboard/my-courses, since the new sidebar has an Overview link.
 */

import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import InstructorDashboard from "./instructor/InstructorDashboard";

const DashboardPage = () => {
  const user = useSelector((state) => state.auth.user);
  const role = String(user?.accountType || "").toLowerCase();

  if (role === "instructor") {
    return <InstructorDashboard />;
  }

  if (role === "student") {
    return <Navigate to="/dashboard/my-learning" replace />;
  }

  // Admin or unknown
  return <Navigate to="/dashboard/my-profile" replace />;
};

export default DashboardPage;
