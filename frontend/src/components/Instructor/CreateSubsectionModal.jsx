/**
 * CreateSubsectionModal Component
 * FILE: src/components/Instructor/CreateSubsectionModal.jsx
 *
 * Changes from original:
 *  - Response shape fixed: addSubsection/editSubsection now return the subsection
 *    object directly (not response.data) — changed from response?.success && response?.data
 *    to just checking if result exists
 *  - courseId prop added — needed by updateSection to find the right section in Redux
 *  - Added addSubSection / updateSubSection Redux dispatchers (new reducers in courseSlice)
 *    so the subsection list updates instantly without a page refresh
 *  - Added video file preview (filename shown after selection)
 *  - Added loading state on submit button
 *  - Improved styling to match dark theme
 */

import React, { useEffect, useState } from "react";
import { MdOutlineCloudUpload } from "react-icons/md";
import { FiX, FiVideo } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { addSubsection, editSubsection } from "../../services/courseServices";
import {
  addSubSection,
  updateSubSection,
} from "../../slices/courseSlice";

const CreateSubsectionModal = ({
  isModalOpen,
  closeModal,
  sectionId,
  courseId,
  existingSubsection = null,
}) => {
  const token    = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [video,       setVideo]       = useState(null);
  const [submitting,  setSubmitting]  = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (existingSubsection) {
      setTitle(existingSubsection.title       || "");
      setDescription(existingSubsection.description || "");
    } else {
      setTitle("");
      setDescription("");
      setVideo(null);
    }
  }, [existingSubsection, isModalOpen]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setVideo(null);
  };

  const handleClose = () => {
    reset();
    closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("title",       title.trim());
    formData.append("description", description.trim());
    formData.append("sectionId",   sectionId);
    if (courseId) formData.append("courseId", courseId);
    if (video)    formData.append("video", video);

    let result;

    if (existingSubsection) {
      // Returns the updated subsection directly
      result = await editSubsection(existingSubsection._id, formData, token);
      if (result) {
        dispatch(updateSubSection({ sectionId, subSection: result }));
      }
    } else {
      // Returns the new subsection directly
      result = await addSubsection(formData, token);
      if (result) {
        dispatch(addSubSection({ sectionId, subSection: result }));
      }
    }

    setSubmitting(false);
    if (result) {
      reset();
      closeModal();
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-4">
      <div className="w-full max-w-lg bg-richblack-800 border border-richblack-700 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-richblack-700">
          <h2 className="text-richblack-5 font-semibold text-lg">
            {existingSubsection ? "Edit Lecture" : "Add Lecture"}
          </h2>
          <button
            onClick={handleClose}
            className="text-richblack-400 hover:text-richblack-100 transition p-1 rounded-lg hover:bg-richblack-700"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">

          {/* Video upload */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-richblack-300">
              Video File {!existingSubsection && <sup className="text-pink-200">*</sup>}
            </span>
            {video ? (
              <div className="flex items-center gap-3 p-3 bg-richblack-700 rounded-lg border border-richblack-600">
                <FiVideo className="text-caribbeangreen-300 shrink-0" size={18} />
                <span className="text-richblack-200 text-sm truncate flex-1">{video.name}</span>
                <button
                  type="button"
                  onClick={() => setVideo(null)}
                  className="text-richblack-400 hover:text-pink-400 transition shrink-0"
                >
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-richblack-600 rounded-lg cursor-pointer hover:border-yellow-50 transition">
                <MdOutlineCloudUpload className="text-richblack-400 mb-1" size={28} />
                <span className="text-richblack-400 text-sm">
                  {existingSubsection ? "Upload new video (optional)" : "Click to upload video"}
                </span>
                <span className="text-richblack-500 text-xs mt-0.5">MP4, WebM, MOV</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideo(e.target.files[0])}
                  className="hidden"
                  required={!existingSubsection}
                />
              </label>
            )}
          </label>

          {/* Title */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-richblack-300">
              Lecture Title <sup className="text-pink-200">*</sup>
            </span>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to React Hooks"
              className="w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-400"
            />
          </label>

          {/* Description */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-richblack-300">
              Description <sup className="text-pink-200">*</sup>
            </span>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of what this lecture covers"
              className="w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-400 resize-none"
            />
          </label>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-richblack-600 text-richblack-300 hover:bg-richblack-700 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-yellow-50 text-richblack-900 font-semibold text-sm hover:bg-yellow-100 transition disabled:opacity-60"
            >
              <MdOutlineCloudUpload size={16} />
              {submitting
                ? existingSubsection ? "Updating..." : "Uploading..."
                : existingSubsection ? "Update Lecture" : "Upload Lecture"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubsectionModal;