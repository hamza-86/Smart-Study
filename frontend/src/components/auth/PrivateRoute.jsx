/**
 * PrivateRoute — only accessible when logged in
 * FILE: src/components/auth/PrivateRoute.jsx
 * No changes from original — logic is correct.
 */

import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute() {
  const token = useSelector((state) => state.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default PrivateRoute;