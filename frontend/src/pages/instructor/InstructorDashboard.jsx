import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { VscBook, VscCreditCard, VscOrganization } from "react-icons/vsc";
import { fetchInstructorCourses } from "../../services/courseServices";

const cardClass =
  "rounded-xl border border-richblack-700 bg-richblack-800 p-5 transition hover:border-richblack-500";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const authLoading = useSelector((state) => state.auth.loading);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const load = async () => {
      setLoading(true);
      const list = await fetchInstructorCourses(token, dispatch);
      setCourses(Array.isArray(list) ? list : []);
      setLoading(false);
    };

    load();
  }, [token, dispatch, navigate]);

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const totalStudents = courses.reduce(
      (sum, course) => sum + Number(course.totalStudents || 0),
      0
    );
    const totalEarnings = courses.reduce(
      (sum, course) => sum + Number(course.totalStudents || 0) * Number(course.price || 0),
      0
    );

    return { totalCourses, totalStudents, totalEarnings };
  }, [courses]);

  if (authLoading || loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-richblack-900">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-richblack-900 px-4 pb-16 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-richblack-5">Instructor Dashboard</h1>
            <p className="mt-2 text-sm text-richblack-300">
              Overview synced with your My Courses data source.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/add-course")}
            className="rounded-lg bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-richblack-900 transition hover:bg-yellow-100"
          >
            Create Course
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={cardClass}>
            <div className="mb-3 inline-flex rounded-lg bg-richblack-700 p-2 text-yellow-50">
              <VscBook size={20} />
            </div>
            <p className="text-sm text-richblack-300">Total Courses</p>
            <p className="mt-1 text-2xl font-bold text-richblack-5">{stats.totalCourses}</p>
          </div>
          <div className={cardClass}>
            <div className="mb-3 inline-flex rounded-lg bg-richblack-700 p-2 text-yellow-50">
              <VscOrganization size={20} />
            </div>
            <p className="text-sm text-richblack-300">Total Students</p>
            <p className="mt-1 text-2xl font-bold text-richblack-5">{stats.totalStudents}</p>
          </div>
          <div className={cardClass}>
            <div className="mb-3 inline-flex rounded-lg bg-richblack-700 p-2 text-yellow-50">
              <VscCreditCard size={20} />
            </div>
            <p className="text-sm text-richblack-300">Estimated Revenue</p>
            <p className="mt-1 text-2xl font-bold text-richblack-5">Rs {stats.totalEarnings}</p>
          </div>
        </div>

        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-richblack-5">Recent Courses</h2>
            <button
              onClick={() => navigate("/dashboard/my-courses")}
              className="text-sm font-medium text-yellow-50 hover:text-yellow-100"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {courses.slice(0, 5).map((course) => (
              <button
                key={course._id}
                onClick={() => navigate(`/dashboard/course/${course._id}`)}
                className="flex w-full items-center gap-3 rounded-lg border border-richblack-700 bg-richblack-900 p-3 text-left transition hover:border-richblack-500"
              >
                <img
                  src={course.thumbnail || "https://placehold.co/160x90?text=Course"}
                  alt={course.title}
                  className="h-14 w-24 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-richblack-5">{course.title}</p>
                  <p className="text-xs text-richblack-400">
                    {course.totalStudents || 0} students • Rs {course.price || 0}
                  </p>
                </div>
              </button>
            ))}
            {!courses.length ? (
              <p className="text-sm text-richblack-400">No courses yet. Create your first course to get started.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
