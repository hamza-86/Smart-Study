/**
 * Course Services
 * FILE: src/services/courseServices.js
 *
 * Covers: courses, categories, sections, subsections, quiz, assignments, progress
 */

import axios from "axios";
import { toast } from "react-hot-toast";
import { endpoints } from "./api";
import axiosInstance from "./axiosInstance";
import { setLoading } from "../slices/authSlice";

const {
  GET_ALL_COURSES_API,
  GET_COURSE_DETAILS,
  GET_INSTRUCTOR_COURSE_DETAILS,
  GET_COURSE_STUDENTS,
  CREATE_COURSE_API,
  GET_INSTRUCTOR_COURSES,
  EDIT_COURSE_API,
  DELETE_COURSE_API,
  PUBLISH_COURSE_API,
  GET_ALL_CATEGORIES,
  GET_CATEGORY_DETAILS,
  ADD_SECTION_API,
  ADD_SECTION_V2_API,
  UPDATE_SECTION_V2_API,
  UPDATE_SECTION_API,
  DELETE_SECTION_API,
  CREATE_SUBSECTION_API,
  CREATE_SUBSECTION_V2_API,
  UPDATE_SUBSECTION_V2_API,
  UPDATE_SUBSECTION_API,
  DELETE_SUBSECTION_API,
  GET_ENROLLED_COURSES,
  GET_COURSE_CONTENT,
  UPDATE_PROGRESS_API,
  UPDATE_WATCH_TIME_API,
  GET_COURSE_PROGRESS,
  GET_RESUME_INFO,
  GET_ALL_PROGRESS_API,
  CREATE_QUIZ_API,
  GET_QUIZ_API,
  SUBMIT_QUIZ_API,
  GET_MY_QUIZ_ATTEMPTS,
  CREATE_ASSIGNMENT_API,
  GET_COURSE_ASSIGNMENTS,
  SUBMIT_ASSIGNMENT_API,
  GET_MY_SUBMISSIONS_API,
  GET_WISHLIST_API,
  TOGGLE_WISHLIST_API,
  CREATE_REVIEW_API,
  GET_COURSE_REVIEWS,
} = endpoints;

/* ════════════════════════════════════════════════════
   COURSE BROWSING (Public)
════════════════════════════════════════════════════ */

// Get all published courses with optional filters
export const fetchAllCourses = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(
      `${GET_ALL_COURSES_API}${params ? `?${params}` : ""}`
    );
    return response.data.data || [];
  } catch (error) {
    console.error("Fetch courses error:", error);
    return [];
  }
};

