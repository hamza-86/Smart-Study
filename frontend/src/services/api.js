/**
 * API Endpoints
 * FILE: src/services/api.js
 *
 * All endpoints match the new backend routes:
 *   auth    → /api/v1/auth/...
 *   courses → /api/v1/courses/...
 *   payments→ /api/v1/payments/...
 *   etc.
 */

import { API_BASE_URL } from "../constants";

const BASE_URL = API_BASE_URL;

export const endpoints = {

  // ── Auth ────────────────────────────────────────────────────────────────────
  SENDOTP_API:          `${BASE_URL}/api/v1/auth/sendotp`,
  SIGNUP_API:           `${BASE_URL}/api/v1/auth/signup`,
  LOGIN_API:            `${BASE_URL}/api/v1/auth/login`,
  LOGOUT_API:           `${BASE_URL}/api/v1/auth/logout`,
  REFRESH_TOKEN_API:    `${BASE_URL}/api/v1/auth/refresh-token`,
  FORGOT_PASSWORD_API:  `${BASE_URL}/api/v1/auth/forgot-password`,
  RESET_PASSWORD_API:   `${BASE_URL}/api/v1/auth/reset-password`,
  CHANGE_PASSWORD_API:  `${BASE_URL}/api/v1/auth/change-password`,

  // ── Profile ─────────────────────────────────────────────────────────────────
  GET_PROFILE_API:      `${BASE_URL}/api/v1/auth/profile`,
  UPDATE_PROFILE_API:   `${BASE_URL}/api/v1/auth/profile`,
  UPLOAD_AVATAR_API:    `${BASE_URL}/api/v1/auth/upload-avatar`,

  // ── Wishlist ────────────────────────────────────────────────────────────────
  GET_WISHLIST_API:         `${BASE_URL}/api/v1/auth/wishlist`,
  TOGGLE_WISHLIST_API: (courseId) => `${BASE_URL}/api/v1/auth/wishlist/${courseId}`,

  // ── Courses (public browse) ─────────────────────────────────────────────────
  GET_ALL_COURSES_API: `${BASE_URL}/api/v1/courses/getAllCourses`,
  GET_COURSE_DETAILS:  (courseId) => `${BASE_URL}/api/v1/courses/getCourseDetails/${courseId}`,
  GET_INSTRUCTOR_COURSE_DETAILS: (courseId) => `${BASE_URL}/api/v1/courses/${courseId}/details`,
  GET_COURSE_STUDENTS: (courseId) => `${BASE_URL}/api/v1/courses/${courseId}/students`,

  // ── Courses (enrolled — student must be logged in) ──────────────────────────
  GET_ENROLLED_COURSES:     `${BASE_URL}/api/v1/payments/getEnrolledCourses`,
  GET_COURSE_CONTENT:   (courseId) => `${BASE_URL}/api/v1/courses/${courseId}/content`,

  // ── Courses (instructor management) ────────────────────────────────────────
  CREATE_COURSE_API:        `${BASE_URL}/api/v1/courses/createCourse`,
  GET_INSTRUCTOR_COURSES:   `${BASE_URL}/api/v1/courses/instructor`,
  EDIT_COURSE_API:      (courseId) => `${BASE_URL}/api/v1/courses/editCourse/${courseId}`,
  DELETE_COURSE_API:    (courseId) => `${BASE_URL}/api/v1/courses/deleteCourse/${courseId}`,
  PUBLISH_COURSE_API:   (courseId) => `${BASE_URL}/api/v1/courses/publishCourse/${courseId}`,

  // ── Categories ──────────────────────────────────────────────────────────────
  GET_ALL_CATEGORIES:       `${BASE_URL}/api/v1/categories/showAllCategories`,
  GET_CATEGORY_DETAILS:     `${BASE_URL}/api/v1/categories/categoryPageDetails`,
  GET_CATEGORY_BY_SLUG: (slug) => `${BASE_URL}/api/v1/categories/slug/${slug}`,

  // ── Sections ────────────────────────────────────────────────────────────────
  ADD_SECTION_API:          `${BASE_URL}/api/v1/courses/createSection`,
  ADD_SECTION_V2_API:       `${BASE_URL}/api/v1/sections`,
  UPDATE_SECTION_API:   (sectionId) => `${BASE_URL}/api/v1/courses/updateSection/${sectionId}`,
  UPDATE_SECTION_V2_API:(sectionId) => `${BASE_URL}/api/v1/sections/${sectionId}`,
  DELETE_SECTION_API:   (sectionId) => `${BASE_URL}/api/v1/sections/${sectionId}`,

  // ── SubSections (lectures) ──────────────────────────────────────────────────
  CREATE_SUBSECTION_API:    `${BASE_URL}/api/v1/courses/createSubSection`,
  CREATE_SUBSECTION_V2_API: `${BASE_URL}/api/v1/subsections`,
  UPDATE_SUBSECTION_API:(subSectionId) => `${BASE_URL}/api/v1/courses/updateSubSection/${subSectionId}`,
  UPDATE_SUBSECTION_V2_API:(subSectionId) => `${BASE_URL}/api/v1/subsections/${subSectionId}`,
  DELETE_SUBSECTION_API:(subSectionId) => `${BASE_URL}/api/v1/subsections/${subSectionId}`,

  // ── Quiz ────────────────────────────────────────────────────────────────────
  CREATE_QUIZ_API:          `${BASE_URL}/api/v1/courses/quiz`,
  GET_QUIZ_API:         (quizId) => `${BASE_URL}/api/v1/courses/quiz/${quizId}`,
  SUBMIT_QUIZ_API:      (quizId) => `${BASE_URL}/api/v1/courses/quiz/${quizId}/submit`,
  GET_MY_QUIZ_ATTEMPTS: (quizId) => `${BASE_URL}/api/v1/courses/quiz/${quizId}/my-attempts`,
  GET_ALL_QUIZ_ATTEMPTS:(quizId) => `${BASE_URL}/api/v1/courses/quiz/${quizId}/attempts`,

  // ── Assignments ─────────────────────────────────────────────────────────────
  CREATE_ASSIGNMENT_API:        `${BASE_URL}/api/v1/courses/assignments`,
  GET_COURSE_ASSIGNMENTS:   (courseId) => `${BASE_URL}/api/v1/courses/assignments/course/${courseId}`,
  SUBMIT_ASSIGNMENT_API:    (assignmentId) => `${BASE_URL}/api/v1/courses/assignments/${assignmentId}/submit`,
  GRADE_SUBMISSION_API:     (submissionId) => `${BASE_URL}/api/v1/courses/assignments/submissions/${submissionId}/grade`,
  GET_SUBMISSIONS_API:      (assignmentId) => `${BASE_URL}/api/v1/courses/assignments/${assignmentId}/submissions`,
  GET_MY_SUBMISSIONS_API:   (courseId) => `${BASE_URL}/api/v1/courses/assignments/my/${courseId}`,

  // ── Progress ─────────────────────────────────────────────────────────────────
  UPDATE_PROGRESS_API:      `${BASE_URL}/api/v1/progress/updateCourseProgress`,
  UPDATE_WATCH_TIME_API:    `${BASE_URL}/api/v1/progress/updateWatchTime`,
  GET_COURSE_PROGRESS:  (courseId) => `${BASE_URL}/api/v1/progress/getCourseProgress/${courseId}`,
  GET_RESUME_INFO:      (courseId) => `${BASE_URL}/api/v1/progress/getResumeInfo/${courseId}`,
  GET_ALL_PROGRESS_API:     `${BASE_URL}/api/v1/progress/getAllProgress`,

  // ── Payments ────────────────────────────────────────────────────────────────
  COURSE_PAYMENT_API:   `${BASE_URL}/api/v1/payments/capturePayment`,
  COURSE_VERIFY_API:    `${BASE_URL}/api/v1/payments/verifyPayment`,
  ENROLL_FREE_API:      `${BASE_URL}/api/v1/payments/enrollFree`,

  // ── Coupons ─────────────────────────────────────────────────────────────────
  VALIDATE_COUPON_API:  `${BASE_URL}/api/v1/coupons/validateCoupon`,

  // ── Reviews ─────────────────────────────────────────────────────────────────
  CREATE_REVIEW_API:        `${BASE_URL}/api/v1/reviews/createReview`,
  GET_COURSE_REVIEWS:   (courseId) => `${BASE_URL}/api/v1/reviews/getCourseReviews/${courseId}`,
  UPDATE_REVIEW_API:    (reviewId) => `${BASE_URL}/api/v1/reviews/updateReview/${reviewId}`,
  DELETE_REVIEW_API:    (reviewId) => `${BASE_URL}/api/v1/reviews/deleteReview/${reviewId}`,
  REPLY_TO_REVIEW_API:  (reviewId) => `${BASE_URL}/api/v1/reviews/replyToReview/${reviewId}`,

  // ── Instructor Dashboard ────────────────────────────────────────────────────
  INSTRUCTOR_DASHBOARD_API:     `${BASE_URL}/api/v1/instructor/dashboard`,
  INSTRUCTOR_STUDENTS_API:      `${BASE_URL}/api/v1/instructor/students`,
  INSTRUCTOR_EARNINGS_API:      `${BASE_URL}/api/v1/instructor/earnings`,
  INSTRUCTOR_QUIZ_ANALYTICS_API:`${BASE_URL}/api/v1/instructor/quiz-analytics`,
  INSTRUCTOR_WATCH_ANALYTICS:   (courseId) => `${BASE_URL}/api/v1/instructor/watch-analytics/${courseId}`,

  // ── Student Dashboard ───────────────────────────────────────────────────────
  STUDENT_DASHBOARD_API:        `${BASE_URL}/api/v1/student/dashboard`,
  GET_NOTIFICATIONS_API:        `${BASE_URL}/api/v1/student/notifications`,
  MARK_NOTIFICATIONS_READ_API:  `${BASE_URL}/api/v1/student/notifications/read`,
  GET_CERTIFICATES_API:         `${BASE_URL}/api/v1/student/certificates`,
};
