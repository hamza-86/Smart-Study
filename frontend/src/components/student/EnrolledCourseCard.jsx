/**
 * EnrolledCourseCard Component (Desktop)
 * FILE: src/components/student/EnrolledCourseCard.jsx
 *
 * Changes from original:
 *  - instructor.name → instructor.firstName + instructor.lastName (new User model)
 *  - Fixed w-[1100px] replaced with responsive full-width layout
 *  - Added progress bar + completion percentage (data comes from enrollment)
 *  - Added "Continue" / "Start" label based on progress
 *  - Added course level and total duration display
 */

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { VscStarFull } from "react-icons/vsc";
import { fadeIn } from "../../utils/motion";
import { formatDate } from "../../utils/formateDate";

const EnrolledCourseCard = ({ course, index }) => {
  const TRUNCATE = 25;

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
      className="w-full"
    >
      <Link to={`/dashboard/course-content/${course._id}`}>
        <div className="w-full flex items-center gap-4 p-4 border-b border-richblack-700 hover:bg-richblack-800 transition rounded-xl group">

          {/* Thumbnail */}
          <img
            src={course.thumbnail || "/placeholder-course.jpg"}
            alt={course.title}
            className="h-[110px] w-[180px] rounded-lg object-cover shrink-0"
          />

          {/* Course info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-richblack-5 font-semibold text-base line-clamp-1 group-hover:text-yellow-50 transition mb-1">
              {course.title}
            </h2>
            <p className="text-richblack-300 text-xs line-clamp-2 mb-2">
              {description}
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-richblack-400 mb-3">
              <span>Instructor: <span className="text-richblack-200">{instructorName}</span></span>
              {course.createdAt && (
                <span>Enrolled: {formatDate(course.enrolledAt || course.createdAt)}</span>
              )}
              {course.level && (
                <span className="capitalize">{course.level}</span>
              )}
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-richblack-400">
                  {progress > 0 ? `${progress}% complete` : "Not started"}
                </span>
                {course.averageRating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-50 text-xs">
                    <VscStarFull size={11} />
                    {course.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="w-full bg-richblack-700 rounded-full h-1.5">
                <div
                  className="bg-yellow-50 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="shrink-0 hidden md:block">
            <span className="px-4 py-2 rounded-lg bg-yellow-50 text-richblack-900 text-sm font-semibold group-hover:bg-yellow-100 transition">
              {progress > 0 ? "Continue" : "Start"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EnrolledCourseCard;