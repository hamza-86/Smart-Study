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

const BASE_URL =
  process.env.REACT_APP_BASE_URL || "http://localhost:5000/api/v1";

export const endpoints = {

  // ── Auth ────────────────────────────────────────────────────────────────────
  SENDOTP_API:          `${BASE_URL}/auth/sendotp`,
  SIGNUP_API:           `${BASE_URL}/auth/signup`,
  LOGIN_API:            `${BASE_URL}/auth/login`,
  LOGOUT_API:           `${BASE_URL}/auth/logout`,
  REFRESH_TOKEN_API:    `${BASE_URL}/auth/refresh-token`,
  FORGOT_PASSWORD_API:  `${BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD_API:   `${BASE_URL}/auth/reset-password`,
  CHANGE_PASSWORD_API:  `${BASE_URL}/auth/change-password`,

  // ── Profile ─────────────────────────────────────────────────────────────────
  GET_PROFILE_API:      `${BASE_URL}/auth/profile`,
  UPDATE_PROFILE_API:   `${BASE_URL}/auth/profile`,
  UPLOAD_AVATAR_API:    `${BASE_URL}/auth/upload-avatar`,

  // ── Wishlist ────────────────────────────────────────────────────────────────
  GET_WISHLIST_API:         `${BASE_URL}/auth/wishlist`,
  TOGGLE_WISHLIST_API: (courseId) => `${BASE_URL}/auth/wishlist/${courseId}`,

  // ── Courses (public browse) ─────────────────────────────────────────────────
  GET_ALL_COURSES_API: `${BASE_URL}/courses/getAllCourses`,
  GET_COURSE_DETAILS:  (courseId) => `${BASE_URL}/courses/getCourseDetails/${courseId}`,
  GET_INSTRUCTOR_COURSE_DETAILS: (courseId) => `${BASE_URL}/courses/${courseId}/details`,
  GET_COURSE_STUDENTS: (courseId) => `${BASE_URL}/courses/${courseId}/students`,

  // ── Courses (enrolled — student must be logged in) ──────────────────────────
  GET_ENROLLED_COURSES:     `${BASE_URL}/payments/getEnrolledCourses`,
  GET_COURSE_CONTENT:   (courseId) => `${BASE_URL}/courses/${courseId}/content`,

  // ── Courses (instructor management) ────────────────────────────────────────
  CREATE_COURSE_API:        `${BASE_URL}/courses/createCourse`,
  GET_INSTRUCTOR_COURSES:   `${BASE_URL}/courses/instructor`,
  EDIT_COURSE_API:      (courseId) => `${BASE_URL}/courses/editCourse/${courseId}`,
  DELETE_COURSE_API:    (courseId) => `${BASE_URL}/courses/deleteCourse/${courseId}`,
  PUBLISH_COURSE_API:   (courseId) => `${BASE_URL}/courses/publishCourse/${courseId}`,

  // ── Categories ──────────────────────────────────────────────────────────────
  GET_ALL_CATEGORIES:       `${BASE_URL}/categories/showAllCategories`,
  GET_CATEGORY_DETAILS:     `${BASE_URL}/categories/categoryPageDetails`,
  GET_CATEGORY_BY_SLUG: (slug) => `${BASE_URL}/categories/slug/${slug}`,

  // ── Sections ────────────────────────────────────────────────────────────────
  ADD_SECTION_API:          `${BASE_URL}/courses/createSection`,
  ADD_SECTION_V2_API:       `${BASE_URL}/sections`,
  UPDATE_SECTION_API:   (sectionId) => `${BASE_URL}/courses/updateSection/${sectionId}`,
  UPDATE_SECTION_V2_API:(sectionId) => `${BASE_URL}/sections/${sectionId}`,
  DELETE_SECTION_API:   (sectionId) => `${BASE_URL}/sections/${sectionId}`,

  // ── SubSections (lectures) ──────────────────────────────────────────────────
  CREATE_SUBSECTION_API:    `${BASE_URL}/courses/createSubSection`,
  CREATE_SUBSECTION_V2_API: `${BASE_URL}/subsections`,
  UPDATE_SUBSECTION_API:(subSectionId) => `${BASE_URL}/courses/updateSubSection/${subSectionId}`,
  UPDATE_SUBSECTION_V2_API:(subSectionId) => `${BASE_URL}/subsections/${subSectionId}`,
  DELETE_SUBSECTION_API:(subSectionId) => `${BASE_URL}/subsections/${subSectionId}`,

  // ── Quiz ────────────────────────────────────────────────────────────────────
  CREATE_QUIZ_API:          `${BASE_URL}/courses/quiz`,
  GET_QUIZ_API:         (quizId) => `${BASE_URL}/courses/quiz/${quizId}`,
  SUBMIT_QUIZ_API:      (quizId) => `${BASE_URL}/courses/quiz/${quizId}/submit`,
  GET_MY_QUIZ_ATTEMPTS: (quizId) => `${BASE_URL}/courses/quiz/${quizId}/my-attempts`,
  GET_ALL_QUIZ_ATTEMPTS:(quizId) => `${BASE_URL}/courses/quiz/${quizId}/attempts`,

  // ── Assignments ─────────────────────────────────────────────────────────────
  CREATE_ASSIGNMENT_API:        `${BASE_URL}/courses/assignments`,
  GET_COURSE_ASSIGNMENTS:   (courseId) => `${BASE_URL}/courses/assignments/course/${courseId}`,
  SUBMIT_ASSIGNMENT_API:    (assignmentId) => `${BASE_URL}/courses/assignments/${assignmentId}/submit`,
  GRADE_SUBMISSION_API:     (submissionId) => `${BASE_URL}/courses/assignments/submissions/${submissionId}/grade`,
  GET_SUBMISSIONS_API:      (assignmentId) => `${BASE_URL}/courses/assignments/${assignmentId}/submissions`,
  GET_MY_SUBMISSIONS_API:   (courseId) => `${BASE_URL}/courses/assignments/my/${courseId}`,

  // ── Progress ─────────────────────────────────────────────────────────────────
  UPDATE_PROGRESS_API:      `${BASE_URL}/progress/updateCourseProgress`,
  UPDATE_WATCH_TIME_API:    `${BASE_URL}/progress/updateWatchTime`,
  GET_COURSE_PROGRESS:  (courseId) => `${BASE_URL}/progress/getCourseProgress/${courseId}`,
  GET_RESUME_INFO:      (courseId) => `${BASE_URL}/progress/getResumeInfo/${courseId}`,
  GET_ALL_PROGRESS_API:     `${BASE_URL}/progress/getAllProgress`,

  // ── Payments ────────────────────────────────────────────────────────────────
  COURSE_PAYMENT_API:   `${BASE_URL}/payments/capturePayment`,
  COURSE_VERIFY_API:    `${BASE_URL}/payments/verifyPayment`,
  ENROLL_FREE_API:      `${BASE_URL}/payments/enrollFree`,

  // ── Coupons ─────────────────────────────────────────────────────────────────
  VALIDATE_COUPON_API:  `${BASE_URL}/coupons/validateCoupon`,

  // ── Reviews ─────────────────────────────────────────────────────────────────
  CREATE_REVIEW_API:        `${BASE_URL}/reviews/createReview`,
  GET_COURSE_REVIEWS:   (courseId) => `${BASE_URL}/reviews/getCourseReviews/${courseId}`,
  UPDATE_REVIEW_API:    (reviewId) => `${BASE_URL}/reviews/updateReview/${reviewId}`,
  DELETE_REVIEW_API:    (reviewId) => `${BASE_URL}/reviews/deleteReview/${reviewId}`,
  REPLY_TO_REVIEW_API:  (reviewId) => `${BASE_URL}/reviews/replyToReview/${reviewId}`,

  // ── Instructor Dashboard ────────────────────────────────────────────────────
  INSTRUCTOR_DASHBOARD_API:     `${BASE_URL}/instructor/dashboard`,
  INSTRUCTOR_STUDENTS_API:      `${BASE_URL}/instructor/students`,
  INSTRUCTOR_EARNINGS_API:      `${BASE_URL}/instructor/earnings`,
  INSTRUCTOR_QUIZ_ANALYTICS_API:`${BASE_URL}/instructor/quiz-analytics`,
  INSTRUCTOR_WATCH_ANALYTICS:   (courseId) => `${BASE_URL}/instructor/watch-analytics/${courseId}`,

  // ── Student Dashboard ───────────────────────────────────────────────────────
  STUDENT_DASHBOARD_API:        `${BASE_URL}/student/dashboard`,
  GET_NOTIFICATIONS_API:        `${BASE_URL}/student/notifications`,
  MARK_NOTIFICATIONS_READ_API:  `${BASE_URL}/student/notifications/read`,
  GET_CERTIFICATES_API:         `${BASE_URL}/student/certificates`,
};
