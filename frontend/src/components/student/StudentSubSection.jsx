import React from "react";
import { HiOutlineVideoCamera } from "react-icons/hi";
import { VscCheck } from "react-icons/vsc";
import { PiNotePencilLight, PiQuestionLight } from "react-icons/pi";

const iconByType = {
  video: HiOutlineVideoCamera,
  notes: PiNotePencilLight,
  note: PiNotePencilLight,
  quiz: PiQuestionLight,
};

const StudentSubSection = ({ subSec, handleVideoClick, isSelected, isCompleted }) => {
  const type = String(subSec?.type || "video").toLowerCase();
  const Icon = iconByType[type] || HiOutlineVideoCamera;

  return (
    <div
      onClick={() => handleVideoClick(subSec)}
      className={`flex cursor-pointer items-center justify-between border-b border-richblack-700 px-4 py-2.5 last:border-0 transition-colors ${
        isSelected ? "border-l-2 border-l-yellow-50 bg-yellow-50/10" : "hover:bg-richblack-700"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px] text-richblack-400">
          {isCompleted ? <VscCheck size={14} className="text-caribbeangreen-300" /> : <Icon size={14} />}
          <span>{String(type).toUpperCase()}</span>
        </div>
        <p className={`truncate text-xs ${isSelected ? "text-yellow-50" : "text-richblack-200"}`}>{subSec?.title}</p>
      </div>
      {subSec?.timeDuration ? <span className="ml-2 text-[10px] text-richblack-500">{subSec.timeDuration}</span> : null}
    </div>
  );
};

export default StudentSubSection;

