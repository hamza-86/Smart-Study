/**
 * Dashboard Services
 * FILE: src/services/dashboardServices.js
 *
 * Instructor analytics + Student dashboard data
 */

import { toast } from "react-hot-toast";
import { endpoints } from "./api";
import axiosInstance from "./axiosInstance";

const {
  INSTRUCTOR_DASHBOARD_API,
  INSTRUCTOR_STUDENTS_API,
  INSTRUCTOR_EARNINGS_API,
  INSTRUCTOR_QUIZ_ANALYTICS_API,
  INSTRUCTOR_WATCH_ANALYTICS,
  STUDENT_DASHBOARD_API,
  GET_NOTIFICATIONS_API,
  MARK_NOTIFICATIONS_READ_API,
  GET_CERTIFICATES_API,
} = endpoints;

/* ════════════════════════════════════════════════════
   INSTRUCTOR DASHBOARD
════════════════════════════════════════════════════ */

// Main stats: courses, students, earnings, monthly revenue, recent enrollments
export const fetchInstructorDashboard = async () => {
  try {
    const response = await axiosInstance.get(INSTRUCTOR_DASHBOARD_API);
    return response.data.data;
  } catch (error) {
    toast.error("Could not load dashboard stats");
    return null;
  }
};

// All students enrolled in instructor's courses
export const fetchInstructorStudents = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(
      `${INSTRUCTOR_STUDENTS_API}${params ? `?${params}` : ""}`
    );
    return response.data.data || [];
  } catch (error) {
    toast.error("Could not load student data");
    return [];
  }
};

// Earnings history
export const fetchInstructorEarnings = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(
      `${INSTRUCTOR_EARNINGS_API}${params ? `?${params}` : ""}`
    );
    return response.data;
  } catch (error) {
    toast.error("Could not load earnings");
    return null;
  }
};

// Quiz analytics (pass rates, avg scores across all courses)
export const fetchQuizAnalytics = async () => {
  try {
    const response = await axiosInstance.get(INSTRUCTOR_QUIZ_ANALYTICS_API);
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

// Watch analytics for a specific course
export const fetchWatchAnalytics = async (courseId) => {
  try {
    const response = await axiosInstance.get(
      INSTRUCTOR_WATCH_ANALYTICS(courseId)
    );
    return response.data.data;
  } catch (error) {
    return null;
  }
};

/* ════════════════════════════════════════════════════
   STUDENT DASHBOARD
════════════════════════════════════════════════════ */

// Full student dashboard data
export const fetchStudentDashboard = async () => {
  try {
    const response = await axiosInstance.get(STUDENT_DASHBOARD_API);
    return response.data.data;
  } catch (error) {
    toast.error("Could not load dashboard");
    return null;
  }
};

// Notifications
export const fetchNotifications = async () => {
  try {
    const response = await axiosInstance.get(GET_NOTIFICATIONS_API);
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

// Mark notifications as read — pass [] to mark all
export const markNotificationsRead = async (ids = []) => {
  try {
    await axiosInstance.put(MARK_NOTIFICATIONS_READ_API, { ids });
    return true;
  } catch (error) {
    return false;
  }
};

// Get earned certificates
export const fetchCertificates = async () => {
  try {
    const response = await axiosInstance.get(GET_CERTIFICATES_API);
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};