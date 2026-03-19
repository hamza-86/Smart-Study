import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdDone } from "react-icons/md";
import { FiUpload, FiX } from "react-icons/fi";
import { fetchCategories, createCourse } from "../../services/courseServices";
import { setCourse } from "../../slices/courseSlice";
import { COURSE_LEVELS } from "../../constants";

const StepBadge = ({ step, current, done }) => {
  const isDone = done || step < current;
  const isActive = step === current;

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
        isDone ? "bg-yellow-50 border-yellow-50 text-richblack-900" : ""
      } ${isActive ? "bg-[#251400] border-yellow-50 text-yellow-50" : ""} ${
        !isDone && !isActive ? "bg-richblack-800 border-richblack-600 text-richblack-400" : ""
      }`}
    >
      {isDone ? <MdDone size={18} /> : step}
    </div>
  );
};

const StepConnector = ({ done }) => (
  <div
    className={`flex-1 h-0.5 border-t-2 border-dashed transition-colors ${
      done ? "border-yellow-50" : "border-richblack-600"
    }`}
  />
);

const Label = ({ text, required, children }) => (
  <label className="flex flex-col gap-1.5">
    <p className="text-sm font-medium text-richblack-5">
      {text} {required && <sup className="text-pink-200">*</sup>}
    </p>
    {children}
  </label>
);

const inputClass =
  "w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-400 transition";

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

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      const result = await fetchCategories();
      if (Array.isArray(result) && result.length > 0) {
        setCategories(result);
      } else {
        setCategories([]);
        setCategoriesError("No categories found. Please refresh or contact admin.");
      }
      setCategoriesLoading(false);
    };

    loadCategories();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setPreview("");
  };

  const toArray = (str) =>
    str
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!thumbnail) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("subtitle", form.subtitle.trim());
    formData.append("description", form.description.trim());
    formData.append("price", form.price);
    if (form.discountedPrice) formData.append("discountedPrice", form.discountedPrice);
    formData.append("category", form.category); // MUST be category _id
    formData.append("level", form.level);
    formData.append("language", form.language);
    formData.append("tags", JSON.stringify(toArray(form.tags)));
    formData.append("whatYouWillLearn", JSON.stringify(toArray(form.whatYouWillLearn)));
    formData.append("requirements", JSON.stringify(toArray(form.requirements)));
    formData.append("targetAudience", JSON.stringify(toArray(form.targetAudience)));
    formData.append("thumbnail", thumbnail);

    const result = await createCourse(token, formData);
    setLoading(false);

    if (result) {
      dispatch(setCourse(result));
      navigate("/dashboard/add-section");
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 mt-10 pb-16 px-4 bg-richblack-900">
      <div className="flex items-center w-full max-w-xs mx-auto mb-10">
        <StepBadge step={1} current={1} />
        <StepConnector />
        <StepBadge step={2} current={1} />
        <StepConnector />
        <StepBadge step={3} current={1} />
      </div>

      <div className="flex justify-center gap-6 flex-wrap">
        <div className="w-full max-w-xl bg-richblack-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-richblack-5 text-xl font-semibold mb-6">Course Information</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Label text="Course Title" required>
              <input required name="title" value={form.title} onChange={handleChange} placeholder="e.g. Complete React Developer" className={inputClass} />
            </Label>

            <Label text="Short Subtitle">
              <input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="A short, catchy subtitle" className={inputClass} />
            </Label>

            <Label text="Description" required>
              <textarea required name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe what your course covers" className={`${inputClass} resize-none`} />
            </Label>

            <div className="grid grid-cols-2 gap-4">
              <Label text="Price (INR)" required>
                <input required type="number" min="0" name="price" value={form.price} onChange={handleChange} placeholder="0" className={inputClass} />
              </Label>
              <Label text="Discounted Price (INR)">
                <input type="number" min="0" name="discountedPrice" value={form.discountedPrice} onChange={handleChange} placeholder="Optional" className={inputClass} />
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Label text="Category" required>
                <select required name="category" value={form.category} onChange={handleChange} className={inputClass}>
                  <option value="">
                    {categoriesLoading ? "Loading categories..." : "Select category"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </Label>
              <Label text="Level">
                <select name="level" value={form.level} onChange={handleChange} className={inputClass}>
                  {COURSE_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Label text="Language">
                <input name="language" value={form.language} onChange={handleChange} placeholder="e.g. English" className={inputClass} />
              </Label>
              <Label text="Tags">
                <input name="tags" value={form.tags} onChange={handleChange} placeholder="react, javascript, web" className={inputClass} />
              </Label>
            </div>

            <Label text="Course Thumbnail" required>
              {preview ? (
                <div className="relative w-full">
                  <img src={preview} alt="Thumbnail preview" className="w-full h-44 object-cover rounded-lg" />
                  <button type="button" onClick={removeThumbnail} className="absolute top-2 right-2 bg-richblack-900 text-white rounded-full p-1 hover:bg-pink-600 transition">
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-richblack-600 rounded-lg cursor-pointer hover:border-yellow-50 transition">
                  <FiUpload className="text-richblack-400 mb-2" size={24} />
                  <span className="text-richblack-400 text-sm">Click to upload thumbnail</span>
                  <span className="text-richblack-500 text-xs mt-1">PNG, JPG, WEBP (max 5MB)</span>
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
              )}
            </Label>

            <Label text="What Students Will Learn" required>
              <textarea required name="whatYouWillLearn" value={form.whatYouWillLearn} onChange={handleChange} rows={4} placeholder={"Enter each point on a new line:\nBuild real projects\nUnderstand core concepts"} className={`${inputClass} resize-none`} />
            </Label>

            <Label text="Requirements">
              <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3} placeholder={"Basic JavaScript knowledge\nA computer with internet"} className={`${inputClass} resize-none`} />
            </Label>

            <Label text="Target Audience">
              <textarea name="targetAudience" value={form.targetAudience} onChange={handleChange} rows={3} placeholder={"Beginners who want to learn web development"} className={`${inputClass} resize-none`} />
            </Label>

            {categoriesError ? (
              <p className="text-pink-300 text-sm">{categoriesError}</p>
            ) : null}

            <button type="submit" disabled={loading || categoriesLoading || categories.length === 0} className="w-full bg-yellow-50 text-richblack-900 font-semibold py-3 rounded-lg hover:bg-yellow-100 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? "Creating Course..." : "Save & Continue ->"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
