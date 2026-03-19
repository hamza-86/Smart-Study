// /**
//  * Global Constants & Enums
//  */

// /**
//  * Account Types
//  */
// const ACCOUNT_TYPES = {
//   STUDENT: 'Student',
//   INSTRUCTOR: 'Instructor',
//   ADMIN: 'Admin',
// };

// /**
//  * Course Status
//  */
// const COURSE_STATUS = {
//   DRAFT: 'Draft',
//   PUBLISHED: 'Published',
//   ARCHIVED: 'Archived',
// };

// /**
//  * Payment Status
//  */
// const PAYMENT_STATUS = {
//   PENDING: 'Pending',
//   COMPLETED: 'Completed',
//   FAILED: 'Failed',
//   REFUNDED: 'Refunded',
// };

// /**
//  * Enrollment Status
//  */
// const ENROLLMENT_STATUS = {
//   ACTIVE: 'Active',
//   COMPLETED: 'Completed',
//   CANCELLED: 'Cancelled',
// };

// /**
//  * Review Status
//  */
// const REVIEW_STATUS = {
//   PENDING: 'Pending',
//   APPROVED: 'Approved',
//   REJECTED: 'Rejected',
// };

// /**
//  * Withdrawal Status
//  */
// const WITHDRAWAL_STATUS = {
//   PENDING: 'Pending',
//   APPROVED: 'Approved',
//   REJECTED: 'Rejected',
//   COMPLETED: 'Completed',
// };

// /**
//  * HTTP Status Codes
//  */
// const HTTP_STATUS = {
//   OK: 200,
//   CREATED: 201,
//   BAD_REQUEST: 400,
//   UNAUTHORIZED: 401,
//   FORBIDDEN: 403,
//   NOT_FOUND: 404,
//   CONFLICT: 409,
//   INTERNAL_SERVER_ERROR: 500,
//   SERVICE_UNAVAILABLE: 503,
// };

// /**
//  * Error Types
//  */
// const ERROR_TYPES = {
//   VALIDATION_ERROR: 'ValidationError',
//   AUTHENTICATION_ERROR: 'AuthenticationError',
//   AUTHORIZATION_ERROR: 'AuthorizationError',
//   NOT_FOUND_ERROR: 'NotFoundError',
//   CONFLICT_ERROR: 'ConflictError',
//   DATABASE_ERROR: 'DatabaseError',
//   EXTERNAL_API_ERROR: 'ExternalAPIError',
//   INTERNAL_ERROR: 'InternalError',
// };

// /**
//  * Pagination Defaults
//  */
// const PAGINATION = {
//   DEFAULT_PAGE: 1,
//   DEFAULT_LIMIT: 10,
//   MAX_LIMIT: 100,
// };

// /**
//  * Cache Durations (in seconds)
//  */
// const CACHE_DURATIONS = {
//   SHORT: 300, // 5 minutes
//   MEDIUM: 3600, // 1 hour
//   LONG: 86400, // 24 hours
// };

// /**
//  * Token Expiration (in seconds)
//  */
// const TOKEN_EXPIRY = {
//   ACCESS_TOKEN: 3600, // 1 hour
//   REFRESH_TOKEN: 604800, // 7 days
//   RESET_TOKEN: 1800, // 30 minutes
//   OTP_TOKEN: 600, // 10 minutes
// };

// /**
//  * Email Templates
//  */
// const EMAIL_TEMPLATES = {
//   VERIFY_EMAIL: 'verify-email',
//   PASSWORD_RESET: 'password-reset',
//   COURSE_ENROLLMENT: 'course-enrollment',
//   PAYMENT_SUCCESS: 'payment-success',
//   PAYMENT_FAILED: 'payment-failed',
//   COURSE_COMPLETION: 'course-completion',
// };

// /**
//  * Regex Patterns
//  */
// const REGEX_PATTERNS = {
//   EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//   PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
//   PHONE: /^[0-9]{10}$/,
//   URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
// };

