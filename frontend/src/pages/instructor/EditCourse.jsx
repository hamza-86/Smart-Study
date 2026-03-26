import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { editCourse, fetchCategories, fetchInstructorCourseDetails } from "../../services/courseServices";
import { COURSE_LEVELS } from "../../constants";

const inputClass =
  "w-full rounded-lg border border-richblack-600 bg-richblack-700 px-4 py-2.5 text-richblack-100 transition placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50";

const Label = ({ text, required, error, children }) => (
  <label className="flex flex-col gap-1.5">
    <p className="text-sm font-medium text-richblack-5">
      {text} {required ? <sup className="text-pink-200">*</sup> : null}
    </p>
    {children}
    {error ? <span className="text-xs text-pink-300">{error}</span> : null}
  </label>
);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});

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
      const [courseData, categoryData] = await Promise.all([
        fetchInstructorCourseDetails(courseId, dispatch),
        fetchCategories(),
      ]);

      if (!courseData) {
        setLoading(false);
        return;
      }

      setCategories(Array.isArray(categoryData) ? categoryData : []);
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
      setLoading(false);
    };

    load();
  }, [token, courseId, dispatch, navigate]);

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.subtitle.trim()) nextErrors.subtitle = "Subtitle is required";
    if (!form.description.trim()) nextErrors.description = "Description is required";
    if (!form.price || Number(form.price) < 0) nextErrors.price = "Valid price is required";
    if (!form.category) nextErrors.category = "Category is required";
    if (!form.level) nextErrors.level = "Level is required";
    if (!form.language.trim()) nextErrors.language = "Language is required";
    if (form.discountedPrice && Number(form.discountedPrice) > Number(form.price)) {
      nextErrors.discountedPrice = "Discounted price cannot exceed price";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
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
      toast.success("Course details updated");
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
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-richblack-800 p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-richblack-5">Edit Course Details</h2>
          <form onSubmit={handleSaveCourse} className="space-y-4">
            <Label text="Title" required error={errors.title}>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputClass} />
            </Label>
            <Label text="Subtitle" required error={errors.subtitle}>
              <input value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} className={inputClass} />
            </Label>
            <Label text="Description" required error={errors.description}>
              <textarea rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={`${inputClass} resize-none`} />
            </Label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Label text="Price" required error={errors.price}>
                <input type="number" min="0" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className={inputClass} />
              </Label>
              <Label text="Discounted Price" error={errors.discountedPrice}>
                <input type="number" min="0" value={form.discountedPrice} onChange={(e) => setForm((p) => ({ ...p, discountedPrice: e.target.value }))} className={inputClass} />
              </Label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Label text="Category" required error={errors.category}>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={inputClass}>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </Label>
              <Label text="Level" required error={errors.level}>
                <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} className={inputClass}>
                  {COURSE_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </Label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Label text="Language" required error={errors.language}>
                <input value={form.language} onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))} className={inputClass} />
              </Label>
              <Label text="Tags">
                <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} className={inputClass} />
              </Label>
            </div>

            <Label text="What Students Will Learn">
              <textarea rows={3} value={form.whatYouWillLearn} onChange={(e) => setForm((p) => ({ ...p, whatYouWillLearn: e.target.value }))} className={`${inputClass} resize-none`} />
            </Label>
            <Label text="Requirements">
              <textarea rows={3} value={form.requirements} onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))} className={`${inputClass} resize-none`} />
            </Label>
            <Label text="Target Audience">
              <textarea rows={3} value={form.targetAudience} onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))} className={`${inputClass} resize-none`} />
            </Label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-richblack-600 py-6 hover:border-yellow-50">
              {preview ? (
                <div className="relative w-full px-4">
                  <img src={preview} alt="preview" className="h-44 w-full rounded-lg object-cover" />
                </div>
              ) : (
                <span className="text-sm text-richblack-300">Upload thumbnail</span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setThumbnail(file);
                  setPreview(URL.createObjectURL(file));
                }}
                className="hidden"
              />
            </label>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/dashboard/course-builder/${courseId}`)}
                className="rounded-lg border border-richblack-600 px-4 py-2 text-sm text-richblack-100"
              >
                Manage Content
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-yellow-50 px-6 py-2.5 text-sm font-semibold text-richblack-900 disabled:opacity-60">
                {saving ? "Saving..." : "Save Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
