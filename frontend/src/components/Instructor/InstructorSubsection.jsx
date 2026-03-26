import React, { useState } from "react";
import { HiOutlineVideoCamera } from "react-icons/hi";
import { FiEdit2, FiExternalLink } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { PiNotePencilLight, PiQuestionLight } from "react-icons/pi";
import { useDispatch } from "react-redux";

import CreateSubsectionModal from "./CreateSubsectionModal";
import ConfirmDialogue from "../common/ConfirmDialogue";
import { deleteSubsection } from "../../services/courseServices";
import { removeSubSection } from "../../slices/courseSlice";

const typeMeta = {
  video: { label: "Video", icon: HiOutlineVideoCamera },
  notes: { label: "Notes", icon: PiNotePencilLight },
  note: { label: "Notes", icon: PiNotePencilLight },
  quiz: { label: "Quiz", icon: PiQuestionLight },
};

const InstructorSubsection = ({ subSection, sectionId, courseId, token, onUploadStateChange }) => {
  const dispatch = useDispatch();
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const contentType = String(subSection?.type || "video").toLowerCase();
  const meta = typeMeta[contentType] || typeMeta.video;
  const Icon = meta.icon;
  const previewUrl = subSection?.videoUrl || subSection?.contentUrl;
  const videoDuration = subSection?.timeDuration
    ? `${Math.floor(Number(subSection.timeDuration) / 60)}m ${Math.floor(Number(subSection.timeDuration) % 60)}s`
    : "Duration not set";
  const notesPreview = String(subSection?.textContent || "").trim();
  const quizQuestionCount =
    subSection?.quizzes?.[0]?.questions?.length ||
    subSection?.quizzes?.length ||
    0;

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteSubsection(subSection._id, sectionId, courseId, token);
    setDeleting(false);
    setDeleteOpen(false);
    if (result) {
      dispatch(removeSubSection({ sectionId, subSectionId: subSection._id }));
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-md border-b border-richblack-700 px-4 py-3 last:border-0 hover:bg-richblack-700/40">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 text-xs text-richblack-300">
            <Icon size={14} />
            <span>{meta.label}</span>
          </div>
          <p className="truncate text-sm text-richblack-50">{subSection?.title}</p>
          {contentType === "video" ? (
            <p className="truncate text-xs text-richblack-400">{videoDuration}</p>
          ) : null}
          {(contentType === "notes" || contentType === "note") ? (
            <p className="truncate text-xs text-richblack-400">
              {notesPreview ? notesPreview : "No notes preview available"}
            </p>
          ) : null}
          {contentType === "quiz" ? (
            <p className="truncate text-xs text-richblack-400">{quizQuestionCount} question(s)</p>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          {previewUrl ? (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded p-1.5 text-richblack-300 hover:bg-richblack-700 hover:text-yellow-50"
              title="Preview content"
            >
              <FiExternalLink size={14} />
            </a>
          ) : null}
          <button
            title="Edit content"
            onClick={() => setEditOpen(true)}
            className="rounded p-1.5 text-richblack-300 hover:bg-richblack-700 hover:text-caribbeangreen-300"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            title="Delete content"
            onClick={() => setDeleteOpen(true)}
            className="rounded p-1.5 text-richblack-300 hover:bg-richblack-700 hover:text-pink-400"
          >
            <RiDeleteBin6Line size={14} />
          </button>
        </div>
      </div>

      <CreateSubsectionModal
        isModalOpen={isEditOpen}
        closeModal={() => setEditOpen(false)}
        sectionId={sectionId}
        courseId={courseId}
        existingSubsection={subSection}
        onUploadStateChange={onUploadStateChange}
      />

      <ConfirmDialogue
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Content?"
        message={`"${subSection?.title}" will be removed permanently.`}
        confirmLabel="Delete"
      />
    </>
  );
};

export default InstructorSubsection;
