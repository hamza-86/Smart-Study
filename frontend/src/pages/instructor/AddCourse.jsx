import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdDone } from "react-icons/md";
import { FiUpload, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchCategories, createCourse } from "../../services/courseServices";
import { setCourse } from "../../slices/courseSlice";
import { COURSE_LEVELS } from "../../constants";

const DRAFT_KEY = "smart-study:add-course:draft";

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

const Label = ({ text, required, error, children }) => (
  <label className="flex flex-col gap-1.5">
    <p className="text-sm font-medium text-richblack-5">
      {text} {required ? <sup className="text-pink-200">*</sup> : null}
    </p>
    {children}
    {error ? <span className="text-xs text-pink-300">{error}</span> : null}
  </label>
);

const inputClass =
  "w-full rounded-lg border border-richblack-600 bg-richblack-700 px-4 py-2.5 text-richblack-100 transition placeholder:text-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50";

const requiredFields = [
  "title",
  "subtitle",
  "description",
  "price",
  "category",
  "level",
  "language",
  "thumbnail",
];

const AddCourse = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setForm((prev) => ({ ...prev, ...(parsed.form || {}) }));
      setPreview(parsed.preview || "");
    } catch {
      // ignore stale local draft
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, preview }));
  }, [form, preview]);

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      const result = await fetchCategories();
      if (Array.isArray(result) && result.length > 0) {
        setCategories(result);
        setCategoriesError("");
      } else {
        setCategories([]);
        setCategoriesError("No categories found. Please refresh.");
      }
      setCategoriesLoading(false);
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, thumbnail: "" }));
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setPreview("");
  };

  const toArray = (value) =>
    String(value || "")
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.subtitle.trim()) nextErrors.subtitle = "Subtitle is required";
    if (!form.description.trim()) nextErrors.description = "Description is required";
    if (!form.price || Number(form.price) < 0) nextErrors.price = "Valid price is required";
    if (!form.category) nextErrors.category = "Category is required";
    if (!form.level) nextErrors.level = "Level is required";
    if (!form.language.trim()) nextErrors.language = "Language is required";
    if (!thumbnail) nextErrors.thumbnail = "Thumbnail is required";

    if (
      form.discountedPrice &&
      Number(form.discountedPrice) > Number(form.price)
    ) {
      nextErrors.discountedPrice = "Discounted price cannot exceed price";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const completion = useMemo(() => {
    const base = {
      ...form,
      thumbnail: thumbnail ? "yes" : "",
    };
    const done = requiredFields.filter((field) => String(base[field] || "").trim()).length;
    return Math.round((done / requiredFields.length) * 100);
  }, [form, thumbnail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("subtitle", form.subtitle.trim());
    formData.append("description", form.description.trim());
    formData.append("price", form.price);
    if (form.discountedPrice) formData.append("discountedPrice", form.discountedPrice);
    formData.append("category", form.category);
    formData.append("level", form.level);
    formData.append("language", form.language.trim());
    formData.append("tags", JSON.stringify(toArray(form.tags)));
    formData.append("whatYouWillLearn", JSON.stringify(toArray(form.whatYouWillLearn)));
    formData.append("requirements", JSON.stringify(toArray(form.requirements)));
    formData.append("targetAudience", JSON.stringify(toArray(form.targetAudience)));
    formData.append("thumbnail", thumbnail);

    const result = await createCourse(token, formData);
    setLoading(false);

    if (result?._id) {
      dispatch(setCourse(result));
      localStorage.removeItem(DRAFT_KEY);
      navigate(`/dashboard/course-builder/${result._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-richblack-900 px-4 pb-16 pt-24">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto mb-10 flex w-full max-w-md items-center">
          <StepBadge step={1} current={1} />
          <StepConnector done={false} />
          <StepBadge step={2} current={1} />
          <StepConnector done={false} />
          <StepBadge step={3} current={1} />
        </div>

        <div className="mb-4 rounded-xl border border-richblack-700 bg-richblack-800 p-3 text-xs text-richblack-300">
          Step 1 of 3 completed: <span className="font-semibold text-yellow-50">{completion}%</span>
        </div>

        <div className="rounded-2xl bg-richblack-800 p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-richblack-5">Course Details</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Label text="Title" required error={errors.title}>
              <input name="title" value={form.title} onChange={handleChange} className={inputClass} />
            </Label>

            <Label text="Subtitle" required error={errors.subtitle}>
              <input name="subtitle" value={form.subtitle} onChange={handleChange} className={inputClass} />
            </Label>

            <Label text="Description" required error={errors.description}>
              <textarea rows={4} name="description" value={form.description} onChange={handleChange} className={`${inputClass} resize-none`} />
            </Label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Label text="Price (INR)" required error={errors.price}>
                <input type="number" min="0" name="price" value={form.price} onChange={handleChange} className={inputClass} />
              </Label>
              <Label text="Discounted Price (INR)" error={errors.discountedPrice}>
                <input type="number" min="0" name="discountedPrice" value={form.discountedPrice} onChange={handleChange} className={inputClass} />
              </Label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Label text="Category" required error={errors.category}>
                <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                  <option value="">{categoriesLoading ? "Loading..." : "Select category"}</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </Label>
              <Label text="Level" required error={errors.level}>
                <select name="level" value={form.level} onChange={handleChange} className={inputClass}>
                  {COURSE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </Label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Label text="Language" required error={errors.language}>
                <input name="language" value={form.language} onChange={handleChange} className={inputClass} />
              </Label>
              <Label text="Tags">
                <input name="tags" value={form.tags} onChange={handleChange} className={inputClass} />
              </Label>
            </div>

            <Label text="Thumbnail" required error={errors.thumbnail}>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Thumbnail preview" className="h-44 w-full rounded-lg object-cover" />
                  <button type="button" onClick={removeThumbnail} className="absolute right-2 top-2 rounded-full bg-richblack-900 p-1 text-white">
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-richblack-600 transition hover:border-yellow-50">
                  <FiUpload className="mb-2 text-richblack-400" size={24} />
                  <span className="text-sm text-richblack-400">Click to upload thumbnail</span>
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
              )}
            </Label>

            <Label text="What Students Will Learn">
              <textarea rows={4} name="whatYouWillLearn" value={form.whatYouWillLearn} onChange={handleChange} className={`${inputClass} resize-none`} />
            </Label>

            <Label text="Requirements">
              <textarea rows={3} name="requirements" value={form.requirements} onChange={handleChange} className={`${inputClass} resize-none`} />
            </Label>

            <Label text="Target Audience">
              <textarea rows={3} name="targetAudience" value={form.targetAudience} onChange={handleChange} className={`${inputClass} resize-none`} />
            </Label>

            {categoriesError ? <p className="text-sm text-pink-300">{categoriesError}</p> : null}

            <button
              type="submit"
              disabled={loading || categoriesLoading || categories.length === 0}
              className="mt-2 w-full rounded-lg bg-yellow-50 py-3 font-semibold text-richblack-900 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
