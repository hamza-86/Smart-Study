/**
 * Frontend Constants
 * FILE: src/constants/index.js
 */

export const API_BASE_URL =
  process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1";

// ── Account Types ─────────────────────────────────────────────────────────────
export const ACCOUNT_TYPES = {
  STUDENT:    "Student",
  INSTRUCTOR: "Instructor",
  ADMIN:      "Admin",
};

// ── Course Status ─────────────────────────────────────────────────────────────
export const COURSE_STATUS = {
  DRAFT:        "Draft",
  UNDER_REVIEW: "UnderReview",
  PUBLISHED:    "Published",
  ARCHIVED:     "Archived",
};

// ── Course Level ──────────────────────────────────────────────────────────────
export const COURSE_LEVELS = [
  "All Levels",
  "Beginner",
  "Intermediate",
  "Advanced",
];

// ── Payment Status ────────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING:   "Pending",
  COMPLETED: "Completed",
  FAILED:    "Failed",
  REFUNDED:  "Refunded",
};

// ── HTTP Status ───────────────────────────────────────────────────────────────
export const HTTP_STATUS = {
  OK:                    200,
  CREATED:               201,
  BAD_REQUEST:           400,
  UNAUTHORIZED:          401,
  FORBIDDEN:             403,
  NOT_FOUND:             404,
  CONFLICT:              409,
  INTERNAL_SERVER_ERROR: 500,
};

// ── All App Routes ────────────────────────────────────────────────────────────
export const ROUTES = {
  // Public
  ROOT:           "/",
  ALL_COURSES:    "/allCourses",
  COURSE_DETAILS: (id) => `/courses/${id}`,

  // Auth (open routes — redirect away if logged in)
  SIGNUP:           "/signup",
  LOGIN:            "/login",
  VERIFY_EMAIL:     "/verify-email",
  FORGOT_PASSWORD:  "/forgot-password",
  RESET_PASSWORD:   (token) => `/reset-password/${token}`,

  // Shared dashboard (any logged-in user)
  DASHBOARD:          "/dashboard",
  DASHBOARD_PROFILE:  "/dashboard/my-profile",
  DASHBOARD_SETTINGS: "/dashboard/settings",

  // Instructor routes
  INSTRUCTOR_DASHBOARD: "/dashboard/instructor",
  INSTRUCTOR_COURSES:   "/dashboard/my-courses",
  INSTRUCTOR_STUDENTS:  "/dashboard/students",
  INSTRUCTOR_EARNINGS:  "/dashboard/earnings",
  ADD_COURSE:           "/dashboard/add-course",
  EDIT_COURSE:      (id) => `/dashboard/edit-course/${id}`,
  ADD_SECTION:          "/dashboard/add-section",
  PUBLISH_COURSE:       "/dashboard/publish-course",

  // Student routes
  ENROLLED_COURSES:  "/dashboard/enrolled-courses",
  COURSE_CONTENT: (id) => `/dashboard/course-content/${id}`,
  PURCHASE_HISTORY:  "/dashboard/purchase-history",
  CERTIFICATES:      "/dashboard/certificates",
  WISHLIST:          "/dashboard/wishlist",

  // Error
  ERROR: "*",
};

// ── Sidebar Links ─────────────────────────────────────────────────────────────
// Kept in constants so Sidebar and App.js share one source of truth
export const SIDEBAR_LINKS = {
  SHARED: [
    { id: 1, name: "Dashboard",   path: ROUTES.DASHBOARD,         icon: "VscDashboard"   },
    { id: 2, name: "My Profile",  path: ROUTES.DASHBOARD_PROFILE, icon: "VscAccount"     },
  ],
  INSTRUCTOR: [
    { id: 3, name: "Overview",      path: ROUTES.INSTRUCTOR_DASHBOARD, icon: "VscGraph"       },
    { id: 4, name: "My Courses",    path: ROUTES.INSTRUCTOR_COURSES,   icon: "VscVm"          },
    { id: 5, name: "Add Course",    path: ROUTES.ADD_COURSE,            icon: "VscAdd"         },
    { id: 6, name: "Students",      path: ROUTES.INSTRUCTOR_STUDENTS,   icon: "VscPeople"      },
    { id: 7, name: "Earnings",      path: ROUTES.INSTRUCTOR_EARNINGS,   icon: "VscCreditCard"  },
  ],
  STUDENT: [
    { id: 8,  name: "My Learning",      path: ROUTES.ENROLLED_COURSES, icon: "VscMortarBoard" },
    { id: 9,  name: "Wishlist",         path: ROUTES.WISHLIST,          icon: "VscHeart"       },
    { id: 10, name: "Certificates",     path: ROUTES.CERTIFICATES,      icon: "VscAward"       },
    { id: 11, name: "Purchase History", path: ROUTES.PURCHASE_HISTORY,  icon: "VscHistory"     },
  ],
};

// ── Validation ────────────────────────────────────────────────────────────────
export const REGEX = {
  EMAIL:    /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
  PHONE:    /^\+?[\d\s\-()]{7,15}$/,
};

// ── File Limits ───────────────────────────────────────────────────────────────
export const MAX_IMAGE_SIZE = 5   * 1024 * 1024; // 5 MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB
export const MAX_DOC_SIZE   = 20  * 1024 * 1024; // 20 MB

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/mov"];

// ── UI ────────────────────────────────────────────────────────────────────────
export const PAGINATION_LIMIT = 12;
export const TOAST_DURATION   = 3000;

// ── Rating ────────────────────────────────────────────────────────────────────
export const RATING_LABELS = {
  1: "Terrible",
  2: "Bad",
  3: "OK",
  4: "Good",
  5: "Excellent",
};