// /**
//  * File Upload Limits
//  */
// const FILE_UPLOAD = {
//   MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
//   MAX_VIDEO_SIZE: 500 * 1024 * 1024, // 500MB
//   MAX_PDF_SIZE: 20 * 1024 * 1024, // 20MB
//   ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
//   ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
//   ALLOWED_PDF_TYPES: ['application/pdf'],
// };

// module.exports = {
//   ACCOUNT_TYPES,
//   COURSE_STATUS,
//   PAYMENT_STATUS,
//   ENROLLMENT_STATUS,
//   REVIEW_STATUS,
//   WITHDRAWAL_STATUS,
//   HTTP_STATUS,
//   ERROR_TYPES,
//   PAGINATION,
//   CACHE_DURATIONS,
//   TOKEN_EXPIRY,
//   EMAIL_TEMPLATES,
//   REGEX_PATTERNS,
//   FILE_UPLOAD,
// };

/**
 * Application Constants
 * FILE LOCATION: Backend/constants/index.js
 *
 * HOW TO USE:
 *   const { HTTP_STATUS, ACCOUNT_TYPES } = require("../constants");
 *   (Node auto-loads constants/index.js when you require the folder)
 */

// ── HTTP Status Codes ─────────────────────────────────────────────────────────
const HTTP_STATUS = {
  OK:                    200,
  CREATED:               201,
  NO_CONTENT:            204,
  BAD_REQUEST:           400,
  UNAUTHORIZED:          401,
  FORBIDDEN:             403,
  NOT_FOUND:             404,
  CONFLICT:              409,
  UNPROCESSABLE_ENTITY:  422,
  TOO_MANY_REQUESTS:     429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE:   503,
};

// ── Error Types ───────────────────────────────────────────────────────────────
const ERROR_TYPES = {
  VALIDATION_ERROR:     "ValidationError",
  AUTHENTICATION_ERROR: "AuthenticationError",
  AUTHORIZATION_ERROR:  "AuthorizationError",
  NOT_FOUND_ERROR:      "NotFoundError",
  CONFLICT_ERROR:       "ConflictError",
  DATABASE_ERROR:       "DatabaseError",
  EXTERNAL_API_ERROR:   "ExternalAPIError",
  RATE_LIMIT_ERROR:     "RateLimitError",
  FILE_UPLOAD_ERROR:    "FileUploadError",
  INTERNAL_ERROR:       "InternalError",
};

// ── Account Types ─────────────────────────────────────────────────────────────
const ACCOUNT_TYPES = {
  STUDENT:    "Student",
  INSTRUCTOR: "Instructor",
  ADMIN:      "Admin",
};

// ── Course Status ─────────────────────────────────────────────────────────────
const COURSE_STATUS = {
  DRAFT:        "Draft",
  UNDER_REVIEW: "UnderReview",
  PUBLISHED:    "Published",
  ARCHIVED:     "Archived",
};

// ── Payment Status ────────────────────────────────────────────────────────────
const PAYMENT_STATUS = {
  PENDING:   "Pending",
  COMPLETED: "Completed",
  FAILED:    "Failed",
  REFUNDED:  "Refunded",
};

// ── Enrollment Status ─────────────────────────────────────────────────────────
const ENROLLMENT_STATUS = {
  ACTIVE:    "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED:  "Refunded",
};

// ── Review Status ─────────────────────────────────────────────────────────────
const REVIEW_STATUS = {
  PENDING:  "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// ── Withdrawal Status ─────────────────────────────────────────────────────────
const WITHDRAWAL_STATUS = {
  PENDING:   "Pending",
  APPROVED:  "Approved",
  REJECTED:  "Rejected",
  COMPLETED: "Completed",
};

// ── Token Expiry ──────────────────────────────────────────────────────────────
const TOKEN_EXPIRY = {
  ACCESS_TOKEN:  process.env.JWT_ACCESS_EXPIRES  || "15m",
  REFRESH_TOKEN: process.env.JWT_REFRESH_EXPIRES || "7d",
  RESET_TOKEN:   "15m",
  OTP_EXPIRY_MS: 10 * 60 * 1000,
};

// ── Pagination Defaults ───────────────────────────────────────────────────────
const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT:     100,
};

