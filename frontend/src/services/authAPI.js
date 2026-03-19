/**
 * Logout Service
 * FILE: src/services/logout.js
 *
 * Changes from your original:
 *  - Uses axiosInstance instead of raw axios (auto-attaches token)
 *  - Clears localStorage token AND user
 *  - Dispatches Redux logout action to clear auth state
 *  - Navigates to /login after logout
 *  - Always clears local state even if API call fails
 */

import axiosInstance from "./axiosInstance";
import { endpoints } from "./api";

const { LOGOUT_API } = endpoints;

/**
 * Log out the current user
 *
 * @param {function} dispatch  - Redux dispatch function
 * @param {function} navigate  - react-router navigate function
 */
export const logoutUser = async (dispatch, navigate) => {
  try {
    // Tell the backend to clear the refresh token cookie
    await axiosInstance.post(LOGOUT_API);
  } catch (error) {
    // Ignore — always clear local state regardless of API response
    console.warn("Logout API call failed:", error.message);
  } finally {
    // Always clear local storage and Redux state
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Lazy import to avoid circular deps
    const { logout } = await import("../slices/authSlice");
    dispatch(logout());

    if (navigate) {
      navigate("/login");
    }
  }
};