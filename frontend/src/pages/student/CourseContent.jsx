import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import Section from "../../components/student/Section";
import Footer from "../../components/Footer";
import {
  fetchEnrolledCourse,
  updateCourseProgress,
  updateWatchTime,
  getResumeInfo,
  getCourseProgress,
} from "../../services/courseServices";

const CourseContent = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const token = useSelector((state) => state.auth.token);
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [activeSubsection, setActiveSubsection] = useState(null);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [completion, setCompletion] = useState(0);
  const [isActive, setIsActive] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const videoRef = useRef(null);
  const watchIntervalRef = useRef(null);
  const markedCompleteRef = useRef(new Set());

  const sections = useMemo(
    () => course?.sections || course?.courseContent || [],
    [course]
  );

  const allSubsections = useMemo(
    () => sections.flatMap((section) => section?.subSections || []),
    [sections]
  );

  useEffect(() => {
    console.log("Sections:", sections);
  }, [sections]);

  useEffect(() => {
    console.log("Subsections:", allSubsections);
  }, [allSubsections]);

  const handleActive = (id) => {
    setIsActive((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const stopWatchTracking = useCallback(() => {
    if (watchIntervalRef.current) {
      clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }
  }, []);

  const startWatchTracking = useCallback(() => {
    if (!activeSubsection || activeSubsection.type !== "video") return;
    if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);

    watchIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused) return;
      updateWatchTime(
        courseId,
        activeSubsection._id,
        Math.round(video.currentTime),
        Math.round(video.duration || 0),
        Math.round(video.currentTime)
      );
    }, 10000);
  }, [activeSubsection, courseId]);

  useEffect(() => () => stopWatchTracking(), [stopWatchTracking]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !activeSubsection || activeSubsection.type !== "video") return;

    const subId = String(activeSubsection._id);
    const ratio = video.duration ? video.currentTime / video.duration : 0;
    if (ratio >= 0.9 && !markedCompleteRef.current.has(subId)) {
      markedCompleteRef.current.add(subId);
      updateCourseProgress(courseId, activeSubsection._id).then((result) => {
        if (result) {
          setCompletedVideos(result.completedVideos || []);
          setCompletion(result.completionPercentage || 0);
        }
      });
    }
  }, [activeSubsection, courseId]);

  const handleSubsectionClick = (subSection) => {
    stopWatchTracking();
    setQuizAnswers({});
    setQuizResult(null);
    setActiveSubsection(subSection);
  };

  useEffect(() => {
    const load = async () => {
      const response = await fetchEnrolledCourse(courseId, token, dispatch);
      if (!response) return;

      const courseData = response?.data?.data?.courseDetails || response;
      setCourse(courseData);

      const progress = await getCourseProgress(courseId);
      if (progress) {
        setCompletedVideos(progress.completedVideos || []);
        setCompletion(progress.completionPercentage || 0);
        markedCompleteRef.current = new Set(
          (progress.completedVideos || []).map((id) => String(id))
        );
      }

      const resume = await getResumeInfo(courseId);
      const nextSections = courseData?.sections || courseData?.courseContent || [];
      const resumeSubsection = resume?.lastWatchedVideo;
      const firstSubsection = nextSections?.[0]?.subSections?.[0] || null;

      if (resumeSubsection?._id) {
        setActiveSubsection(resumeSubsection);
      } else if (firstSubsection) {
        setActiveSubsection(firstSubsection);
      }

      if (nextSections?.[0]?._id) {
        setIsActive([nextSections[0]._id]);
      }
    };

    load();
  }, [courseId, token, dispatch]);

  const activeQuiz = activeSubsection?.type === "quiz" ? activeSubsection?.quizzes?.[0] : null;

  const submitQuizPreview = () => {
    if (!activeQuiz?.questions?.length) return;

    let obtained = 0;
    let total = 0;
    activeQuiz.questions.forEach((question) => {
      total += Number(question.marks || 1);
      const chosenOption = quizAnswers[question._id];
      const correctOption = question.options?.find((option) => option.isCorrect);
      if (chosenOption && correctOption && String(chosenOption) === String(correctOption._id)) {
        obtained += Number(question.marks || 1);
      }
    });

    const percent = total ? Math.round((obtained / total) * 100) : 0;
    setQuizResult({ obtained, total, percent });
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
      <div className="min-h-screen bg-richblack-900 md:flex">
        <div className="w-full bg-richblack-800 md:min-h-screen md:w-[36%] lg:w-[28%]">
          <div className="border-b border-richblack-700 px-4 pb-4 pt-24">
            <h1 className="mb-3 text-base font-bold leading-snug text-richblack-5">
              {course?.title}
            </h1>
            <div className="mb-1 h-1.5 w-full rounded-full bg-richblack-700">
              <div
                className="h-1.5 rounded-full bg-yellow-50 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-xs text-richblack-400">{completion}% complete</p>
          </div>

          <div className="max-h-[calc(100vh-180px)] overflow-y-auto py-2 md:max-h-[calc(100vh-140px)]">
            {sections.map((section, index) => (
              <Section
                key={section._id}
                section={section}
                isActive={isActive}
                handleActive={handleActive}
                handleVideoClick={handleSubsectionClick}
                selectedSubSec={activeSubsection}
                completedVideos={completedVideos}
                index={index}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 pt-16 lg:pt-20">
          <div className="aspect-video max-h-[60vh] w-full bg-black">
            {!activeSubsection ? (
              <div className="grid h-full place-items-center">
                <p className="text-lg text-richblack-400">Select a lecture</p>
              </div>
            ) : activeSubsection.type === "video" ? (
              <video
                ref={videoRef}
                key={activeSubsection._id}
                src={activeSubsection.videoUrl || activeSubsection.contentUrl}
                controls
                autoPlay
                className="h-full w-full object-contain"
                onPlay={startWatchTracking}
                onPause={stopWatchTracking}
                onEnded={stopWatchTracking}
                onTimeUpdate={handleTimeUpdate}
              />
            ) : activeSubsection.type === "image" ? (
              <img
                src={activeSubsection.contentUrl}
                alt={activeSubsection.title}
                className="h-full w-full object-contain"
              />
            ) : activeSubsection.type === "notes" ? (
              <div className="h-full overflow-y-auto bg-richblack-900 p-5 text-richblack-100">
                {activeSubsection.textContent ? (
                  <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed">
                    {activeSubsection.textContent}
                  </p>
                ) : null}
                {activeSubsection.contentUrl ? (
                  activeSubsection.contentUrl.toLowerCase().includes(".pdf") ? (
                    <iframe
                      title="Notes document"
                      src={activeSubsection.contentUrl}
                      className="h-[70vh] w-full rounded border border-richblack-700"
                    />
                  ) : (
                    <a
                      href={activeSubsection.contentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-yellow-50 underline"
                    >
                      Open Notes File
                    </a>
                  )
                ) : null}
              </div>
            ) : activeSubsection.type === "quiz" ? (
              <div className="h-full overflow-y-auto bg-richblack-900 p-5">
                {activeQuiz?.questions?.length ? (
                  <div className="space-y-4">
                    {activeQuiz.questions.map((question, index) => (
                      <div
                        key={question._id}
                        className="rounded-lg border border-richblack-700 bg-richblack-800 p-4"
                      >
                        <p className="mb-3 text-sm font-semibold text-richblack-5">
                          Q{index + 1}. {question.questionText}
                        </p>
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <label
                              key={option._id}
                              className="flex items-center gap-2 text-sm text-richblack-200"
                            >
                              <input
                                type="radio"
                                name={`question-${question._id}`}
                                checked={quizAnswers[question._id] === option._id}
                                onChange={() =>
                                  setQuizAnswers((prev) => ({
                                    ...prev,
                                    [question._id]: option._id,
                                  }))
                                }
                              />
                              {option.text}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={submitQuizPreview}
                      className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900"
                    >
                      Submit Quiz
                    </button>
                    {quizResult ? (
                      <p className="text-sm text-caribbeangreen-200">
                        Score: {quizResult.obtained}/{quizResult.total} ({quizResult.percent}%)
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-richblack-300">Quiz details are not available.</p>
                )}
              </div>
            ) : (
              <div className="grid h-full place-items-center">
                <p className="text-sm text-richblack-400">Unsupported content type</p>
              </div>
            )}
          </div>

          {activeSubsection ? (
            <div className="px-5 py-4">
              <h2 className="text-lg font-semibold text-richblack-5">{activeSubsection.title}</h2>
              {activeSubsection.description ? (
                <p className="mt-1 text-sm leading-relaxed text-richblack-400">
                  {activeSubsection.description}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseContent;
