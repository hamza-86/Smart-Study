/**
 * CreateSection Page
 * FILE: src/pages/instructor/CreateSection.jsx
 *
 * Changes from original:
 *  - Fixed import: createSection now from courseServices.js (not courseAPI)
 *  - Response shape changed: service now returns data directly (not response.data)
 *  - createSection now dispatches properly using the returned section object
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdDone } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { MdNavigateNext } from "react-icons/md";
import toast from "react-hot-toast";
import InstructorSection from "../../components/Instructor/InstructorSection";
import { removeSection, setSections } from "../../slices/courseSlice";
import { createSection } from "../../services/courseServices";

// ── Step indicator (same as AddCourse) ───────────────────────────────────────
const StepBadge = ({ step, current, done }) => {
  const isDone   = done || step < current;
  const isActive = step === current;
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
        ${isDone   ? "bg-yellow-50 border-yellow-50 text-richblack-900"             : ""}
        ${isActive ? "bg-[#251400] border-yellow-50 text-yellow-50"                 : ""}
        ${!isDone && !isActive ? "bg-richblack-800 border-richblack-600 text-richblack-400" : ""}
      `}
    >
      {isDone ? <MdDone size={18} /> : step}
    </div>
  );
};

const StepConnector = ({ done }) => (
  <div className={`flex-1 h-0.5 border-t-2 border-dashed transition-colors ${done ? "border-yellow-50" : "border-richblack-600"}`} />
);

// ── Main Component ────────────────────────────────────────────────────────────
const CreateSection = () => {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const token         = useSelector((state) => state.auth.token);
  const courseDetails = useSelector((state) => state.course.course);
  const sections      = useSelector((state) => state.course.sections);

  const [sectionName, setSectionName] = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    if (!courseDetails) {
      toast.error("Please fill in course details first");
      navigate("/dashboard/add-course");
    }
  }, [courseDetails, navigate]);

  const courseId = courseDetails?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sectionName.trim()) return;
    setSubmitting(true);

    // createSection returns the section object directly (not wrapped in response.data)
    const newSection = await createSection(sectionName.trim(), courseId, token);
    setSubmitting(false);

    if (newSection) {
      dispatch(setSections([...(sections || []), newSection]));
      setSectionName("");
    }
  };

  const deleteHandler = (sectionId) => {
    dispatch(removeSection(sectionId));
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 mt-10 pb-16 px-4 bg-richblack-900">

      {/* Step Indicator */}
      <div className="flex items-center w-full max-w-xs mx-auto mb-10">
        <StepBadge step={1} current={2} />
        <StepConnector done />
        <StepBadge step={2} current={2} />
        <StepConnector />
        <StepBadge step={3} current={2} />
      </div>

      {/* Content */}
      <div className="flex justify-center gap-6 flex-wrap">

        {/* Main panel */}
        <div className="w-full max-w-xl bg-richblack-800 rounded-2xl p-6 shadow-lg min-h-[400px]">
          <h2 className="text-richblack-5 text-xl font-semibold mb-2">
            Course Builder
          </h2>
          <p className="text-richblack-400 text-sm mb-6">
            Organise your content into sections and lectures
          </p>

          {/* Existing sections */}
          {sections?.length > 0 && (
            <div className="flex flex-col gap-3 mb-6">
              {sections.map((sec) => (
                <InstructorSection
                  key={sec._id}
                  sectionId={sec._id}
                  name={sec.sectionName}
                  subSections={sec.subSections}
                  onDelete={deleteHandler}
                  courseId={courseId}
                  token={token}
                />
              ))}
            </div>
          )}

          {/* Add section form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-richblack-5">
                Section Name <sup className="text-pink-200">*</sup>
              </p>
              <input
                required
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g. Introduction to React"
                className="w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-400 transition"
              />
            </label>

            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-richblack-900 text-yellow-50 border border-yellow-50 font-medium py-2.5 px-5 rounded-lg hover:bg-richblack-700 transition disabled:opacity-60"
              >
                <FaPlus size={14} />
                <span>{submitting ? "Adding..." : "Add Section"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard/publish-course")}
                className="flex items-center gap-2 bg-yellow-50 text-richblack-900 font-semibold py-2.5 px-5 rounded-lg hover:bg-yellow-100 transition"
              >
                <span>Continue</span>
                <MdNavigateNext size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* Tips sidebar */}
        <div className="hidden lg:block w-80 bg-richblack-800 rounded-2xl p-5 h-fit sticky top-24">
          <h3 className="text-white font-semibold text-lg mb-3">⚡ Course Builder Tips</h3>
          <ul className="text-richblack-200 text-sm space-y-2 leading-relaxed">
            {[
              "Group related lessons into sections.",
              "Use clear section names like 'Module 1: Basics'.",
              "Add videos, quizzes, and notes to each section.",
              "You can reorder sections after creating them.",
              "Students see section names in the course outline.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-yellow-50 mt-0.5">›</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default CreateSection;