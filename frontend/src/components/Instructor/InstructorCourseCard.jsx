/**
 * InstructorCourseCard Component (Desktop)
 * FILE: src/components/Instructor/InstructorCourseCard.jsx
 *
 * Changes from original:
 *  - deleteCourse returns data directly — removed response.status === 200 check
 *    (original would always run onDelete regardless of API result)
 *  - Replaced inline delete modal with ConfirmDialog component
 *  - Added navigate to edit course on edit button click
 *  - Added course status badge (Draft / Published)
 *  - Added loading state on delete
 *  - Fixed layout to be fully responsive (removed fixed w-[1100px])
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
  Published:  "bg-caribbeangreen-900 text-caribbeangreen-200",
  Draft:      "bg-richblack-700 text-richblack-300",
  Archived:   "bg-pink-900 text-pink-300",
  UnderReview:"bg-blue-900 text-blue-300",
};

const TRUNCATE = 30; // words

const InstructorCourseCard = ({ course, token, onDelete, index }) => {
  const navigate = useNavigate();
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [deleting,     setDeleting]   = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    // deleteCourse now returns data directly (not wrapped in response.data)
    const result = await deleteCourse(course._id, token);
    setDeleting(false);
    setDeleteOpen(false);
    if (result) onDelete(course._id);
  };

  const words        = course.description?.split(" ") || [];
  const description  = words.length > TRUNCATE
    ? words.slice(0, TRUNCATE).join(" ") + "..."
    : course.description;

  const status = course.status || "Draft";
  const badgeClass = statusColors[status] || statusColors.Draft;

  return (
    <motion.div
      variants={fadeIn("up", "spring", index * 0.1, 0.5)}
      initial="hidden"
      animate="show"
    >
      <div className="w-full flex items-center gap-4 p-4 border-b border-richblack-700 hover:bg-richblack-800 transition rounded-xl">

        {/* Thumbnail */}
        <img
          src={course.thumbnail || "/placeholder-course.jpg"}
          alt={course.title}
          className="h-[110px] w-[180px] rounded-lg object-cover shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h2 className="text-richblack-5 font-semibold text-base leading-snug line-clamp-1">
              {course.title}
            </h2>
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
              {status}
            </span>
          </div>
          <p className="text-richblack-300 text-xs line-clamp-2 mb-2">
            {description}
          </p>
          <p className="text-richblack-400 text-xs">
            Created: {formatDate(course.createdAt)}
          </p>
        </div>

        {/* Stats + actions */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-center hidden xl:block">
            <p className="text-richblack-200 text-sm font-medium">
              {course.totalDuration
                ? `${Math.round(course.totalDuration)} min`
                : "—"}
            </p>
            <p className="text-richblack-500 text-xs">Duration</p>
          </div>

          <div className="text-center">
            <p className="text-richblack-5 text-sm font-bold">
              ₹{course.price}
            </p>
            <p className="text-richblack-500 text-xs">Price</p>
          </div>

          <div className="flex items-center gap-1 text-richblack-300">
            <button
              title="Edit course"
              onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
              className="p-2 rounded-lg hover:bg-richblack-700 hover:text-caribbeangreen-300 transition"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              title="Delete course"
              onClick={() => setDeleteOpen(true)}
              className="p-2 rounded-lg hover:bg-richblack-700 hover:text-pink-400 transition"
            >
              <RiDeleteBin6Line size={18} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialogue
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Course?"
        message={`"${course.title}" and all its content will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete Course"
      />
    </motion.div>
  );
};

export default InstructorCourseCard;