import axiosInstance from "../axiosInstance";
import { endpoints } from "../api";

export const loginRequest = async ({ email, password }) => {
  const response = await axiosInstance.post(endpoints.LOGIN_API, { email, password });
  return response.data;
};

export const forgotPasswordRequest = async ({ email }) => {
  const response = await axiosInstance.post(endpoints.FORGOT_PASSWORD_API, { email });
  return response.data;
};

export const resetPasswordRequest = async ({ email, otp, newPassword, confirmPassword }) => {
  const response = await axiosInstance.post(endpoints.RESET_PASSWORD_API, {
    email,
    otp,
    newPassword,
    confirmPassword,
  });
  return response.data;
};
