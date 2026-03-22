import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FiUpload, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

import Footer from "../../components/Footer";
import InstructorSection from "../../components/Instructor/InstructorSection";
import {
  createSection,
  editCourse,
  fetchCategories,
  fetchCourseStudents,
  fetchInstructorCourseDetails,
} from "../../services/courseServices";
import { setSections, removeSection } from "../../slices/courseSlice";
import { COURSE_LEVELS } from "../../constants";

const inputClass =
  "w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-400 transition";

const toArray = (str) =>
  String(str || "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const sections = useSelector((state) => state.course.sections);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  const [categories, setCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");
  const [students, setStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    price: "",
    discountedPrice: "",
    category: "",
    level: "All Levels",
    language: "English",
    tags: "",
    whatYouWillLearn: "",
    requirements: "",
    targetAudience: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const load = async () => {
      setLoading(true);
      const [courseData, categoryData, studentsData] = await Promise.all([
        fetchInstructorCourseDetails(courseId, dispatch),
        fetchCategories(),
        fetchCourseStudents(courseId),
      ]);

      if (!courseData) {
        setLoading(false);
        return;
      }

      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setStudents(studentsData?.students || []);
      setPreview(courseData.thumbnail || "");
      setForm({
        title: courseData.title || "",
        subtitle: courseData.subtitle || "",
        description: courseData.description || "",
        price: String(courseData.price ?? ""),
        discountedPrice: String(courseData.discountedPrice ?? ""),
        category: courseData.category?._id || courseData.category || "",
        level: courseData.level || "All Levels",
        language: courseData.language || "English",
        tags: (courseData.tags || []).join(", "),
        whatYouWillLearn: (courseData.whatYouWillLearn || []).join("\n"),
        requirements: (courseData.requirements || []).join("\n"),
        targetAudience: (courseData.targetAudience || []).join("\n"),
      });
      dispatch(setSections(courseData.courseContent || []));
      setLoading(false);
    };

    load();
  }, [token, courseId, dispatch, navigate]);

  const topStudents = useMemo(() => students.slice(0, 5), [students]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.price) {
      toast.error("Please fill required fields");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("subtitle", form.subtitle.trim());
    formData.append("description", form.description.trim());
    formData.append("price", form.price);
    if (form.discountedPrice) formData.append("discountedPrice", form.discountedPrice);
    formData.append("category", form.category);
    formData.append("level", form.level);
    formData.append("language", form.language);
    formData.append("tags", JSON.stringify(toArray(form.tags)));
    formData.append("whatYouWillLearn", JSON.stringify(toArray(form.whatYouWillLearn)));
    formData.append("requirements", JSON.stringify(toArray(form.requirements)));
    formData.append("targetAudience", JSON.stringify(toArray(form.targetAudience)));
    if (thumbnail) formData.append("thumbnail", thumbnail);

    const result = await editCourse(courseId, formData);
    setSaving(false);
    if (result) {
      toast.success("Course updated");
    }
  };

  const handleAddSection = async () => {
    if (!sectionName.trim()) {
      toast.error("Section name is required");
      return;
    }
    setAddingSection(true);
    const newSection = await createSection(sectionName.trim(), courseId, token);
    setAddingSection(false);
    if (newSection) {
      dispatch(setSections([...(sections || []), newSection]));
      setSectionName("");
    } else {
      toast.error("Could not create section");
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
    <>
      <div className="min-h-screen bg-richblack-900 pt-20 pb-16 px-4">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <div className="rounded-2xl bg-richblack-800 p-6">
            <h2 className="mb-5 text-xl font-semibold text-richblack-5">Edit Course</h2>
            <form onSubmit={handleSaveCourse} className="space-y-4">
              <input
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Course title"
                className={inputClass}
              />
              <input
                value={form.subtitle}
                onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="Subtitle"
                className={inputClass}
              />
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description"
                className={`${inputClass} resize-none`}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="Price"
                  className={inputClass}
                />
                <input
                  type="number"
                  min="0"
                  value={form.discountedPrice}
                  onChange={(e) => setForm((p) => ({ ...p, discountedPrice: e.target.value }))}
                  placeholder="Discounted price"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  value={form.level}
                  onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                  className={inputClass}
                >
                  {COURSE_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={form.language}
                  onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                  placeholder="Language"
                  className={inputClass}
                />
                <input
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="Tags comma-separated"
                  className={inputClass}
                />
              </div>
              <textarea
                rows={3}
                value={form.whatYouWillLearn}
                onChange={(e) => setForm((p) => ({ ...p, whatYouWillLearn: e.target.value }))}
                placeholder="What students will learn"
                className={`${inputClass} resize-none`}
              />
              <textarea
                rows={3}
                value={form.requirements}
                onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))}
                placeholder="Requirements"
                className={`${inputClass} resize-none`}
              />
              <textarea
                rows={3}
                value={form.targetAudience}
                onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
                placeholder="Target audience"
                className={`${inputClass} resize-none`}
              />

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-richblack-600 py-6 hover:border-yellow-50">
                {preview ? (
                  <div className="relative w-full px-4">
                    <img src={preview} alt="preview" className="h-44 w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnail(null);
                        setPreview("");
                      }}
                      className="absolute right-6 top-2 rounded-full bg-richblack-900 p-1 text-white"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <FiUpload className="mb-2 text-richblack-400" size={22} />
                    <span className="text-sm text-richblack-300">Upload thumbnail</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-yellow-50 px-5 py-2 font-semibold text-richblack-900"
              >
                {saving ? "Saving..." : "Save Course"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-richblack-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-richblack-5">Sections & Subsections</h3>
            <div className="mb-4 flex gap-2">
              <input
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="Add section"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={handleAddSection}
                disabled={addingSection}
                className="rounded-lg bg-yellow-50 px-4 py-2 font-semibold text-richblack-900"
              >
                {addingSection ? "Adding..." : "Add Section"}
              </button>
            </div>
            <div className="space-y-3">
              {sections.map((sec) => (
                <InstructorSection
                  key={sec._id}
                  sectionId={sec._id}
                  name={sec.sectionName}
                  subSections={sec.subSections}
                  onDelete={(id) => dispatch(removeSection(id))}
                  courseId={courseId}
                  token={token}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-richblack-800 p-6">
            <h3 className="mb-3 text-lg font-semibold text-richblack-5">Enrolled Students</h3>
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
              className="rounded bg-richblack-700 px-3 py-1.5 text-sm text-richblack-50"
            >
              {showStudents ? "Hide Students" : "View All Students"}
            </button>
            {showStudents ? (
              <div className="mt-3 space-y-2">
                {students.map((student) => (
                  <div key={student._id} className="flex items-center gap-3 rounded-lg border border-richblack-700 bg-richblack-900 p-3">
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
      <Footer />
    </>
  );
};

export default EditCourse;