// Get course detail page (public — video URLs hidden for non-enrolled)
export const fetchCourseDetails = async (courseId, dispatch) => {
  if (dispatch) dispatch(setLoading(true));
  const toastId = toast.loading("Loading course...");
  try {
    const response = await axiosInstance.get(GET_COURSE_DETAILS(courseId));
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not load course");
    return null;
  } finally {
    if (dispatch) dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};

// Get full course content (enrolled students only)
export const fetchCourseContent = async (courseId, dispatch) => {
  if (dispatch) dispatch(setLoading(true));
  const toastId = toast.loading("Loading course content...");
  try {
    const response = await axiosInstance.get(GET_COURSE_CONTENT(courseId));
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not load course content");
    return null;
  } finally {
    if (dispatch) dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};

// Compatibility alias used in CourseContent page
export const fetchEnrolledCourse = async (courseId, token, dispatch) => {
  if (dispatch) dispatch(setLoading(true));
  const toastId = toast.loading("Loading...");
  try {
    const response = await axiosInstance.get(GET_INSTRUCTOR_COURSE_DETAILS(courseId));
    return {
      status: 200,
      data: { data: { courseDetails: response.data.data } },
    };
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not fetch course");
    return null;
  } finally {
    if (dispatch) dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};

/* ════════════════════════════════════════════════════
   CATEGORIES
════════════════════════════════════════════════════ */

export const fetchCategories = async () => {
  try {
    const response = await axiosInstance.get(GET_ALL_CATEGORIES);
    return response.data.data || [];
  } catch (error) {
    console.error("Category fetch error:", error);
    return [];
  }
};

export const fetchCategoryDetails = async (categoryId) => {
  try {
    const response = await axiosInstance.post(GET_CATEGORY_DETAILS, {
      categoryId,
    });
    return response.data.data;
  } catch (error) {
    console.error("Category details error:", error);
    return null;
  }
};

/* ════════════════════════════════════════════════════
   INSTRUCTOR — COURSE MANAGEMENT
════════════════════════════════════════════════════ */

// Create course
export const createCourse = async (token, formData) => {
  const toastId = toast.loading("Creating course...");
  try {
    const response = await axiosInstance.post(CREATE_COURSE_API, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Course created successfully");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to create course");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Fetch instructor's own courses
export const fetchInstructorCourses = async (token, dispatch) => {
  if (dispatch) dispatch(setLoading(true));
  const toastId = toast.loading("Loading your courses...");
  try {
    const response = await axiosInstance.get(GET_INSTRUCTOR_COURSES);
    return Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not fetch courses");
    return [];
  } finally {
    if (dispatch) dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};

// Edit course
export const editCourse = async (courseId, formData) => {
  const toastId = toast.loading("Updating course...");
  try {
    const response = await axiosInstance.put(
      EDIT_COURSE_API(courseId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    toast.success("Course updated successfully");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update course");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Delete course
export const deleteCourse = async (courseId) => {
  const toastId = toast.loading("Deleting course...");
  try {
    const response = await axiosInstance.delete(DELETE_COURSE_API(courseId));
    toast.success("Course deleted successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not delete course");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Toggle publish/unpublish
export const togglePublishCourse = async (courseId) => {
  const toastId = toast.loading("Updating status...");
  try {
    const response = await axiosInstance.put(PUBLISH_COURSE_API(courseId));
    toast.success(response.data.message || "Status updated");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update status");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

/* ════════════════════════════════════════════════════
   SECTIONS
════════════════════════════════════════════════════ */

export const createSection = async (sectionName, courseId, token) => {
  const toastId = toast.loading("Adding section...");
  try {
    const response = await axiosInstance.post(ADD_SECTION_V2_API, {
      title: sectionName,
      courseId,
    });
    toast.success("Section added successfully");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to add section");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const editSection = async (sectionName, sectionId, token) => {
  const toastId = toast.loading("Updating section...");
  try {
    const response = await axiosInstance.put(UPDATE_SECTION_V2_API(sectionId), {
      title: sectionName,
    });
    toast.success("Section updated successfully");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update section");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// DELETE — sectionId and courseId go in request body
export const deleteSection = async (sectionId, courseId, token) => {
  const toastId = toast.loading("Deleting section...");
  try {
    const response = await axiosInstance.delete(DELETE_SECTION_API(sectionId), {
      data: { sectionId, courseId },
    });
    toast.success("Section deleted successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete section");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

/* ════════════════════════════════════════════════════
   SUBSECTIONS (Lectures)
════════════════════════════════════════════════════ */

export const addSubsection = async (formData, token) => {
  const toastId = toast.loading("Uploading lecture...");
  try {
    const response = await axiosInstance.post(
      CREATE_SUBSECTION_V2_API,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    toast.success("Lecture added successfully");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to add lecture");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const editSubsection = async (subSectionId, formData, token) => {
  const toastId = toast.loading("Updating lecture...");
  try {
    const response = await axiosInstance.put(
      UPDATE_SUBSECTION_V2_API(subSectionId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    toast.success("Lecture updated successfully");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update lecture");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// DELETE — subSectionId, sectionId, courseId go in body
export const deleteSubsection = async (subSectionId, sectionId, courseId, token) => {
  const toastId = toast.loading("Deleting lecture...");
  try {
    const response = await axiosInstance.delete(DELETE_SUBSECTION_API(subSectionId), {
      data: { subSectionId, sectionId, courseId },
    });
    toast.success("Lecture deleted successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete lecture");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

/* ════════════════════════════════════════════════════
   STUDENT — ENROLLED COURSES
════════════════════════════════════════════════════ */

export const getEnrolledCourses = async (token, dispatch) => {
  if (dispatch) dispatch(setLoading(true));
  const toastId = toast.loading("Loading your courses...");
  try {
    const response = await axiosInstance.get(GET_ENROLLED_COURSES);
    return response.data.data || [];
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not fetch enrolled courses");
    return [];
  } finally {
    if (dispatch) dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};

/* ════════════════════════════════════════════════════
   PROGRESS
════════════════════════════════════════════════════ */

// Mark a video as complete (called when video reaches 90%)
export const updateCourseProgress = async (courseId, subSectionId) => {
  try {
    const response = await axiosInstance.post(UPDATE_PROGRESS_API, {
      courseId,
      subSectionId,
    });
    return response.data.data;
  } catch (error) {
    console.error("Progress update error:", error);
    return null;
  }
};

// Update watch time periodically while video plays
export const updateWatchTime = async (courseId, subSectionId, watchedSeconds, totalSeconds, lastPosition) => {
  try {
    const response = await axiosInstance.post(UPDATE_WATCH_TIME_API, {
      courseId,
      subSectionId,
      watchedSeconds,
      totalSeconds,
      lastPosition,
    });
    return response.data.data;
  } catch (error) {
    // Silently fail — don't interrupt the user's video
    return null;
  }
};

// Get progress for one course
export const getCourseProgress = async (courseId) => {
  try {
    const response = await axiosInstance.get(GET_COURSE_PROGRESS(courseId));
    return response.data.data;
  } catch (error) {
    console.error("Get progress error:", error);
    return null;
  }
};

// Get resume position for a course
export const getResumeInfo = async (courseId) => {
  try {
    const response = await axiosInstance.get(GET_RESUME_INFO(courseId));
    return response.data.data;
  } catch (error) {
    return null;
  }
};

// Get progress for all enrolled courses
export const getAllProgress = async () => {
  try {
    const response = await axiosInstance.get(GET_ALL_PROGRESS_API);
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

/* ════════════════════════════════════════════════════
   QUIZ
════════════════════════════════════════════════════ */

// Instructor: create quiz
export const createQuiz = async (quizData) => {
  const toastId = toast.loading("Creating quiz...");
  try {
    const response = await axiosInstance.post(CREATE_QUIZ_API, quizData);
    toast.success("Quiz created successfully");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to create quiz");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Student: get quiz (answers stripped)
export const fetchQuiz = async (quizId) => {
  try {
    const response = await axiosInstance.get(GET_QUIZ_API(quizId));
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not load quiz");
    return null;
  }
};

// Student: submit quiz attempt
export const submitQuiz = async (quizId, answers, timeTaken, courseId) => {
  const toastId = toast.loading("Submitting quiz...");
  try {
    const response = await axiosInstance.post(SUBMIT_QUIZ_API(quizId), {
      answers,
      timeTaken,
      courseId,
    });
    toast.success("Quiz submitted successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Quiz submission failed");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Student: get own quiz attempts
export const getMyQuizAttempts = async (quizId) => {
  try {
    const response = await axiosInstance.get(GET_MY_QUIZ_ATTEMPTS(quizId));
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

/* ════════════════════════════════════════════════════
   ASSIGNMENTS
════════════════════════════════════════════════════ */

// Instructor: create assignment
export const createAssignment = async (assignmentData, files = []) => {
  const toastId = toast.loading("Creating assignment...");
  try {
    const formData = new FormData();
    Object.entries(assignmentData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    files.forEach((file) => formData.append("attachments", file));

    const response = await axiosInstance.post(CREATE_ASSIGNMENT_API, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Assignment created");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to create assignment");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Get assignments for a course
export const fetchCourseAssignments = async (courseId) => {
  try {
    const response = await axiosInstance.get(GET_COURSE_ASSIGNMENTS(courseId));
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

// Student: submit assignment
export const submitAssignment = async (assignmentId, notes, files) => {
  const toastId = toast.loading("Submitting assignment...");
  try {
    const formData = new FormData();
    formData.append("notes", notes || "");
    files.forEach((file) => formData.append("files", file));

    const response = await axiosInstance.post(
      SUBMIT_ASSIGNMENT_API(assignmentId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    toast.success("Assignment submitted successfully");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Submission failed");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

// Student: get own submissions for a course
export const getMySubmissions = async (courseId) => {
  try {
    const response = await axiosInstance.get(GET_MY_SUBMISSIONS_API(courseId));
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

/* ════════════════════════════════════════════════════
   WISHLIST
════════════════════════════════════════════════════ */

export const fetchWishlist = async () => {
  try {
    const response = await axiosInstance.get(GET_WISHLIST_API);
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

export const toggleWishlist = async (courseId) => {
  try {
    const response = await axiosInstance.post(TOGGLE_WISHLIST_API(courseId));
    return response.data;
  } catch (error) {
    toast.error("Could not update wishlist");
    return null;
  }
};

/* ════════════════════════════════════════════════════
   REVIEWS
════════════════════════════════════════════════════ */

export const createReview = async (courseId, rating, review) => {
  const toastId = toast.loading("Submitting review...");
  try {
    const response = await axiosInstance.post(CREATE_REVIEW_API, {
      courseId,
      rating,
      review,
    });
    toast.success("Review submitted");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to submit review");
    return null;
  } finally {
    toast.dismiss(toastId);
  }
};

export const fetchCourseReviews = async (courseId) => {
  try {
    const response = await axiosInstance.get(GET_COURSE_REVIEWS(courseId));
    return response.data.data || [];
  } catch (error) {
    return [];
  }
};

export const fetchInstructorCourseDetails = async (courseId, dispatch) => {
  if (dispatch) dispatch(setLoading(true));
  const toastId = toast.loading("Loading course...");
  try {
    const response = await axiosInstance.get(GET_INSTRUCTOR_COURSE_DETAILS(courseId));
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not load course details");
    return null;
  } finally {
    if (dispatch) dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
};

export const fetchCourseStudents = async (courseId) => {
  try {
    const response = await axiosInstance.get(GET_COURSE_STUDENTS(courseId));
    return response.data.data || { students: [], totalStudents: 0 };
  } catch (error) {
    return { students: [], totalStudents: 0 };
  }
};
