/**
 * EnrolledCourseCardSmall Component (Mobile)
 * FILE: src/components/student/EnrolledCourseCardSmall.jsx
 *
 * Changes from original:
 *  - Component was named InstructorCourseCardSmall (wrong name!) — fixed
 *  - instructor.name → instructor.firstName + instructor.lastName
 *  - Added progress bar + completion percentage
 *  - Added "Continue" / "Start" CTA button
 */

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeIn } from "../../utils/motion";
import { formatDate } from "../../utils/formateDate";

const EnrolledCourseCardSmall = ({ course, index }) => {
  const TRUNCATE = 10;

  const description =
    course?.description?.split(" ").length > TRUNCATE
      ? course?.description?.split(" ")?.slice(0, TRUNCATE)?.join(" ") + "..."
      : course?.description;

  const instructorName = course?.instructor
    ? `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() ||
      "Unknown Instructor"
    : "Unknown Instructor";

  const progress = course?.completionPercentage ?? 0;

  return (
    <motion.div
      variants={fadeIn("up", "spring", index * 0.05, 0.5)}
      initial="hidden"
      animate="show"
    >
      <Link to={`/dashboard/course-content/${course._id}`}>
        <div className="bg-richblack-800 w-[300px] text-white rounded-xl shadow-md overflow-hidden hover:scale-105 transition-transform">

          {/* Thumbnail */}
          <div className="relative">
            <img
              src={course.thumbnail || "/placeholder-course.jpg"}
              alt={course.title}
              className="h-[180px] w-full object-cover"
              loading="lazy"
            />
            {/* Progress overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-richblack-900">
              <div
                className="h-full bg-yellow-50 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-4">
            <h2 className="font-semibold text-sm line-clamp-2 mb-1">{course.title}</h2>
            <p className="text-xs text-richblack-400 line-clamp-2 mb-2">{description}</p>
            <p className="text-xs text-richblack-400 mb-1">
              Instructor: {instructorName}
            </p>
            {course.enrolledAt && (
              <p className="text-xs text-richblack-500 mb-3">
                Enrolled: {formatDate(course.enrolledAt)}
              </p>
            )}

            {/* Progress + CTA */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-richblack-300">
                {progress > 0 ? `${progress}% done` : "Not started"}
              </span>
              <span className="px-3 py-1 rounded-lg bg-yellow-50 text-richblack-900 text-xs font-semibold">
                {progress > 0 ? "Continue" : "Start"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EnrolledCourseCardSmall;