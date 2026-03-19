/**
 * PublishCourse Page
 * FILE: src/pages/instructor/PublishCourse.jsx
 *
 * Changes from original:
 *  - Fixed import: togglePublishCourse + deleteCourse from courseServices.js
 *  - publishHandler now calls togglePublishCourse (actually publishes via API)
 *  - cancelPublished fixed: response is returned directly (not response.data)
 *  - Added loading states so buttons show feedback
 */

import React, { useEffect, useState } from "react";
import { MdDone } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { resetCourseState } from "../../slices/courseSlice";
import { togglePublishCourse, deleteCourse } from "../../services/courseServices";

// ── Step Badge ────────────────────────────────────────────────────────────────
const StepBadge = ({ step, current, done }) => {
  const isDone   = done || step < current;
  const isActive = step === current;
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
        ${isDone   ? "bg-yellow-50 border-yellow-50 text-richblack-900"             : ""}
        ${isActive ? "bg-[#251400] border-yellow-50 text-yellow-50"                 : ""}
        ${!isDone && !isActive ? "bg-richblack-800 border-richblack-600 text-richblack-400" : ""}
      `}
    >
      {isDone ? <MdDone size={18} /> : step}
    </div>
  );
};

const StepConnector = ({ done }) => (
  <div className={`flex-1 h-0.5 border-t-2 border-dashed transition-colors ${done ? "border-yellow-50" : "border-richblack-600"}`} />
);

// ── Main Component ────────────────────────────────────────────────────────────
const PublishCourse = () => {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const token         = useSelector((state) => state.auth.token);
  const courseDetails = useSelector((state) => state.course.course);

  const [publishing, setPublishing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!courseDetails) {
      navigate("/dashboard/add-course");
    }
  }, [courseDetails, navigate]);

  const courseId = courseDetails?._id;

  // Publish → call API to toggle status Draft → Published, then go to My Courses
  const publishHandler = async () => {
    setPublishing(true);
    const result = await togglePublishCourse(courseId);
    setPublishing(false);

    if (result) {
      dispatch(resetCourseState());
      navigate("/dashboard/my-courses");
    }
  };

  // Cancel → delete the draft course entirely
  const cancelPublished = async () => {
    setCancelling(true);
    const result = await deleteCourse(courseId);
    setCancelling(false);

    if (result) {
      dispatch(resetCourseState());
      navigate("/dashboard/my-courses");
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 mt-10 pb-16 px-4 bg-richblack-900">

      {/* Step Indicator */}
      <div className="flex items-center w-full max-w-xs mx-auto mb-10">
        <StepBadge step={1} current={3} />
        <StepConnector done />
        <StepBadge step={2} current={3} />
        <StepConnector done />
        <StepBadge step={3} current={3} />
      </div>

      {/* Content */}
      <div className="flex justify-center gap-6 flex-wrap">

        {/* Publish card */}
        <div className="w-full max-w-xl bg-richblack-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-richblack-5 text-xl font-semibold mb-1">
            Publish Settings
          </h2>
          <p className="text-richblack-400 text-sm mb-6">
            Your course is ready. Publishing it makes it visible to all students.
          </p>

          {/* Course summary */}
          {courseDetails && (
            <div className="flex items-center gap-4 p-4 bg-richblack-700 rounded-xl mb-6">
              {courseDetails.thumbnail && (
                <img
                  src={courseDetails.thumbnail}
                  alt={courseDetails.title}
                  className="w-20 h-14 object-cover rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-richblack-5 font-medium truncate">{courseDetails.title}</p>
                <p className="text-richblack-400 text-sm mt-0.5">
                  {courseDetails.totalLectures || 0} lectures ·{" "}
                  ₹{courseDetails.price}
                </p>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                Draft
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 rounded-xl border border-richblack-600 mb-6">
            <div className="w-5 h-5 rounded-full border-2 border-yellow-50 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-50" />
            </div>
            <p className="text-richblack-100 text-sm">
              Make this course publicly visible to all students
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={cancelPublished}
              disabled={cancelling || publishing}
              className="flex-1 py-3 rounded-lg border border-richblack-500 text-richblack-200 hover:bg-richblack-700 transition disabled:opacity-50"
            >
              {cancelling ? "Deleting..." : "Discard Course"}
            </button>
            <button
              onClick={publishHandler}
              disabled={publishing || cancelling}
              className="flex-1 py-3 rounded-lg bg-yellow-50 text-richblack-900 font-semibold hover:bg-yellow-100 transition disabled:opacity-50"
            >
              {publishing ? "Publishing..." : "Publish Course"}
            </button>
          </div>
        </div>

        {/* Tips sidebar */}
        <div className="hidden lg:block w-80 bg-richblack-800 rounded-2xl p-5 h-fit sticky top-24">
          <h3 className="text-white font-semibold text-lg mb-3">⚡ Before You Publish</h3>
          <ul className="text-richblack-200 text-sm space-y-2 leading-relaxed">
            {[
              "Make sure all videos are uploaded and playable.",
              "Review your course title and description.",
              "Set a competitive price for your target audience.",
              "Add a high-quality thumbnail (1024×576 recommended).",
              "You can unpublish the course later from My Courses.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-yellow-50 mt-0.5">›</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default PublishCourse;