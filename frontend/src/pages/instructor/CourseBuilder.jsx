import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { MdDone } from "react-icons/md";

import InstructorSection from "../../components/Instructor/InstructorSection";
import {
  createSection,
  fetchInstructorCourseDetails,
} from "../../services/courseServices";
import { removeSection, setCourse, setSections } from "../../slices/courseSlice";

const StepBadge = ({ step, current }) => {
  const done = step < current;
  const active = step === current;
  return (
    <div
      className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-semibold ${
        done
          ? "border-yellow-50 bg-yellow-50 text-richblack-900"
          : active
          ? "border-yellow-50 bg-[#251400] text-yellow-50"
          : "border-richblack-600 bg-richblack-800 text-richblack-400"
      }`}
    >
      {done ? <MdDone size={18} /> : step}
    </div>
  );
};

const StepConnector = ({ done }) => (
  <div className={`h-0.5 flex-1 border-t-2 border-dashed ${done ? "border-yellow-50" : "border-richblack-600"}`} />
);

const inputClass =
  "w-full rounded-lg border border-richblack-600 bg-richblack-700 px-4 py-2.5 text-richblack-100 transition placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50";

const CourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);
  const sections = useSelector((state) => state.course.sections);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [expandedSectionId, setExpandedSectionId] = useState(null);

  const loadCourse = async () => {
    setLoading(true);
    const courseData = await fetchInstructorCourseDetails(courseId, dispatch);
    if (!courseData) {
      setLoading(false);
      return;
    }

    dispatch(setCourse(courseData));
    dispatch(setSections(courseData.courseContent || []));

    if (courseData.courseContent?.[0]?._id) {
      setExpandedSectionId(courseData.courseContent[0]._id);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, courseId]);

  const hasIntroVideo = useMemo(() => {
    const introSection = (sections || []).find(
      (section) => String(section.sectionName || "").trim().toLowerCase() === "introduction"
    );
    if (!introSection) return false;
    return (introSection.subSections || []).some(
      (sub) => String(sub.type || "").toLowerCase() === "video" && Boolean(sub.videoUrl || sub.contentUrl)
    );
  }, [sections]);

  const handleAddSection = async () => {
    if (!sectionName.trim()) {
      toast.error("Section name is required");
      return;
    }
    if (String(sectionName).trim().toLowerCase() === "introduction") {
      toast.error("Introduction is reserved and already created");
      return;
    }

    setAddingSection(true);
    const section = await createSection(sectionName.trim(), courseId, token);
    setAddingSection(false);

    if (section) {
      dispatch(setSections([...(sections || []), section]));
      setSectionName("");
      setExpandedSectionId(section._id);
      toast.success("Section created");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await loadCourse();
    setSaving(false);
    toast.success("Course content saved");
  };

  const handleSaveAndContinue = async () => {
    if (!hasIntroVideo) {
      toast.error("Upload the Introduction video before continuing");
      return;
    }
    await handleSave();
    navigate(`/dashboard/course-review/${courseId}`);
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-richblack-900">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-richblack-900 px-4 pb-16 pt-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-10 flex w-full max-w-md items-center">
          <StepBadge step={1} current={2} />
          <StepConnector done />
          <StepBadge step={2} current={2} />
          <StepConnector done={false} />
          <StepBadge step={3} current={2} />
        </div>

        <div className="rounded-2xl bg-richblack-800 p-6">
          <h2 className="text-xl font-semibold text-richblack-5">Course Content Builder</h2>
          <p className="mt-1 text-xs text-richblack-300">
            Section 1 (Introduction) is mandatory and only accepts video.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="Add new section"
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={handleAddSection}
              disabled={addingSection}
              className="rounded-lg bg-yellow-50 px-4 py-2 font-semibold text-richblack-900 disabled:opacity-60"
            >
              {addingSection ? "Adding..." : "Add Section"}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {(sections || []).map((sec, index) => (
              <InstructorSection
                key={sec._id}
                index={index}
                sectionId={sec._id}
                name={sec.sectionName}
                subSections={sec.subSections}
                onDelete={(id) => dispatch(removeSection(id))}
                courseId={courseId}
                token={token}
                forceOpen={expandedSectionId === sec._id}
                onExpandChange={(isOpen) => {
                  if (isOpen) setExpandedSectionId(sec._id);
                }}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg border border-richblack-600 px-5 py-2.5 text-sm text-richblack-100 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={saving}
              className="rounded-lg bg-yellow-50 px-5 py-2.5 text-sm font-semibold text-richblack-900 disabled:opacity-60"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilder;
