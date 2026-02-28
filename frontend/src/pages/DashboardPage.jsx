import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const DashboardPage = () => {
  const user = useSelector((state) => state.auth.user);

  // The App.js normalizes roles, let's normalize here too just in case
  const role = String(user?.accountType || "").toLowerCase();

  if (role === "instructor") {
    return <Navigate to="/dashboard/my-courses" replace />;
  }

  if (role === "student") {
    return <Navigate to="/dashboard/enrolled-courses" replace />;
  }

  // Fallback for Admin or unknown roles
  return <Navigate to="/dashboard/my-profile" replace />;
};

export default DashboardPage;
