import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import Section from "../../components/student/Section";
import Footer from "../../components/Footer";
import Modal from "../../components/common/Modal";
import {
  fetchEnrolledCourse,
  updateCourseProgress,
  updateWatchTime,
  getResumeInfo,
  getCourseProgress,
  fetchQuiz,
  submitQuiz,
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
  const [playerLoading, setPlayerLoading] = useState(true);

  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizWarnings, setQuizWarnings] = useState(0);
  const [quizTimerLeft, setQuizTimerLeft] = useState(0);
  const [showQuizStartModal, setShowQuizStartModal] = useState(false);
  const [warningModalMessage, setWarningModalMessage] = useState("");

  const videoRef = useRef(null);
  const watchIntervalRef = useRef(null);
  const markedCompleteRef = useRef(new Set());
  const quizContainerRef = useRef(null);
  const notesContainerRef = useRef(null);

  const sections = useMemo(() => course?.courseContent || [], [course]);

  const stopWatchTracking = useCallback(() => {
    if (watchIntervalRef.current) {
      clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }
  }, []);

  const startWatchTracking = useCallback(() => {
    if (!activeSubsection || String(activeSubsection.type) !== "video") return;
    if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    watchIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused) return;
      updateWatchTime(courseId, activeSubsection._id, Math.round(video.currentTime), Math.round(video.duration || 0), Math.round(video.currentTime));
    }, 10000);
  }, [activeSubsection, courseId]);

  useEffect(() => () => stopWatchTracking(), [stopWatchTracking]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !activeSubsection || String(activeSubsection.type) !== "video") return;
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

  const handleActive = (id) => {
    setIsActive((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSubsectionClick = async (subSection) => {
    stopWatchTracking();
    setQuizMode(false);
    setQuizData(null);
    setQuizAnswers({});
    setQuizResult(null);
    setActiveSubsection(subSection);
    setPlayerLoading(true);

    if (String(subSection?.type) === "quiz") {
      const quizId = subSection?.quizzes?.[0]?._id || subSection?.quizzes?.[0];
      if (quizId) {
        const data = await fetchQuiz(quizId);
        setQuizData(data);
        if (data?.timeLimit) {
          setQuizTimerLeft(Number(data.timeLimit) * 60);
        }
      }
    }
    setPlayerLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      const response = await fetchEnrolledCourse(courseId, token, dispatch);
      const courseData = response?.data?.data?.courseDetails || response;
      if (!courseData) return;

      setCourse(courseData);

      const progress = await getCourseProgress(courseId);
      if (progress) {
        setCompletedVideos(progress.completedVideos || []);
        setCompletion(progress.completionPercentage || 0);
        markedCompleteRef.current = new Set((progress.completedVideos || []).map((id) => String(id)));
      }

      const resume = await getResumeInfo(courseId);
      const nextSections = courseData?.courseContent || [];
      const resumeSubsection = resume?.lastWatchedVideo;
      const firstSubsection = nextSections?.[0]?.subSections?.[0] || null;

      if (resumeSubsection?._id) setActiveSubsection(resumeSubsection);
      else if (firstSubsection) setActiveSubsection(firstSubsection);

      if (nextSections?.[0]?._id) setIsActive([nextSections[0]._id]);
      setPlayerLoading(false);
    };
    load();
  }, [courseId, token, dispatch]);

  useEffect(() => {
    if (!quizMode || !quizTimerLeft) return undefined;
    const timer = setInterval(() => {
      setQuizTimerLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizMode, quizTimerLeft]);

  const requestQuizFullscreen = async () => {
    try {
      await quizContainerRef.current?.requestFullscreen?.();
    } catch {
      // noop
    }
  };

  useEffect(() => {
    if (!quizMode) return undefined;
    const onVisibility = () => {
      if (document.hidden) {
        setQuizWarnings((prev) => prev + 1);
        setWarningModalMessage("Tab switching is not allowed during quiz mode.");
      }
    };
    const onBlur = () => {
      setQuizWarnings((prev) => prev + 1);
      setWarningModalMessage("Focus changed. Stay in fullscreen quiz mode.");
    };
    const onFsChange = () => {
      if (quizMode && !document.fullscreenElement) {
        requestQuizFullscreen();
        setWarningModalMessage("Fullscreen is required while taking the quiz.");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [quizMode]);

  const submitQuizAttempt = async () => {
    if (!quizData?._id) return;
    const answers = Object.entries(quizAnswers).map(([questionId, optionId]) => ({
      questionId,
      selectedOptions: [optionId],
    }));

    const response = await submitQuiz(
      quizData._id,
      answers,
      quizData?.timeLimit ? Number(quizData.timeLimit) * 60 - quizTimerLeft : 0,
      courseId
    );
    const result = response?.data || response;
    if (result) {
      setQuizResult({
        obtained: result.obtainedMarks,
        total: result.totalMarks,
        percent: result.scorePercent,
        passed: result.passed,
        gradedAnswers: result.gradedAnswers || [],
        questions: result.questions || [],
      });
    }
    setQuizMode(false);
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    if (quizMode && quizTimerLeft === 0) submitQuizAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizMode, quizTimerLeft]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const startQuiz = async () => {
    setShowQuizStartModal(false);
    setQuizMode(true);
    setQuizWarnings(0);
    if (quizData?.timeLimit) setQuizTimerLeft(Number(quizData.timeLimit) * 60);
    await requestQuizFullscreen();
  };

  const renderCorrectAnswer = (question) => {
    const correct = (question?.options || []).find((option) => option.isCorrect);
    return correct ? correct.text : "N/A";
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
        <aside className="w-full bg-richblack-800 md:min-h-screen md:w-[36%] lg:w-[28%]">
          <div className="border-b border-richblack-700 px-4 pb-4 pt-24">
            <h1 className="mb-3 text-base font-bold leading-snug text-richblack-5">{course?.title}</h1>
            <div className="mb-1 h-1.5 w-full rounded-full bg-richblack-700">
              <div className="h-1.5 rounded-full bg-yellow-50 transition-all" style={{ width: `${completion}%` }} />
            </div>
            <p className="text-xs text-richblack-400">{completion}% complete</p>
          </div>

          <div className="max-h-[calc(100vh-180px)] overflow-y-auto py-2 md:max-h-[calc(100vh-140px)]">
            {(sections || []).map((section, index) => (
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
        </aside>

        <main className="flex-1 pt-16 lg:pt-20">
          {playerLoading ? (
            <div className="p-5">
              <div className="mb-3 h-6 w-1/3 animate-pulse rounded bg-richblack-700" />
              <div className="aspect-video w-full animate-pulse rounded-xl bg-richblack-800" />
            </div>
          ) : !activeSubsection ? (
            <div className="grid h-[60vh] place-items-center text-richblack-300">Select a lesson from the sidebar.</div>
          ) : String(activeSubsection.type) === "video" ? (
            <>
              <div className="aspect-video max-h-[60vh] w-full bg-black">
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
              </div>
              <div className="px-5 py-4">
                <h2 className="text-lg font-semibold text-richblack-5">{activeSubsection.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-richblack-400">{activeSubsection.description}</p>
              </div>
            </>
          ) : String(activeSubsection.type) === "notes" || String(activeSubsection.type) === "note" ? (
            <div ref={notesContainerRef} className="px-5 py-5">
              <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold text-richblack-5">{activeSubsection.title}</h2>
                  <button
                    type="button"
                    onClick={async () => {
                      if (document.fullscreenElement) {
                        await document.exitFullscreen?.();
                      } else {
                        await notesContainerRef.current?.requestFullscreen?.();
                      }
                    }}
                    className="rounded bg-richblack-700 px-3 py-1 text-xs text-richblack-100"
                  >
                    Toggle Fullscreen
                  </button>
                </div>
                <div className="max-h-[75vh] overflow-y-auto rounded-lg bg-richblack-900 p-4">
                  {activeSubsection.textContent ? (
                    <div
                      className="prose prose-invert max-w-none text-sm leading-7 text-richblack-100"
                      dangerouslySetInnerHTML={{ __html: activeSubsection.textContent }}
                    />
                  ) : null}
                  {activeSubsection.contentUrl ? (
                    <a href={activeSubsection.contentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-yellow-50 underline">
                      Open notes file
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ) : String(activeSubsection.type) === "quiz" ? (
            <div ref={quizContainerRef} className="px-5 py-5">
              <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-richblack-5">{activeSubsection.title}</h2>
                  {quizMode ? (
                    <div className="rounded bg-richblack-900 px-3 py-1 text-sm text-yellow-50">Timer: {formatTime(quizTimerLeft)}</div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowQuizStartModal(true)}
                      className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900"
                    >
                      Start Quiz
                    </button>
                  )}
                </div>
                {quizWarnings > 0 && quizMode ? (
                  <p className="mb-3 text-sm text-pink-300">Tab switch warning: {quizWarnings}</p>
                ) : null}
                {quizData?.questions?.length ? (
                  <div className="space-y-4">
                    {quizData.questions.map((question, index) => (
                      <div key={question._id} className="rounded-lg border border-richblack-700 bg-richblack-900 p-4">
                        <p className="mb-3 text-sm font-semibold text-richblack-5">Q{index + 1}. {question.questionText}</p>
                        <div className="space-y-2">
                          {(question.options || []).map((option) => (
                            <label key={option._id} className="flex items-center gap-2 text-sm text-richblack-200">
                              <input
                                type="radio"
                                disabled={!quizMode}
                                name={`question-${question._id}`}
                                checked={quizAnswers[question._id] === option._id}
                                onChange={() => setQuizAnswers((prev) => ({ ...prev, [question._id]: option._id }))}
                              />
                              {option.text}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    {quizMode ? (
                      <button type="button" onClick={submitQuizAttempt} className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900">
                        Submit Quiz
                      </button>
                    ) : null}
                    {quizResult ? (
                      <div className="space-y-2 rounded-lg border border-richblack-700 bg-richblack-900 p-3">
                        <p className={`text-sm ${quizResult.passed ? "text-caribbeangreen-200" : "text-pink-300"}`}>
                          Score: {quizResult.obtained}/{quizResult.total} ({quizResult.percent}%)
                        </p>
                        {(quizResult.questions || []).map((question) => {
                          const graded = (quizResult.gradedAnswers || []).find(
                            (answer) => String(answer.questionId) === String(question._id)
                          );
                          return (
                            <div key={question._id} className="text-xs text-richblack-300">
                              <p>{question.questionText}</p>
                              <p className={graded?.isCorrect ? "text-caribbeangreen-300" : "text-pink-300"}>
                                {graded?.isCorrect ? "Correct" : `Correct answer: ${renderCorrectAnswer(question)}`}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-richblack-300">Quiz details are not available.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid h-[60vh] place-items-center text-richblack-300">Unsupported content type.</div>
          )}
        </main>
      </div>
      <Footer />

      <Modal isOpen={showQuizStartModal} onClose={() => setShowQuizStartModal(false)} title="Start Quiz?" size="sm">
        <p className="text-sm text-richblack-200">Quiz will start in fullscreen mode. Do you want to continue?</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setShowQuizStartModal(false)} className="rounded border border-richblack-600 px-3 py-1.5 text-xs text-richblack-200">
            Cancel
          </button>
          <button type="button" onClick={startQuiz} className="rounded bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-richblack-900">
            Start Quiz
          </button>
        </div>
      </Modal>

      <Modal isOpen={Boolean(warningModalMessage)} onClose={() => setWarningModalMessage("")} title="Quiz Warning" size="sm">
        <p className="text-sm text-richblack-200">{warningModalMessage}</p>
      </Modal>
    </>
  );
};

export default CourseContent;
