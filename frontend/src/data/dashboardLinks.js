/**
 * Sidebar Links Data
 * FILE: src/data/sidebarLinks.js
 *
 * Changes from original:
 *  - Added Instructor Overview, Students, Earnings links
 *  - Added Student Certificates, Wishlist, Purchase History links
 *  - Fixed /dashboard/cart → /dashboard/purchase-history
 *  - Removed the "Courses" link that pointed to /allCourses
 *    (that belongs in Navbar, not Sidebar)
 */

const ACCOUNT_TYPE = {
  STUDENT:    "Student",
  INSTRUCTOR: "Instructor",
  ADMIN:      "Admin",
};

export const sidebarLinks = [

  // ── Shared (shown to all logged-in users) ─────────────────────────────────
  {
    id:   1,
    name: "Dashboard",
    path: "/dashboard",
    icon: "VscDashboard",
    // no type = shown to everyone
  },
  {
    id:   2,
    name: "My Profile",
    path: "/dashboard/my-profile",
    icon: "VscAccount",
  },

  // ── Instructor ────────────────────────────────────────────────────────────
  {
    id:   3,
    name: "Overview",
    path: "/dashboard/instructor",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscOutput",
  },
  {
    id:   4,
    name: "My Courses",
    path: "/dashboard/my-courses",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVm",
  },
  {
    id:   5,
    name: "Add Course",
    path: "/dashboard/add-course",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscAdd",
  },
  {
    id:   6,
    name: "Students",
    path: "/dashboard/students",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscPeople",
  },
  {
    id:   7,
    name: "Earnings",
    path: "/dashboard/earnings",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscCreditCard",
  },

  // ── Student ───────────────────────────────────────────────────────────────
  {
    id:   8,
    name: "My Learning",
    path: "/dashboard/enrolled-courses",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscBook",
  },
  {
    id:   9,
    name: "Wishlist",
    path: "/dashboard/wishlist",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscHeart",
  },
  {
    id:   10,
    name: "Certificates",
    path: "/dashboard/certificates",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscAward",
  },
  {
    id:   11,
    name: "Purchase History",
    path: "/dashboard/purchase-history",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscHistory",
  },
];