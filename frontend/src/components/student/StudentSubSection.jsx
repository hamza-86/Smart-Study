/**
 * StudentSubSection Component
 * FILE: src/components/student/StudentSubSection.jsx
 *
 * Changes from original:
 *  - Accepts isCompleted prop — shows green tick for watched videos
 *  - Shows video duration if available
 *  - Better selected state — yellow highlight not just blue text
 *  - Hover state added
 *  - isPreview badge for free preview videos
 */

import React from "react";
import { HiOutlineVideoCamera } from "react-icons/hi";
import { VscCheck } from "react-icons/vsc";

const StudentSubSection = ({ subSec, handleVideoClick, isSelected, isCompleted }) => (
  <div
    onClick={() => handleVideoClick(subSec)}
    className={`
      flex items-center justify-between px-4 py-2.5 cursor-pointer
      border-b border-richblack-700 last:border-0
      transition-colors group
      ${isSelected
        ? "bg-yellow-50 bg-opacity-10 border-l-2 border-l-yellow-50"
        : "hover:bg-richblack-700"
      }
    `}
  >
    {/* Left: icon + title */}
    <div className="flex items-center gap-2.5 min-w-0">
      {isCompleted ? (
        <VscCheck
          size={14}
          className="text-caribbeangreen-300 shrink-0"
        />
      ) : (
        <HiOutlineVideoCamera
          size={14}
          className={`shrink-0 ${isSelected ? "text-yellow-50" : "text-richblack-400 group-hover:text-richblack-200"}`}
        />
      )}
      <p
        className={`text-xs truncate ${
          isSelected
            ? "text-yellow-50 font-medium"
            : isCompleted
            ? "text-richblack-200"
            : "text-richblack-300 group-hover:text-richblack-100"
        }`}
      >
        {subSec?.title}
      </p>
      {subSec?.isPreview && (
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-caribbeangreen-900 text-caribbeangreen-200">
          Preview
        </span>
      )}
    </div>

    {/* Right: duration */}
    {subSec?.timeDuration && (
      <span className="text-richblack-500 text-[10px] shrink-0 ml-2">
        {subSec.timeDuration}
      </span>
    )}
  </div>
);

export default StudentSubSection;