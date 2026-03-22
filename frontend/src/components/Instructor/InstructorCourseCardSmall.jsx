/**
 * InstructorCourseCardSmall Component (Mobile)
 * FILE: src/components/Instructor/InstructorCourseCardSmall.jsx
 *
 * Changes from original:
 *  - Response check fixed: deleteCourse returns data directly
 *    (original had `if (response.status === 200)` which always failed
 *     because the service no longer returns an axios response object)
 *  - Replaced inline delete modal with ConfirmDialog component
 *  - Added navigate to edit course on edit button click
 *  - Added course status badge
 *  - Added loading state on delete
 */

import React, { useState } from "react";
import { useNavigate }      from "react-router-dom";
import { FiEdit2 }          from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { motion }           from "framer-motion";

import ConfirmDialogue      from "../common/ConfirmDialogue";
import { fadeIn }           from "../../utils/motion";
import { formatDate }       from "../../utils/formateDate";
import { deleteCourse }     from "../../services/courseServices";

const statusColors = {
  Published:   "bg-caribbeangreen-900 text-caribbeangreen-200",
  Draft:       "bg-richblack-700 text-richblack-300",
  Archived:    "bg-pink-900 text-pink-300",
  UnderReview: "bg-blue-900 text-blue-300",
};

const TRUNCATE = 10; // words

const InstructorCourseCardSmall = ({ course, token, onDelete, index }) => {
  const navigate = useNavigate();
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [deleting,     setDeleting]   = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    // Returns data directly — no .status === 200 check needed
    const result = await deleteCourse(course._id, token);
    setDeleting(false);
    setDeleteOpen(false);
    if (result) onDelete(course._id);
  };

  const words       = course.description?.split(" ") || [];
  const description = words.length > TRUNCATE
    ? words.slice(0, TRUNCATE).join(" ") + "..."
    : course.description;

  const status     = course.status || "Draft";
  const badgeClass = statusColors[status] || statusColors.Draft;

  return (
    <motion.div
      variants={fadeIn("up", "spring", index * 0.1, 0.5)}
      initial="hidden"
      animate="show"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/dashboard/course/${course._id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/dashboard/course/${course._id}`);
          }
        }}
        className="bg-richblack-800 w-[300px] text-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition text-left"
      >

        {/* Thumbnail */}
        <div className="relative">
          <img
            src={course.thumbnail || "/placeholder-course.jpg"}
            alt={course.title}
            className="h-[180px] w-full object-cover"
            loading="lazy"
          />
          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
            {status}
          </span>
        </div>

        {/* Details */}
        <div className="p-4">
          <h2 className="font-semibold text-sm line-clamp-2 mb-1">{course.title}</h2>
          <p className="text-xs text-richblack-400 line-clamp-2 mb-2">{description}</p>
          <p className="text-xs text-richblack-400 mb-3">
            Created: {formatDate(course.createdAt)}
          </p>

          <div className="flex items-center justify-between">
            <p className="font-bold text-richblack-5">₹{course.price}</p>

            <div className="flex items-center gap-1 text-richblack-300">
              <button
                title="Edit course"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/dashboard/edit-course/${course._id}`);
                }}
                className="p-1.5 rounded-lg hover:bg-richblack-700 hover:text-caribbeangreen-300 transition"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                title="Delete course"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
                className="p-1.5 rounded-lg hover:bg-richblack-700 hover:text-pink-400 transition"
              >
                <RiDeleteBin6Line size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialogue
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Course?"
        message={`"${course.title}" and all its content will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete Course"
      />
    </motion.div>
  );
};

export default InstructorCourseCardSmall;