// ── Cache Durations (seconds) ─────────────────────────────────────────────────
const CACHE_DURATIONS = {
  SHORT:  300,
  MEDIUM: 3600,
  LONG:   86400,
};

// ── Email Templates ───────────────────────────────────────────────────────────
const EMAIL_TEMPLATES = {
  VERIFY_EMAIL:      "verify-email",
  PASSWORD_RESET:    "password-reset",
  COURSE_ENROLLMENT: "course-enrollment",
  PAYMENT_SUCCESS:   "payment-success",
  PAYMENT_FAILED:    "payment-failed",
  COURSE_COMPLETION: "course-completion",
};

// ── File Upload Limits ────────────────────────────────────────────────────────
const FILE_UPLOAD = {
  MAX_IMAGE_SIZE: 5   * 1024 * 1024,
  MAX_VIDEO_SIZE: 500 * 1024 * 1024,
  MAX_DOC_SIZE:   20  * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/mkv", "video/mov", "video/mpeg", "video/quicktime"],
  ALLOWED_DOC_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
  ],
};

// ── Regex Patterns ────────────────────────────────────────────────────────────
const REGEX_PATTERNS = {
  EMAIL:    /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?`~])[A-Za-z\d@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?`~]{8,}$/,
  PHONE:    /^\d{7,15}$/,
  URL:      /^(https?:\/\/)([a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+)$/,
  MONGO_ID: /^[0-9a-fA-F]{24}$/,
};

// ── Cloudinary Folders ────────────────────────────────────────────────────────
const CLOUDINARY_FOLDERS = {
  THUMBNAILS:   `${process.env.FOLDER_NAME || "EduFlow"}/thumbnails`,
  VIDEOS:       `${process.env.FOLDER_NAME || "EduFlow"}/videos`,
  AVATARS:      `${process.env.FOLDER_NAME || "EduFlow"}/avatars`,
  ATTACHMENTS:  `${process.env.FOLDER_NAME || "EduFlow"}/attachments`,
  ASSIGNMENTS:  `${process.env.FOLDER_NAME || "EduFlow"}/assignments`,
  SUBMISSIONS:  `${process.env.FOLDER_NAME || "EduFlow"}/submissions`,
  CERTIFICATES: `${process.env.FOLDER_NAME || "EduFlow"}/certificates`,
};

// ── Notification Types ────────────────────────────────────────────────────────
const NOTIFICATION_TYPES = {
  ENROLLMENT:  "enrollment",
  REVIEW:      "review",
  QUIZ:        "quiz",
  ASSIGNMENT:  "assignment",
  PAYMENT:     "payment",
  CERTIFICATE: "certificate",
  SYSTEM:      "system",
  MESSAGE:     "message",
};

// ── Platform Defaults ─────────────────────────────────────────────────────────
const PLATFORM = {
  NAME:                   "EduFlow",
  SUPPORT_EMAIL:          "support@eduflow.com",
  INSTRUCTOR_REVENUE_PCT: 70,
  CURRENCY:               "INR",
};

module.exports = {
  HTTP_STATUS,
  ERROR_TYPES,
  ACCOUNT_TYPES,
  COURSE_STATUS,
  PAYMENT_STATUS,
  ENROLLMENT_STATUS,
  REVIEW_STATUS,
  WITHDRAWAL_STATUS,
  TOKEN_EXPIRY,
  PAGINATION,
  CACHE_DURATIONS,
  EMAIL_TEMPLATES,
  FILE_UPLOAD,
  REGEX_PATTERNS,
  CLOUDINARY_FOLDERS,
  NOTIFICATION_TYPES,
  PLATFORM,
};