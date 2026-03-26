import React, { useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineDown } from "react-icons/ai";
import StudentSubSection from "./StudentSubSection";

const Section = ({ section, isActive, handleActive, handleVideoClick, selectedSubSec, completedVideos = [], index }) => {
  const contentEl = useRef(null);
  const [height, setHeight] = useState(0);

  const active = isActive?.includes(section._id);
  const containsSelected = useMemo(
    () => (section?.subSections || []).some((item) => String(item._id) === String(selectedSubSec?._id)),
    [section, selectedSubSec]
  );

  useEffect(() => {
    if (containsSelected && !active) handleActive(section._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containsSelected, section._id]);

  useEffect(() => {
    if (!contentEl.current) return;
    setHeight(active ? contentEl.current.scrollHeight : 0);
  }, [active, section]);

  const totalInSection = section?.subSections?.length || 0;
  const completedInSection =
    section?.subSections?.filter((sub) => completedVideos.includes(String(sub._id))).length || 0;

  return (
    <div className="mx-2 mt-2 overflow-hidden rounded-lg border border-richblack-600 bg-richblack-700 text-richblack-5">
      <button className="flex w-full items-center justify-between px-4 py-3 hover:bg-richblack-600" onClick={() => handleActive(section._id)}>
        <div className="flex items-center gap-2">
          <AiOutlineDown size={14} className={`text-richblack-300 transition ${active ? "rotate-180" : ""}`} />
          <p className="text-sm font-medium">Section {index + 1}: {section?.sectionName}</p>
        </div>
        <span className="text-xs text-richblack-400">{completedInSection}/{totalInSection}</span>
      </button>
      <div ref={contentEl} className="overflow-hidden transition-[height] duration-300" style={{ height }}>
        <div className="bg-richblack-800">
          {(section?.subSections || []).map((subSec) => (
            <StudentSubSection
              key={subSec._id}
              subSec={subSec}
              handleVideoClick={handleVideoClick}
              isSelected={String(selectedSubSec?._id) === String(subSec._id)}
              isCompleted={completedVideos.includes(String(subSec._id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section;

