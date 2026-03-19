/**
 * Custom Hook: useAuth
 * FILE: src/hooks/useAuth.js
 *
 * Changes from original:
 *  - Added fullName computed from firstName + lastName (new User model)
 *  - Added avatar, email convenience fields
 *  - handleLogout now accepts navigate and calls the logout service
 *    (instead of just dispatching — that didn't clear localStorage or navigate)
 */

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/logout";

export const useAuth = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, token, loading } = useSelector((state) => state.auth);

  const isAuthenticated = !!token && !!user;
  const isInstructor    = user?.accountType === "Instructor";
  const isStudent       = user?.accountType === "Student";
  const isAdmin         = user?.accountType === "Admin";

  // Build full name from new firstName/lastName model fields
  // Falls back to legacy `name` field if somehow present
  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || "User";

  const handleLogout = () => {
    logoutUser(dispatch, navigate);
  };

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isInstructor,
    isStudent,
    isAdmin,
    fullName,
    avatar:       user?.avatar || null,
    email:        user?.email  || null,
    accountType:  user?.accountType || null,
    handleLogout,
  };
};

export default useAuth;