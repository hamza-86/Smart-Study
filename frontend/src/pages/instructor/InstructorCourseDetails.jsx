import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronDown, FiEdit2 } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import toast from "react-hot-toast";
import {
  deleteSection,
  deleteSubsection,
  fetchInstructorCourseDetails,
} from "../../services/courseServices";

const InstructorCourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState([]);
  const [showStudents, setShowStudents] = useState(false);

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

  const topStudents = useMemo(
    () => (course?.enrolledStudents || []).slice(0, 5),
    [course?.enrolledStudents]
  );

  const toggleSection = (id) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSection = async (sectionId) => {
    const ok = await deleteSection(sectionId, courseId, token);
    if (ok) {
      toast.success("Section deleted");
      loadCourse();
    }
  };

  const handleDeleteSubsection = async (sectionId, subSectionId) => {
    const ok = await deleteSubsection(subSectionId, sectionId, courseId, token);
    if (ok) {
      toast.success("Subsection deleted");
      loadCourse();
    }
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-richblack-5">{course.title}</h1>
              <p className="mt-2 text-sm text-richblack-300">{course.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-richblack-300">
                <span>{course.totalStudents || 0} students</span>
                <span>Rs {course.totalEarnings || 0} earnings</span>
                <span>{(course.courseContent || []).length} sections</span>
              </div>
            </div>
            <img
              src={course.thumbnail || "https://placehold.co/320x180?text=Course"}
              alt={course.title}
              className="h-32 w-56 rounded-lg object-cover"
            />
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
              className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 hover:bg-yellow-100"
            >
              Edit Course
            </button>
            <button
              onClick={() => navigate("/dashboard/my-courses")}
              className="rounded-lg border border-richblack-600 px-4 py-2 text-sm text-richblack-100 hover:bg-richblack-700"
            >
              Back to Courses
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-richblack-700 bg-richblack-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-richblack-5">Course Sections</h2>
            <button
              onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
              className="text-sm text-yellow-50 hover:text-yellow-100"
            >
              Manage in editor
            </button>
          </div>
          <div className="space-y-3">
            {(course.courseContent || []).map((section, sectionIndex) => {
              const isOpen = openSections.includes(section._id);
              return (
                <div
                  key={section._id}
                  className="overflow-hidden rounded-lg border border-richblack-700 bg-richblack-900"
                >
                  <div className="flex items-center justify-between gap-2 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSection(section._id)}
                      className="flex items-center gap-2 text-left text-sm font-medium text-richblack-50"
                    >
                      <FiChevronDown className={`transition ${isOpen ? "" : "-rotate-90"}`} />
                      <span>
                        Section {sectionIndex + 1}: {section.sectionName}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded p-1.5 text-richblack-300 hover:bg-richblack-700"
                        onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
                        title="Edit section"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="rounded p-1.5 text-pink-300 hover:bg-richblack-700"
                        onClick={() => handleDeleteSection(section._id)}
                        title="Delete section"
                      >
                        <RiDeleteBin6Line size={14} />
                      </button>
                    </div>
                  </div>
                  {isOpen ? (
                    <div className="border-t border-richblack-700 px-3 py-2">
                      {(section.subSections || []).length ? (
                        section.subSections.map((subSection, subIndex) => (
                          <div
                            key={subSection._id}
                            className="mb-1 flex items-center justify-between rounded-md px-2 py-2 text-sm text-richblack-200 hover:bg-richblack-800"
                          >
                            <span>
                              {sectionIndex + 1}.{subIndex + 1} {subSection.type || "content"}:{" "}
                              {subSection.title}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                className="rounded p-1.5 text-richblack-300 hover:bg-richblack-700"
                                onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
                                title="Edit subsection"
                              >
                                <FiEdit2 size={13} />
                              </button>
                              <button
                                className="rounded p-1.5 text-pink-300 hover:bg-richblack-700"
                                onClick={() =>
                                  handleDeleteSubsection(section._id, subSection._id)
                                }
                                title="Delete subsection"
                              >
                                <RiDeleteBin6Line size={13} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="px-2 py-2 text-xs text-richblack-400">No subsections yet.</p>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-richblack-700 bg-richblack-800 p-6">
          <h2 className="mb-3 text-lg font-semibold text-richblack-5">Enrolled Students</h2>
          <div className="mb-3 flex -space-x-3">
            {topStudents.map((student) => (
              <img
                key={student._id}
                src={student.avatar || "https://placehold.co/80x80?text=U"}
                alt={student.firstName}
                className="h-10 w-10 rounded-full border-2 border-richblack-800 object-cover"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowStudents((prev) => !prev)}
            className="rounded bg-richblack-700 px-3 py-1.5 text-sm text-richblack-50 hover:bg-richblack-600"
          >
            {showStudents ? "Hide Students" : "View All Students"}
          </button>
          {showStudents ? (
            <div className="mt-3 space-y-2">
              {(course.enrolledStudents || []).map((student) => (
                <div
                  key={student._id}
                  className="flex items-center gap-3 rounded-lg border border-richblack-700 bg-richblack-900 p-3"
                >
                  <img
                    src={student.avatar || "https://placehold.co/80x80?text=U"}
                    alt={student.firstName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-richblack-50">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-richblack-400">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default InstructorCourseDetails;
