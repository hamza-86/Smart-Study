import React, { useState } from "react";
import { FiChevronDown, FiEdit2 } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import InstructorSubsection from "./InstructorSubsection";
import CreateSubsectionModal from "./CreateSubsectionModal";
import ConfirmDialogue from "../common/ConfirmDialogue";
import { deleteSection, editSection } from "../../services/courseServices";
import { updateSection } from "../../slices/courseSlice";

const InstructorSection = ({ sectionId, name, subSections = [], courseId, token, onDelete }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [sectionName, setSectionName] = useState(name || "");
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [subTypeModal, setSubTypeModal] = useState(null);

  const saveSectionName = async () => {
    if (!sectionName.trim()) {
      toast.error("Section name is required");
      return;
    }
    const updated = await editSection(sectionName.trim(), sectionId, token);
    if (updated) {
      dispatch(updateSection(updated));
      setEditing(false);
    }
  };

  const removeSection = async () => {
    setDeleting(true);
    const result = await deleteSection(sectionId, courseId, token);
    setDeleting(false);
    setShowDelete(false);
    if (result) onDelete?.(sectionId);
  };

  return (
    <>
      <div className="rounded-lg border border-richblack-700 bg-richblack-900">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 text-left"
          >
            <FiChevronDown className={`text-richblack-300 transition ${open ? "rotate-0" : "-rotate-90"}`} />
            {editing ? (
              <input
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="rounded border border-richblack-600 bg-richblack-800 px-2 py-1 text-sm text-richblack-50"
              />
            ) : (
              <p className="text-sm font-medium text-richblack-50">{name}</p>
            )}
          </button>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={saveSectionName}
                  className="rounded bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-richblack-900"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSectionName(name || "");
                    setEditing(false);
                  }}
                  className="rounded bg-richblack-700 px-2.5 py-1 text-xs text-richblack-100"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded p-1.5 text-richblack-300 hover:bg-richblack-700"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowDelete(true)}
                  className="rounded p-1.5 text-pink-300 hover:bg-richblack-700"
                >
                  <RiDeleteBin6Line size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {open ? (
          <div className="border-t border-richblack-700 px-3 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
                {[
                  { type: "video", label: "Add Video" },
                  { type: "image", label: "Add Image" },
                  { type: "notes", label: "Add Notes" },
                  { type: "quiz", label: "Add Quiz" },
                ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSubTypeModal(item.type)}
                  className="rounded bg-richblack-700 px-3 py-1.5 text-xs text-richblack-100 hover:bg-richblack-600"
                >
                  + {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-1 rounded-md border border-richblack-700 bg-richblack-800">
              {(subSections || []).length > 0 ? (
                subSections.map((sub) => (
                  <InstructorSubsection
                    key={sub._id}
                    subSection={sub}
                    sectionId={sectionId}
                    courseId={courseId}
                    token={token}
                  />
                ))
              ) : (
                <p className="px-4 py-3 text-xs text-richblack-400">No subsections yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <CreateSubsectionModal
        isModalOpen={Boolean(subTypeModal)}
        closeModal={() => setSubTypeModal(null)}
        sectionId={sectionId}
        courseId={courseId}
        subsectionType={subTypeModal || "video"}
      />

      <ConfirmDialogue
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={removeSection}
        loading={deleting}
        title="Delete Section?"
        message="This will remove the section and all its subsections."
        confirmLabel="Delete Section"
      />
    </>
  );
};

export default InstructorSection;
