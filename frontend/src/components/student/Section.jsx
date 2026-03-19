/**
 * Section Component (Student course sidebar)
 * FILE: src/components/student/Section.jsx
 *
 * Changes from original:
 *  - Accepts completedVideos[] prop from CourseContent page
 *  - Passes isCompleted flag to StudentSubSection per video
 *  - Shows completed count out of total in section header
 *  - Section auto-expands if it contains the currently selected video
 *  - Reduced animation delay from index * 0.5 to index * 0.05 (sidebar was slow to render)
 */

import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDown } from "react-icons/ai";
import { motion } from "framer-motion";
import StudentSubSection from "./StudentSubSection";
import { fadeIn } from "../../utils/motion";

const Section = ({
  section,
  isActive,
  handleActive,
  handleVideoClick,
  selectedSubSec,
  completedVideos = [],
  index,
}) => {
  const contentEl = useRef(null);

  const active       = isActive?.includes(section._id);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!contentEl.current) return;
    setHeight(active ? contentEl.current.scrollHeight : 0);
  }, [active, section]);

  // Count completed videos in this section
  const totalInSection    = section?.subSections?.length || 0;
  const completedInSection = section?.subSections?.filter(
    (sub) => completedVideos.includes(String(sub._id))
  ).length || 0;

  return (
    <motion.div
      variants={fadeIn("up", "spring", index * 0.05, 0.4)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="overflow-hidden rounded-lg mt-2 mx-2 border border-richblack-600 bg-richblack-700 text-richblack-5">

        {/* Section header */}
        <div
          className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-richblack-600 transition"
          onClick={() => handleActive(section._id)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <i className={`transition-transform duration-300 ${active ? "rotate-180" : "rotate-0"}`}>
              <AiOutlineDown size={14} className="text-richblack-300" />
            </i>
            <p className="text-sm font-medium truncate">{section?.sectionName}</p>
          </div>

          {/* Progress count */}
          {totalInSection > 0 && (
            <span className="text-xs text-richblack-400 shrink-0 ml-2">
              {completedInSection}/{totalInSection}
            </span>
          )}
        </div>

        {/* Collapsible content */}
        <div
          ref={contentEl}
          className="overflow-hidden transition-[height] duration-300 ease-in-out"
          style={{ height }}
        >
          <div className="bg-richblack-800 flex flex-col">
            {section?.subSections?.map((subSec) => (
              <StudentSubSection
                key={subSec._id}
                subSec={subSec}
                handleVideoClick={handleVideoClick}
                isSelected={selectedSubSec?._id === subSec._id}
                isCompleted={completedVideos.includes(String(subSec._id))}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Section;