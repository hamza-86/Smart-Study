import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function OpenRoute({ children }) {
  const token = useSelector((state) => state.auth.token);

  // If user NOT logged in → allow access
  if (!token) {
    return children;
  }

  // If logged in → redirect
  return <Navigate to="/dashboard" replace />;
}

export default OpenRoute;