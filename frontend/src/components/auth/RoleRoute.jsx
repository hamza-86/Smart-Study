/**
 * RoleRoute — protects routes requiring a specific accountType
 * FILE: src/components/auth/RoleRoute.jsx
 * No changes from original — logic is correct.
 */

import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function RoleRoute({ role }) {
  const user         = useSelector((state) => state.auth.user);
  const userRole     = String(user?.accountType || "").toLowerCase();
  const requiredRole = String(role || "").toLowerCase();

  if (userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;