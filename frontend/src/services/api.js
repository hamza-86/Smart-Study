const BASE_URL =
  process.env.REACT_APP_BASE_URL ||
  "http://localhost:4000/api/v1";

export const endpoints = {
  // ================= AUTH =================
  SENDOTP_API: `${BASE_URL}/auth/sendotp`,
  SIGNUP_API: `${BASE_URL}/auth/signup`,
  LOGIN_API: `${BASE_URL}/auth/login`,
  LOGOUT_API: `${BASE_URL}/auth/logout`,

  // ================= COURSE =================
  GET_ALL_COURSES_API: `${BASE_URL}/course/getAllCourses`,
  CREATE_COURSE_API: `${BASE_URL}/course/createCourse`,
  GET_INSTRUCTOR_COURSES: `${BASE_URL}/course/getInstructorCourses`,
  GET_ENROLLED_COURSES: `${BASE_URL}/course/getEnrolledCourses`,

  // PARAM BASED ROUTES (IMPORTANT)
  GET_COURSE_DETAILS: (courseId) =>
    `${BASE_URL}/course/getCourseDetails/${courseId}`,

  DELETE_COURSE_API: (courseId) =>
    `${BASE_URL}/course/deleteCourse/${courseId}`,

  EDIT_COURSE_API: (courseId) =>
    `${BASE_URL}/course/editCourse/${courseId}`,

  // ================= CATEGORY =================
  GET_ALL_CATEGORIES: `${BASE_URL}/course/showAllCategories`,

  // ================= SECTION =================
  ADD_SECTION_API: `${BASE_URL}/course/createSection`,
  DELETE_SECTION_API: `${BASE_URL}/course/deleteSection`,
  UPDATE_SECTION_API: (sectionId) =>
    `${BASE_URL}/course/updateSection/${sectionId}`,

  // ================= SUBSECTION =================
  CREATE_SUBSECTION_API: `${BASE_URL}/course/createSubSection`,
  DELETE_SUBSECTION_API: `${BASE_URL}/course/deleteSubSection`,
  UPDATE_SUBSECTION_API: (subSectionId) =>
    `${BASE_URL}/course/updateSubSection/${subSectionId}`,

  // ================= PAYMENTS =================
  COURSE_PAYMENT_API: `${BASE_URL}/payment/capturePayment`,
  COURSE_VERIFY_API: `${BASE_URL}/payment/verifyPayment`,
  SEND_PAYMENT_SUCCESS_EMAIL_API: `${BASE_URL}/payment/sendPaymentSuccessEmail`,
};