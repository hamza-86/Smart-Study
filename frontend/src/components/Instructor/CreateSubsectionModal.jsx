import React, { useEffect, useRef, useState } from "react";
import { MdOutlineCloudUpload } from "react-icons/md";
import { FiX } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { addSubsection, createQuiz, editSubsection } from "../../services/courseServices";
import { addSubSection, updateSubSection as updateSubSectionInStore } from "../../slices/courseSlice";
import Modal from "../common/Modal";

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
  onUploadStateChange,
}) => {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notesPreviewMode, setNotesPreviewMode] = useState(false);

  const progressRef = useRef({ ts: 0, loaded: 0 });
  const notesEditorRef = useRef(null);

  const type = String(existingSubsection?.type || subsectionType || "video").toLowerCase();
  const normalizedType = type === "note" ? "notes" : type;
  const isQuiz = normalizedType === "quiz";
  const showText = normalizedType === "notes";
  const showFile = normalizedType === "video" || normalizedType === "notes";
  const existingPreviewUrl = existingSubsection?.videoUrl || existingSubsection?.contentUrl;

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
    setNotesPreviewMode(false);
  }, [existingSubsection, isModalOpen]);

  useEffect(() => {
    if (!showText || !notesEditorRef.current || notesPreviewMode) return;
    notesEditorRef.current.innerHTML = textContent || "";
  }, [showText, notesPreviewMode, textContent]);

  const applyFormat = (command) => {
    if (!notesEditorRef.current) return;
    notesEditorRef.current.focus();
    document.execCommand(command, false, null);
    setTextContent(notesEditorRef.current.innerHTML);
  };

  const emitUploadState = (next) => {
    if (typeof onUploadStateChange === "function") onUploadStateChange(next);
  };

  const onUploadProgress = (event) => {
    if (!event?.total) return;
    const now = Date.now();
    const deltaBytes = event.loaded - (progressRef.current.loaded || 0);
    const deltaTime = Math.max((now - (progressRef.current.ts || now)) / 1000, 0.001);
    progressRef.current = { ts: now, loaded: event.loaded };
    emitUploadState({
      status: "uploading",
      fileName: file?.name || existingSubsection?.title || "Uploading",
      progress: Math.round((event.loaded / event.total) * 100),
      speedBps: deltaBytes / deltaTime,
    });
  };

  const submitQuiz = async () => {
    const invalid = questions.some(
      (q) => !q.question.trim() || !q.options.every((option) => option.trim()) || q.correctAnswer === ""
    );
    if (invalid) {
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

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    if (!existingSubsection && normalizedType === "video" && !file) {
      toast.error("Please upload a video file");
      return;
    }

    setSubmitting(true);
    emitUploadState({
      status: "preparing",
      fileName: file?.name || title.trim() || "Preparing upload",
      progress: 0,
      speedBps: 0,
    });

    let result = null;
    if (isQuiz && !existingSubsection) {
      result = await submitQuiz();
    } else {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("sectionId", sectionId);
      if (courseId) formData.append("courseId", courseId);
      formData.append("type", normalizedType);
      if (textContent) formData.append("textContent", textContent);
      if (file) {
        const key = normalizedType === "video" ? "video" : "file";
        formData.append(key, file);
      }

      progressRef.current = { ts: Date.now(), loaded: 0 };
      if (existingSubsection) {
        result = await editSubsection(existingSubsection._id, formData, token, { onUploadProgress });
        if (result) dispatch(updateSubSectionInStore({ sectionId, subSection: result }));
      } else {
        result = await addSubsection(formData, token, { onUploadProgress });
        if (result) dispatch(addSubSection({ sectionId, subSection: result }));
      }
    }

    setSubmitting(false);
    if (result) {
      emitUploadState({
        status: "completed",
        fileName: file?.name || result.title || title.trim(),
        progress: 100,
        speedBps: 0,
      });
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        closeModal();
      }, 1200);
    } else {
      emitUploadState({
        status: "failed",
        fileName: file?.name || title.trim() || "Upload failed",
        progress: 0,
        speedBps: 0,
      });
    }
  };

  if (!isModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-xl rounded-2xl border border-richblack-700 bg-richblack-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-richblack-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-richblack-5">
              {existingSubsection ? "Edit" : "Add"} {normalizedType}
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
              <div className="space-y-2 rounded-lg border border-richblack-700 bg-richblack-900 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => applyFormat("bold")} className="rounded bg-richblack-700 px-2 py-1 text-xs text-richblack-100">B</button>
                    <button type="button" onClick={() => applyFormat("italic")} className="rounded bg-richblack-700 px-2 py-1 text-xs text-richblack-100">I</button>
                    <button type="button" onClick={() => applyFormat("insertUnorderedList")} className="rounded bg-richblack-700 px-2 py-1 text-xs text-richblack-100">List</button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotesPreviewMode((prev) => !prev)}
                    className="rounded bg-richblack-700 px-3 py-1 text-xs text-richblack-100"
                  >
                    {notesPreviewMode ? "Edit" : "Preview"}
                  </button>
                </div>

                {notesPreviewMode ? (
                  <div
                    className="min-h-[140px] rounded border border-richblack-700 bg-richblack-800 p-3 text-sm text-richblack-100"
                    dangerouslySetInnerHTML={{ __html: textContent || "<p>No notes content</p>" }}
                  />
                ) : (
                  <div
                    ref={notesEditorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setTextContent(e.currentTarget.innerHTML)}
                    className="min-h-[140px] rounded border border-richblack-700 bg-richblack-800 p-3 text-sm text-richblack-100 focus:outline-none"
                  />
                )}
              </div>
            ) : null}

            {existingSubsection && existingPreviewUrl ? (
              <div className="rounded-lg border border-richblack-700 bg-richblack-900 p-3">
                <p className="mb-2 text-xs text-richblack-300">Existing content preview</p>
                {normalizedType === "video" ? (
                  <video src={existingPreviewUrl} controls className="max-h-56 w-full rounded" />
                ) : (
                  <a href={existingPreviewUrl} target="_blank" rel="noreferrer" className="text-sm text-yellow-50 underline">
                    Open existing file
                  </a>
                )}
              </div>
            ) : null}

            {showFile ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-richblack-600 py-6 hover:border-yellow-50">
                <MdOutlineCloudUpload className="mb-2 text-richblack-400" size={24} />
                <span className="text-sm text-richblack-300">
                  {file ? file.name : `Upload ${normalizedType === "video" ? "video" : "file"}`}
                </span>
                <input
                  type="file"
                  className="hidden"
                  required={!existingSubsection && normalizedType === "video"}
                  accept={normalizedType === "video" ? "video/*" : ".pdf,.doc,.docx,.txt"}
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
                      <input
                        required
                        value={q.question}
                        onChange={(e) =>
                          setQuestions((prev) => prev.map((item, index) => (index === qi ? { ...item, question: e.target.value } : item)))
                        }
                        placeholder={`Question ${qi + 1}`}
                        className="w-full rounded border border-richblack-600 bg-richblack-700 px-3 py-2 text-richblack-100"
                      />
                      {q.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qi}`}
                            checked={String(q.correctAnswer) === String(optionIndex)}
                            onChange={() =>
                              setQuestions((prev) =>
                                prev.map((item, index) => (index === qi ? { ...item, correctAnswer: String(optionIndex) } : item))
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
                                        options: item.options.map((op, idx) => (idx === optionIndex ? e.target.value : op)),
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
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeModal} className="rounded-lg border border-richblack-600 px-4 py-2 text-richblack-200">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="rounded-lg bg-yellow-50 px-5 py-2 font-semibold text-richblack-900">
                {submitting ? "Saving..." : existingSubsection ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal isOpen={showSuccessModal} preventClose size="sm">
        <div className="py-4 text-center">
          <h3 className="text-lg font-semibold text-richblack-5">Upload completed successfully ✅</h3>
        </div>
      </Modal>
    </>
  );
};

export default CreateSubsectionModal;
