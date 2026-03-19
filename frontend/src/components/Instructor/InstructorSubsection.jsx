/**
 * InstructorSubsection Component
 * FILE: src/components/Instructor/InstructorSubsection.jsx
 *
 * Changes from original:
 *  - deleteSubsection now passes courseId as 3rd arg (backend now requires it)
 *  - Response shape fixed: deleteSubsection returns data directly
 *    (original checked response?.success && response?.data which always failed)
 *  - Uses removeSubSection Redux action instead of updateSection to remove
 *    the subsection from the correct section in state
 *  - Added ConfirmDialog before deleting
 *  - Added loading state
 *  - Pass courseId down from parent
 */

import React, { useState } from "react";
import { HiOutlineVideoCamera } from "react-icons/hi";
import { FiEdit2 }              from "react-icons/fi";
import { RiDeleteBin6Line }     from "react-icons/ri";
import { useDispatch }          from "react-redux";

import CreateSubsectionModal from "./CreateSubsectionModal";
import ConfirmDialogue       from "../common/ConfirmDialogue";

import { deleteSubsection }   from "../../services/courseServices";
import { removeSubSection }   from "../../slices/courseSlice";

const InstructorSubsection = ({
  subSection,
  sectionId,
  courseId,
  token,
}) => {
  const dispatch = useDispatch();

  const [isEditOpen,   setEditOpen]   = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [deleting,     setDeleting]   = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    // deleteSubsection(subSectionId, sectionId, courseId, token) — courseId now required
    const result = await deleteSubsection(
      subSection._id,
      sectionId,
      courseId,
      token
    );
    setDeleting(false);
    setDeleteOpen(false);
    if (result) {
      // Use removeSubSection to cleanly remove from the correct section in Redux
      dispatch(removeSubSection({ sectionId, subSectionId: subSection._id }));
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 hover:bg-richblack-600 transition">
        <div className="flex items-center gap-3 min-w-0">
          <HiOutlineVideoCamera className="text-richblack-300 shrink-0" size={16} />
          <p className="text-richblack-200 text-sm truncate">{subSection.title}</p>
          {subSection.timeDuration && (
            <span className="text-richblack-500 text-xs shrink-0">
              {subSection.timeDuration}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-richblack-400 shrink-0">
          <button
            title="Edit lecture"
            onClick={() => setEditOpen(true)}
            className="p-1.5 rounded hover:bg-richblack-700 hover:text-caribbeangreen-300 transition"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            title="Delete lecture"
            onClick={() => setDeleteOpen(true)}
            className="p-1.5 rounded hover:bg-richblack-700 hover:text-pink-400 transition"
          >
            <RiDeleteBin6Line size={14} />
          </button>
        </div>
      </div>

      {/* Edit lecture modal */}
      <CreateSubsectionModal
        isModalOpen={isEditOpen}
        closeModal={() => setEditOpen(false)}
        sectionId={sectionId}
        courseId={courseId}
        existingSubsection={subSection}
      />

      {/* Delete confirm */}
      <ConfirmDialogue
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Lecture?"
        message={`"${subSection.title}" will be permanently deleted including its video. This cannot be undone.`}
        confirmLabel="Delete Lecture"
      />
    </>
  );
};

export default InstructorSubsection;