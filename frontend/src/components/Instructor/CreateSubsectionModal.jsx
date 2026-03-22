import React, { useEffect, useState } from "react";
import { MdOutlineCloudUpload } from "react-icons/md";
import { FiX } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { addSubsection, createQuiz, editSubsection } from "../../services/courseServices";
import { addSubSection, updateSubSection } from "../../slices/courseSlice";

const defaultQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  marks: 1,
});

const CreateSubsectionModal = ({
  isModalOpen,
  closeModal,
  sectionId,
  courseId,
  existingSubsection = null,
  subsectionType = "video",
}) => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [submitting, setSubmitting] = useState(false);

  const type = existingSubsection?.type || subsectionType;
  const isQuiz = type === "quiz";
  const showText = type === "notes";
  const showFile = type === "video" || type === "image" || type === "notes";

  useEffect(() => {
    if (existingSubsection) {
      setTitle(existingSubsection.title || "");
      setDescription(existingSubsection.description || "");
      setTextContent(existingSubsection.textContent || "");
    } else {
      setTitle("");
      setDescription("");
      setTextContent("");
      setQuestions([defaultQuestion()]);
    }
    setFile(null);
  }, [existingSubsection, isModalOpen]);

  const submitQuiz = async () => {
    const hasInvalidQuestion = questions.some(
      (q) =>
        !q.question.trim() ||
        !q.options.every((option) => option.trim()) ||
        q.correctAnswer === ""
    );
    if (hasInvalidQuestion) {
      toast.error("Each quiz question needs 4 options and one correct answer");
      return null;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("sectionId", sectionId);
    formData.append("courseId", courseId);
    formData.append("type", "quiz");

    const subsection = await addSubsection(formData, token);
    if (!subsection) return null;

    const quizPayload = {
      courseId,
      sectionId,
      subSectionId: subsection._id,
      title: `${title.trim()} Quiz`,
      questions: questions.map((q) => ({
        questionText: q.question,
        marks: Number(q.marks || 1),
        options: q.options.map((option, optionIndex) => ({
          text: option.trim(),
          isCorrect: String(optionIndex) === String(q.correctAnswer),
        })),
      })),
    };
    await createQuiz(quizPayload);
    return subsection;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let result = null;
    if (isQuiz && !existingSubsection) {
      result = await submitQuiz();
    } else {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("sectionId", sectionId);
      if (courseId) formData.append("courseId", courseId);
      formData.append("type", type);
      if (textContent) formData.append("textContent", textContent);
      if (file) {
        const key = type === "video" ? "video" : type === "image" ? "image" : "file";
        formData.append(key, file);
      }

      if (existingSubsection) {
        result = await editSubsection(existingSubsection._id, formData, token);
        if (result) dispatch(updateSubSection({ sectionId, subSection: result }));
      } else {
        result = await addSubsection(formData, token);
        if (result) dispatch(addSubSection({ sectionId, subSection: result }));
      }
    }

    setSubmitting(false);
    if (result) closeModal();
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-richblack-700 bg-richblack-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-richblack-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-richblack-5">
            {existingSubsection ? "Edit" : "Add"} {type}
          </h2>
          <button onClick={closeModal} className="rounded p-1 text-richblack-400 hover:bg-richblack-700">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-richblack-600 bg-richblack-700 px-4 py-2.5 text-richblack-100"
          />
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full rounded-lg border border-richblack-600 bg-richblack-700 px-4 py-2.5 text-richblack-100"
          />

          {showText ? (
            <textarea
              rows={3}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Notes text (optional if uploading PDF)"
              className="w-full rounded-lg border border-richblack-600 bg-richblack-700 px-4 py-2.5 text-richblack-100"
            />
          ) : null}

          {showFile ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-richblack-600 py-6 hover:border-yellow-50">
              <MdOutlineCloudUpload className="mb-2 text-richblack-400" size={24} />
              <span className="text-sm text-richblack-300">
                {file ? file.name : `Upload ${type === "video" ? "video" : type === "image" ? "image" : "file"}`}
              </span>
              <input
                type="file"
                className="hidden"
                required={!existingSubsection && (type === "video" || type === "image")}
                accept={type === "video" ? "video/*" : type === "image" ? "image/*" : ".pdf,.doc,.docx,.txt"}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          ) : null}

          {isQuiz ? (
            <div className="space-y-3 rounded-lg border border-richblack-700 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-richblack-200">Quiz Questions</p>
                {!existingSubsection ? (
                  <button
                    type="button"
                    onClick={() => setQuestions((prev) => [...prev, defaultQuestion()])}
                    className="rounded bg-richblack-700 px-3 py-1.5 text-xs text-richblack-50 hover:bg-richblack-600"
                  >
                    Add Question
                  </button>
                ) : null}
              </div>

              <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                {questions.map((q, qi) => (
                  <div key={qi} className="space-y-3 rounded-lg border border-richblack-700 bg-richblack-900 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-richblack-200">Q{qi + 1}</p>
                      {!existingSubsection && questions.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setQuestions((prev) => prev.filter((_, index) => index !== qi))
                          }
                          className="rounded bg-pink-900/40 px-2 py-1 text-[11px] text-pink-200 hover:bg-pink-900/70"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>

                    <input
                      required
                      value={q.question}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((item, index) =>
                            index === qi ? { ...item, question: e.target.value } : item
                          )
                        )
                      }
                      placeholder={`Question ${qi + 1}`}
                      className="w-full rounded border border-richblack-600 bg-richblack-700 px-3 py-2 text-richblack-100"
                    />

                    <div className="space-y-2">
                      {q.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qi}`}
                            checked={String(q.correctAnswer) === String(optionIndex)}
                            onChange={() =>
                              setQuestions((prev) =>
                                prev.map((item, index) =>
                                  index === qi
                                    ? { ...item, correctAnswer: String(optionIndex) }
                                    : item
                                )
                              )
                            }
                          />
                          <input
                            required
                            value={option}
                            onChange={(e) =>
                              setQuestions((prev) =>
                                prev.map((item, index) =>
                                  index !== qi
                                    ? item
                                    : {
                                        ...item,
                                        options: item.options.map((op, idx) =>
                                          idx === optionIndex ? e.target.value : op
                                        ),
                                      }
                                )
                              )
                            }
                            placeholder={`Option ${optionIndex + 1}`}
                            className="w-full rounded border border-richblack-600 bg-richblack-700 px-3 py-2 text-richblack-100"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="number"
                      min="1"
                      value={q.marks}
                      onChange={(e) =>
                        setQuestions((prev) =>
                          prev.map((item, index) =>
                            index === qi ? { ...item, marks: Number(e.target.value || 1) } : item
                          )
                        )
                      }
                      placeholder="Marks"
                      className="w-28 rounded border border-richblack-600 bg-richblack-700 px-3 py-2 text-richblack-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-richblack-600 px-4 py-2 text-richblack-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-yellow-50 px-5 py-2 font-semibold text-richblack-900"
            >
              {submitting ? "Saving..." : existingSubsection ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubsectionModal;
