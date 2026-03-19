/**
 * OpenRoute — only accessible when NOT logged in
 * FILE: src/components/auth/OpenRoute.jsx
 * No changes from original — logic is correct.
 */

import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function OpenRoute({ children }) {
  const token = useSelector((state) => state.auth.token);
  if (!token) return children;
  return <Navigate to="/dashboard" replace />;
}

export default OpenRoute;