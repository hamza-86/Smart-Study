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

const DashboardPage = () => {
  const user = useSelector((state) => state.auth.user);
  const role = String(user?.accountType || "").toLowerCase();

  if (role === "instructor") {
    // Redirect to instructor overview dashboard (new page)
    return <Navigate to="/dashboard/instructor" replace />;
  }

  if (role === "student") {
    return <Navigate to="/dashboard/enrolled-courses" replace />;
  }

  // Admin or unknown
  return <Navigate to="/dashboard/my-profile" replace />;
};

export default DashboardPage;