import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import {
  fetchInstructorCourseDetails,
  deleteSection,
  deleteSubsection,
  togglePublishCourse,
} from "../../services/courseServices";

const InstructorCourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);

  const loadCourse = useCallback(async () => {
    setLoading(true);
    const data = await fetchInstructorCourseDetails(courseId, dispatch);
    if (data) {
      setCourse(data);
      setOpenSections((data.courseContent || []).map((sec) => sec._id));
    }
    setLoading(false);
  }, [courseId, dispatch]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadCourse();
  }, [token, navigate, loadCourse]);

  const introVideo = useMemo(() => {
    const introSection = (course?.courseContent || []).find(
      (section) => String(section.sectionName || "").trim().toLowerCase() === "introduction"
    );
    return (introSection?.subSections || []).find((sub) => String(sub.type).toLowerCase() === "video") || null;
  }, [course]);

  const toggleSection = (id) => {
    setOpenSections((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDeleteSection = async (sectionId) => {
    const ok = await deleteSection(sectionId, courseId, token);
    if (ok) loadCourse();
  };

  const handleDeleteSubsection = async (sectionId, subSectionId) => {
    const ok = await deleteSubsection(subSectionId, sectionId, courseId, token);
    if (ok) loadCourse();
  };

  const isActive = String(course?.status) === "Published";

  const handleToggleStatus = async () => {
    setStatusLoading(true);
    const result = await togglePublishCourse(courseId);
    setStatusLoading(false);
    if (result) loadCourse();
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-richblack-900">
        <div className="loader" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="grid min-h-screen place-items-center bg-richblack-900">
        <p className="text-richblack-300">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-richblack-900 px-4 pb-16 pt-24">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-richblack-700 bg-richblack-800 p-6">
          <div className="grid gap-5 md:grid-cols-[320px,1fr]">
            <img src={course.thumbnail || "https://placehold.co/320x180?text=Course"} alt={course.title} className="h-48 w-full rounded-xl object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-richblack-5">{course.title}</h1>
              <p className="mt-2 text-sm text-richblack-300">{course.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <span className="rounded-full bg-richblack-700 px-3 py-1 text-richblack-200">{course.totalStudents || 0} Students</span>
                <span className="rounded-full bg-richblack-700 px-3 py-1 text-richblack-200">Rs {course.totalEarnings || 0} Earnings</span>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => navigate(`/dashboard/edit-course/${course._id}`)} className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900">
                  Edit Details
                </button>
                <button onClick={() => navigate(`/dashboard/course-builder/${course._id}`)} className="rounded-lg border border-richblack-600 px-4 py-2 text-sm text-richblack-100">
                  Manage Content
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs text-richblack-300">Course Status</span>
                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={handleToggleStatus}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isActive ? "bg-caribbeangreen-900 text-caribbeangreen-200" : "bg-richblack-700 text-richblack-200"
                  } disabled:opacity-60`}
                >
                  {statusLoading ? "Updating..." : isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-richblack-700 bg-richblack-800 p-6">
          <h2 className="mb-3 text-lg font-semibold text-richblack-5">Intro Video</h2>
          {introVideo?.videoUrl ? (
            <video src={introVideo.videoUrl} controls className="mx-auto aspect-video w-full max-w-3xl rounded-xl bg-black object-contain" />
          ) : (
            <div className="grid aspect-video place-items-center rounded-xl border border-richblack-700 bg-richblack-900 text-sm text-yellow-50">
              Introduction video is required. Add it from Manage Content.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-richblack-700 bg-richblack-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-richblack-5">Sections</h2>
          <div className="space-y-3">
            {(course.courseContent || []).map((section, sectionIndex) => {
              const isOpen = openSections.includes(section._id);
              return (
                <div key={section._id} className="overflow-hidden rounded-lg border border-richblack-700 bg-richblack-900">
                  <div className="flex items-center justify-between gap-2 px-4 py-3">
                    <button type="button" onClick={() => toggleSection(section._id)} className="flex items-center gap-2 text-sm font-medium text-richblack-50">
                      <FiChevronDown className={`transition ${isOpen ? "" : "-rotate-90"}`} />
                      <span>Section {sectionIndex + 1}: {section.sectionName}</span>
                    </button>
                    {String(section.sectionName || "").toLowerCase() !== "introduction" ? (
                      <button
                        className="rounded border border-pink-400/40 px-2 py-1 text-xs text-pink-200"
                        onClick={() => handleDeleteSection(section._id)}
                      >
                        Delete Section
                      </button>
                    ) : null}
                  </div>
                  {isOpen ? (
                    <div className="border-t border-richblack-700 px-3 py-2">
                      {(section.subSections || []).map((subSection) => (
                        <div key={subSection._id} className="mb-2 flex items-center justify-between rounded-md bg-richblack-800 px-3 py-2 text-sm text-richblack-200">
                          <span>{(subSection.type || "video").toUpperCase()} - {subSection.title}</span>
                          <button
                            className="rounded border border-pink-400/40 px-2 py-1 text-xs text-pink-200"
                            onClick={() => handleDeleteSubsection(section._id, subSection._id)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCourseDetails;
