/**
 * InstructorSection Component
 * FILE: src/components/Instructor/InstructorSection.jsx
 *
 * Changes from original:
 *  - deleteSection(sectionId, courseId, token) — courseId now required by backend
 *  - editSection returns updated section directly (not wrapped in response.data)
 *  - Replaced inline modals with Modal + ConfirmDialog components
 *  - courseId passed through to InstructorSubsection for deleteSubsection
 *  - Added loading states on delete and edit
 */

import React, { useState } from "react";
import { FiEdit2 }         from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { CiCirclePlus }    from "react-icons/ci";
import { FaPlus }          from "react-icons/fa";
import { useDispatch }     from "react-redux";

import InstructorSubsection  from "../Instructor/InstructorSubsection";
import CreateSubsectionModal from "../Instructor/CreateSubsectionModal";
import ConfirmDialogue       from "../common/ConfirmDialogue";
import Modal                 from "../common/Modal";

import { deleteSection, editSection } from "../../services/courseServices";
import { updateSection }              from "../../slices/courseSlice";

const InstructorSection = ({
  name,
  sectionId,
  subSections,
  onDelete,
  courseId,
  token,
}) => {
  const dispatch = useDispatch();

  const [isAddOpen,    setAddOpen]    = useState(false);
  const [isEditOpen,   setEditOpen]   = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [editedName,   setEditedName] = useState(name);
  const [deleting,     setDeleting]   = useState(false);
  const [editing,      setEditing]    = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteSection(sectionId, courseId, token);
    setDeleting(false);
    setDeleteOpen(false);
    if (result) onDelete(sectionId);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditing(true);
    const updated = await editSection(editedName, sectionId, token);
    setEditing(false);
    if (updated) dispatch(updateSection(updated));
    setEditOpen(false);
  };

  return (
    <>
      {/* <div className="flex flex-col">
        <div className="overflow-hidden flex flex-col w-full border border-richblack-600 bg-richblack-700 text-richblack-5 rounded-lg mt-3">
          <div className="flex items-center h-[50px] justify-between px-4">
            <p className="text-sm font-medium truncate max-w-[60%]">{name}</p>
            <div className="flex items-center gap-1 text-richblack-200">
              <button
                title="Add lecture"
                className="p-1.5 rounded hover:bg-richblack-600 hover:text-caribbeangreen-300 transition"
                onClick={(e) => { e.preventDefault(); setAddOpen(true); }}
              >
                <CiCirclePlus size={22} />
              </button>
              <button
                title="Edit section name"
                className="p-1.5 rounded hover:bg-richblack-600 hover:text-caribbeangreen-300 transition"
                onClick={() => { setEditedName(name); setEditOpen(true); }}
              >
                <FiEdit2 size={18} />
              </button>
              <button
                title="Delete section"
                className="p-1.5 rounded hover:bg-richblack-600 hover:text-pink-400 transition"
                onClick={() => setDeleteOpen(true)}
              >
                <RiDeleteBin6Line size={18} />
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-richblack-600" />

          {subSections?.map((sub) => (
            <InstructorSubsection
              key={sub._id}
              subSection={sub}
              sectionId={sectionId}
              courseId={courseId}
              token={token}
            />
          ))}

          {(!subSections || subSections.length === 0) && (
            <p className="text-richblack-400 text-xs text-center py-3">
              No lectures yet — click + to add one
            </p>
          )}
        </div>
      </div>

      <CreateSubsectionModal
        isModalOpen={isAddOpen}
        closeModal={() => setAddOpen(false)}
        sectionId={sectionId}
        courseId={courseId}
      />

      <Modal isOpen={isEditOpen} onClose={() => setEditOpen(false)} title="Edit Section Name" size="sm">
        <form onSubmit={handleEdit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-richblack-300">Section Name</span>
            <input
              required value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Enter section name"
              className="w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
            />
          </label>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-lg border border-richblack-600 text-richblack-300 hover:bg-richblack-700 transition text-sm"
            >Cancel</button>
            <button type="submit" disabled={editing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 text-richblack-900 font-semibold text-sm hover:bg-yellow-100 transition disabled:opacity-60"
            >
              <FaPlus size={12} />
              {editing ? "Updating..." : "Update Section"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialogue
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Section?"
        message="This will permanently delete this section and all its lectures. This action cannot be undone."
        confirmLabel="Delete Section"
      /> */}
    </>
  );
};

export default InstructorSection;