/**
 * Auth Services
 * FILE: src/services/authServices.js
 *
 * Handles: login, signup, OTP, forgot/reset password, logout, profile
 */

import { toast } from "react-hot-toast";
import { endpoints } from "./api";
import axiosInstance from "./axiosInstance";
import {
  setLoading,
  setToken,
  setUser,
  logout as logoutAction,
} from "../slices/authSlice";

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  LOGOUT_API,
  FORGOT_PASSWORD_API,
  RESET_PASSWORD_API,
  CHANGE_PASSWORD_API,
  GET_PROFILE_API,
  UPDATE_PROFILE_API,
  UPLOAD_AVATAR_API,
} = endpoints;

// ── Send OTP ──────────────────────────────────────────────────────────────────
export const sendOTP = async (email, navigate) => {
  const toastId = toast.loading("Sending OTP...");
  try {
    const response = await axiosInstance.post(SENDOTP_API, { email });

    if (response.data.success) {
      toast.success("OTP sent to your email");
      navigate("/verify-email");
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to send OTP");
  } finally {
    toast.dismiss(toastId);
  }
};

// ── Signup ────────────────────────────────────────────────────────────────────
export const signUp = async (
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  accountType,
  otp,
  navigate,
  dispatch
) => {
  const toastId = toast.loading("Creating your account...");
  dispatch(setLoading(true));
  try {
    const response = await axiosInstance.post(SIGNUP_API, {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      otp,
    });

    if (response.data.success) {
      toast.success("Account created! Please log in.");
      navigate("/login");
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Signup failed");
    navigate("/signup");
  } finally {
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async (email, password, navigate, dispatch) => {
  const toastId = toast.loading("Logging in...");
  dispatch(setLoading(true));
  try {
    const response = await axiosInstance.post(LOGIN_API, { email, password });

    if (response.data.success) {
      const { accessToken, user } = response.data.data;

      dispatch(setToken(accessToken));
      dispatch(setUser(user));
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Welcome back, ${user.firstName}!`);

      // Redirect based on role
      if (user.accountType === "Instructor") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
  } finally {
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logoutUser = async (token, dispatch, navigate) => {
  try {
    await axiosInstance.post(LOGOUT_API);
  } catch (_) {
    // Ignore errors — always clear local state
  } finally {
    dispatch(logoutAction());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = async (email) => {
  const toastId = toast.loading("Sending reset link...");
  try {
    const response = await axiosInstance.post(FORGOT_PASSWORD_API, { email });
    // Always show success (backend doesn't reveal if email exists)
    toast.success("If that email exists, a reset link has been sent");
    return response.data;
  } catch (error) {
    // Still show success to prevent user enumeration
    toast.success("If that email exists, a reset link has been sent");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = async (token, newPassword, confirmPassword, navigate) => {
  const toastId = toast.loading("Resetting password...");
  try {
    const response = await axiosInstance.post(RESET_PASSWORD_API(token), {
      newPassword,
      confirmPassword,
    });

    if (response.data.success) {
      toast.success("Password reset successfully. Please log in.");
      navigate("/login");
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Password reset failed");
  } finally {
    toast.dismiss(toastId);
  }
};

// ── Change Password (logged in) ────────────────────────────────────────────────
export const changePassword = async (oldPassword, newPassword, confirmNewPassword, dispatch) => {
  const toastId = toast.loading("Updating password...");
  try {
    const response = await axiosInstance.put(CHANGE_PASSWORD_API, {
      oldPassword,
      newPassword,
      confirmNewPassword,
    });

    if (response.data.success) {
      toast.success("Password updated successfully");
    } else {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update password");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// ── Get Profile ────────────────────────────────────────────────────────────────
export const getProfile = async (dispatch) => {
  try {
    const response = await axiosInstance.get(GET_PROFILE_API);
    if (response.data.success) {
      dispatch(setUser(response.data.data));
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }
    return response.data.data;
  } catch (error) {
    console.error("Get profile error:", error);
    return null;
  }
};

// ── Update Profile ─────────────────────────────────────────────────────────────
export const updateProfile = async (profileData, dispatch) => {
  const toastId = toast.loading("Updating profile...");
  try {
    const response = await axiosInstance.put(UPDATE_PROFILE_API, profileData);

    if (response.data.success) {
      dispatch(setUser(response.data.data));
      localStorage.setItem("user", JSON.stringify(response.data.data));
      toast.success("Profile updated successfully");
    }
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update profile");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// ── Upload Avatar ──────────────────────────────────────────────────────────────
export const uploadAvatar = async (avatarFile, dispatch) => {
  const toastId = toast.loading("Uploading avatar...");
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await axiosInstance.post(UPLOAD_AVATAR_API, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.success) {
      // Fetch fresh profile to update Redux
      await getProfile(dispatch);
      toast.success("Profile picture updated");
    }
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to upload avatar");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};