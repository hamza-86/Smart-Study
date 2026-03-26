import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiChevronDown } from "react-icons/fi";
import { MdDone } from "react-icons/md";

import { fetchInstructorCourseDetails, togglePublishCourse } from "../../services/courseServices";

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

const CourseReview = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [course, setCourse] = useState(null);
  const [openSections, setOpenSections] = useState([]);

  const loadCourse = async () => {
    setLoading(true);
    const courseData = await fetchInstructorCourseDetails(courseId, dispatch);
    if (courseData) {
      setCourse(courseData);
      setOpenSections((courseData.courseContent || []).map((sec) => sec._id));
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

  const introVideo = useMemo(() => {
    const introSection = (course?.courseContent || []).find(
      (section) => String(section.sectionName || "").trim().toLowerCase() === "introduction"
    );
    return (introSection?.subSections || []).find((sub) => String(sub.type || "").toLowerCase() === "video") || null;
  }, [course]);

  const canPublish = useMemo(() => {
    const hasSections = (course?.courseContent || []).length > 0;
    const hasIntro = Boolean(introVideo?.videoUrl || introVideo?.contentUrl);
    return hasSections && hasIntro;
  }, [course, introVideo]);

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => (prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]));
  };

  const handlePublishToggle = async (toDraft = false) => {
    if (!course) return;

    if (!toDraft && !canPublish) {
      if (!(course.courseContent || []).length) {
        toast.error("Add at least one section before publishing");
      } else {
        toast.error("Upload Introduction video before publishing");
      }
      return;
    }

    if (toDraft && String(course.status) !== "Published") {
      toast("Course is already in draft mode");
      return;
    }

    setPublishing(true);
    const result = await togglePublishCourse(courseId);
    setPublishing(false);
    if (result) {
      await loadCourse();
      toast.success(toDraft ? "Saved as draft" : "Course published");
      if (!toDraft) navigate("/dashboard/my-courses");
    }
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
          <StepBadge step={1} current={3} />
          <StepConnector done />
          <StepBadge step={2} current={3} />
          <StepConnector done />
          <StepBadge step={3} current={3} />
        </div>

        <div className="space-y-5 rounded-2xl bg-richblack-800 p-6">
          <div className="grid gap-4 md:grid-cols-[220px,1fr]">
            <img src={course?.thumbnail} alt={course?.title} className="h-40 w-full rounded-xl object-cover" />
            <div>
              <h2 className="text-xl font-semibold text-richblack-5">{course?.title}</h2>
              <p className="mt-2 text-sm text-richblack-300">{course?.description}</p>
              <div className="mt-3 flex items-center gap-2 text-lg font-semibold text-richblack-5">
                <span className="animate-pulse text-richblack-400 line-through">Rs {course?.price || 0}</span>
                <span className="text-yellow-50">Rs {course?.discountedPrice || course?.price || 0}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-richblack-700 bg-richblack-900 p-4">
            <h3 className="mb-3 text-sm font-semibold text-richblack-5">Introduction Video</h3>
            {introVideo?.videoUrl ? (
              <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl bg-black">
                <video src={introVideo.videoUrl} controls className="aspect-video w-full object-contain" />
              </div>
            ) : (
              <p className="text-sm text-yellow-50">Introduction video is missing.</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-richblack-5">Sections</h3>
            <div className="space-y-2">
              {(course?.courseContent || []).map((section, sectionIndex) => {
                const isOpen = openSections.includes(section._id);
                return (
                  <div key={section._id} className="overflow-hidden rounded-lg border border-richblack-700 bg-richblack-900">
                    <button
                      type="button"
                      onClick={() => toggleSection(section._id)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="text-sm text-richblack-100">
                        Section {sectionIndex + 1}: {section.sectionName}
                      </span>
                      <FiChevronDown className={`text-richblack-300 transition ${isOpen ? "" : "-rotate-90"}`} />
                    </button>
                    {isOpen ? (
                      <div className="space-y-1 border-t border-richblack-700 px-3 py-2">
                        {(section.subSections || []).map((sub) => (
                          <div key={sub._id} className="rounded-md bg-richblack-800 px-3 py-2 text-xs text-richblack-200">
                            {String(sub.type || "video").toUpperCase()} - {sub.title}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/edit-course/${courseId}`)}
              className="rounded-lg border border-richblack-600 px-4 py-2 text-sm text-richblack-100"
            >
              Back to Edit Details
            </button>
            <button
              type="button"
              onClick={() => navigate(`/dashboard/course-builder/${courseId}`)}
              className="rounded-lg border border-richblack-600 px-4 py-2 text-sm text-richblack-100"
            >
              Back to Content
            </button>
            <button
              type="button"
              disabled={publishing}
              onClick={() => handlePublishToggle(true)}
              className="rounded-lg border border-yellow-50 px-4 py-2 text-sm text-yellow-50 disabled:opacity-60"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={publishing || !canPublish}
              onClick={() => handlePublishToggle(false)}
              className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 disabled:opacity-60"
            >
              {publishing ? "Publishing..." : "Publish Course"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseReview;
