/**
 * App.js
 * FILE: src/App.js
 *
 * Full route map:
 *  Public        — Home, AllCourses, CourseDetails, Login, Signup, VerifyEmail,
 *                  ForgotPassword, ResetPassword
 *  Private       — all dashboard routes
 *  Instructor    — MyCourses, AddCourse, EditCourse, CreateSection, PublishCourse,
 *                  InstructorDashboard, InstructorStudents, InstructorEarnings
 *  Student       — EnrolledCourses, CourseContent, StudentDashboard, Certificates,
 *                  PurchaseHistory, Wishlist
 *  Shared        — Profile, Settings, Notifications
 */

import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

// Components (always loaded)
import Navbar       from "./components/Navbar";
import Sidebar      from "./components/Sidebar";
import PrivateRoute from "./components/auth/PrivateRoute";
import OpenRoute    from "./components/auth/OpenRoute";
import PageLoader   from "./components/common/PageLoader";

// ── Lazy-loaded Pages ──────────────────────────────────────────────────────────
// Public
const Home           = lazy(() => import("./pages/Home"));
const AllCourses     = lazy(() => import("./pages/AllCourse"));
const CourseDetails  = lazy(() => import("./pages/CourseDetails"));
const Login          = lazy(() => import("./pages/Login"));
const Signup         = lazy(() => import("./pages/Signup"));
const VerifyEmail    = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword  = lazy(() => import("./pages/ResetPassword"));
const Error          = lazy(() => import("./pages/Error"));

// Shared (logged-in, any role)
const DashboardPage  = lazy(() => import("./pages/DashboardPage"));
const Profile        = lazy(() => import("./pages/Profile"));
const Setting        = lazy(() => import("./pages/Setting"));

// Instructor pages
const MyCourses      = lazy(() => import("./pages/instructor/MyCourses"));
const AddCourse      = lazy(() => import("./pages/instructor/AddCourse"));
const EditCourse     = lazy(() => import("./pages/instructor/EditCourse"));
const CreateSection  = lazy(() => import("./pages/instructor/CreateSection"));
const PublishCourse  = lazy(() => import("./pages/instructor/PublishCourse"));
const InstructorDashboard = lazy(() => import("./pages/instructor/InstructorDashboard"));
const InstructorStudents  = lazy(() => import("./pages/instructor/InstructorStudents"));
const InstructorEarnings  = lazy(() => import("./pages/instructor/InstructorEarnings"));

// Student pages
const EnrolledCourses = lazy(() => import("./pages/student/EnrolledCourses"));
const CourseContent   = lazy(() => import("./pages/student/CourseContent"));
const PurchaseHistory = lazy(() => import("./pages/student/PurchaseHistory"));
const Certificates    = lazy(() => import("./pages/student/Certificates"));
const Wishlist        = lazy(() => import("./pages/student/Wishlist"));

// ── Helpers ───────────────────────────────────────────────────────────────────
const ACCOUNT_TYPE = { STUDENT: "Student", INSTRUCTOR: "Instructor" };

function App() {
  const user        = useSelector((state) => state.auth.user);
  const userRole    = String(user?.accountType || "").toLowerCase();
  const isInstructor = userRole === ACCOUNT_TYPE.INSTRUCTOR.toLowerCase();
  const isStudent    = userRole === ACCOUNT_TYPE.STUDENT.toLowerCase();

  return (
    <div className="bg-richblack-900 min-h-screen w-screen overflow-x-hidden">
      <Navbar />
      <Sidebar />

      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── Public Routes ─────────────────────────────────────────────── */}
          <Route path="/"                  element={<Home />} />
          <Route path="/allCourses"        element={<AllCourses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />

          {/* ── Open Routes (redirect away if already logged in) ───────────── */}
          <Route path="/signup"        element={<OpenRoute><Signup /></OpenRoute>} />
          <Route path="/login"         element={<OpenRoute><Login /></OpenRoute>} />
          <Route path="/verify-email"  element={<OpenRoute><VerifyEmail /></OpenRoute>} />
          <Route path="/forgot-password" element={<OpenRoute><ForgotPassword /></OpenRoute>} />
          <Route path="/reset-password/:token" element={<OpenRoute><ResetPassword /></OpenRoute>} />

          {/* ── Private Routes (must be logged in) ────────────────────────── */}
          <Route element={<PrivateRoute />}>

            {/* Shared — any logged-in user */}
            <Route path="/dashboard"                  element={<DashboardPage />} />
            <Route path="/dashboard/my-profile"       element={<Profile />} />
            <Route path="/dashboard/settings"         element={<Setting />} />

            {/* ── Instructor Routes ──────────────────────────────────────── */}
            {isInstructor && (
              <>
                {/* Overview dashboard */}
                <Route
                  path="/dashboard/instructor"
                  element={<InstructorDashboard />}
                />
                {/* Course management */}
                <Route path="/dashboard/my-courses"     element={<MyCourses />} />
                <Route path="/dashboard/add-course"     element={<AddCourse />} />
                <Route path="/dashboard/edit-course/:courseId" element={<EditCourse />} />
                <Route path="/dashboard/add-section"    element={<CreateSection />} />
                <Route path="/dashboard/publish-course" element={<PublishCourse />} />
                {/* Analytics */}
                <Route path="/dashboard/students"       element={<InstructorStudents />} />
                <Route path="/dashboard/earnings"       element={<InstructorEarnings />} />
              </>
            )}

            {/* ── Student Routes ─────────────────────────────────────────── */}
            {isStudent && (
              <>
                <Route
                  path="/dashboard/enrolled-courses"
                  element={<EnrolledCourses />}
                />
                <Route
                  path="/dashboard/course-content/:courseId"
                  element={<CourseContent />}
                />
                <Route
                  path="/dashboard/purchase-history"
                  element={<PurchaseHistory />}
                />
                <Route
                  path="/dashboard/certificates"
                  element={<Certificates />}
                />
                <Route
                  path="/dashboard/wishlist"
                  element={<Wishlist />}
                />
              </>
            )}

          </Route>

          {/* ── 404 ───────────────────────────────────────────────────────── */}
          <Route path="*" element={<Error />} />

        </Routes>
      </Suspense>
    </div>
  );
}

export default App;