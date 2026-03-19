import axiosInstance from "../axiosInstance";
import { endpoints } from "../api";

export const getCoursesRequest = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axiosInstance.get(
    `${endpoints.GET_ALL_COURSES_API}${params ? `?${params}` : ""}`
  );
  return response.data;
};

export const getEnrolledCoursesRequest = async () => {
  const response = await axiosInstance.get(endpoints.GET_ENROLLED_COURSES);
  return response.data;
};
