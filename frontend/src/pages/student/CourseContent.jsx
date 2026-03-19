/**
 * CourseContent Page
 * FILE: src/pages/student/CourseContent.jsx
 *
 * Changes from original:
 *  - Fixed import: fetchEnrolledCourse + updateCourseProgress + updateWatchTime from courseServices.js
 *  - Calls updateWatchTime every 10 seconds while video plays
 *  - Calls updateCourseProgress when video reaches 90% (marks as complete)
 *  - Calls getResumeInfo on load to resume from last position
 *  - Shows completion percentage in sidebar
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Section from "../../components/student/Section";
import Footer  from "../../components/Footer";
import {
  fetchEnrolledCourse,
  updateCourseProgress,
  updateWatchTime,
  getResumeInfo,
  getCourseProgress,
} from "../../services/courseServices";

const CourseContent = () => {
  const dispatch   = useDispatch();
  const token      = useSelector((state) => state.auth.token);
  const loading    = useSelector((state) => state.auth.loading);
  const { courseId } = useParams();

  const [course,         setCourse]         = useState(null);
  const [selectedVideo,  setSelectedVideo]  = useState(null);
  const [subSection,     setSubSection]     = useState(null);
  const [completedVideos,setCompletedVideos]= useState([]);
  const [completion,     setCompletion]     = useState(0);
  const [isActive,       setIsActive]       = useState([]);

  const videoRef           = useRef(null);
  const watchIntervalRef   = useRef(null);
  const markedCompleteRef  = useRef(new Set()); // track which subSections already marked

  const handleActive = (id) =>
    setIsActive((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );

  // ── Fetch course on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const response = await fetchEnrolledCourse(courseId, token, dispatch);
      if (!response) return;

      const courseData = response?.data?.data?.courseDetails || response;
      setCourse(courseData);

      // Fetch progress
      const progress = await getCourseProgress(courseId);
      if (progress) {
        setCompletedVideos(progress.completedVideos || []);
        setCompletion(progress.completionPercentage || 0);
        markedCompleteRef.current = new Set(
          progress.completedVideos?.map((id) => String(id)) || []
        );
      }

      // Resume from last position
      const resume = await getResumeInfo(courseId);
      if (resume?.lastWatchedVideo) {
        setSelectedVideo(resume.lastWatchedVideo.videoUrl);
        setSubSection(resume.lastWatchedVideo);
      } else if (courseData?.courseContent?.[0]?.subSections?.[0]) {
        const first = courseData.courseContent[0].subSections[0];
        setSelectedVideo(first.videoUrl);
        setSubSection(first);
      }
    };

    load();
  }, [courseId, token, dispatch]);

  // ── Watch time tracking ────────────────────────────────────────────────────
  const startWatchTracking = useCallback(() => {
    if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    watchIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || !subSection || video.paused) return;
      updateWatchTime(
        courseId,
        subSection._id,
        Math.round(video.currentTime),
        Math.round(video.duration || 0),
        Math.round(video.currentTime)
      );
    }, 10_000); // every 10 seconds
  }, [courseId, subSection]);

  const stopWatchTracking = useCallback(() => {
    if (watchIntervalRef.current) {
      clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopWatchTracking(), [stopWatchTracking]);

  // ── Mark complete when video reaches 90% ─────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !subSection) return;
    const { currentTime, duration } = video;
    if (!duration) return;

    const ratio = currentTime / duration;
    const subId = String(subSection._id);

    if (ratio >= 0.9 && !markedCompleteRef.current.has(subId)) {
      markedCompleteRef.current.add(subId);
      updateCourseProgress(courseId, subSection._id).then((result) => {
        if (result) {
          setCompletedVideos(result.completedVideos || []);
          setCompletion(result.completionPercentage || 0);
        }
      });
    }
  }, [courseId, subSection]);

  // ── Change video ──────────────────────────────────────────────────────────
  const handleVideoClick = (subSec) => {
    stopWatchTracking();
    setSelectedVideo(subSec.videoUrl);
    setSubSection(subSec);
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
      <div className="min-h-screen flex flex-col-reverse md:flex-row bg-richblack-900">

        {/* ── Left Sidebar — Course outline ───────────────────────────────── */}
        <div className="w-full md:w-[36%] lg:w-[28%] md:min-h-screen bg-richblack-800 flex flex-col">

          {/* Course title + progress */}
          <div className="px-4 pt-24 pb-4 border-b border-richblack-700">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-richblack-5 font-bold text-base leading-snug mb-3"
            >
              {course?.title}
            </motion.h1>

            {/* Progress bar */}
            <div className="w-full bg-richblack-700 rounded-full h-1.5 mb-1">
              <div
                className="bg-yellow-50 h-1.5 rounded-full transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-richblack-400 text-xs">
              {completion}% complete
            </p>
          </div>

          {/* Sections list */}
          <div className="flex-1 overflow-y-auto py-2">
            {course?.courseContent?.map((section, index) => (
              <Section
                key={section._id}
                section={section}
                isActive={isActive}
                handleActive={handleActive}
                handleVideoClick={handleVideoClick}
                selectedSubSec={subSection}
                completedVideos={completedVideos}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* ── Right — Video player ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col">

          {/* Video player */}
          <div className="w-full flex items-center justify-center bg-black md:mt-16 lg:mt-20 aspect-video max-h-[60vh]">
            {selectedVideo ? (
              <video
                ref={videoRef}
                key={selectedVideo}
                src={selectedVideo}
                controls
                autoPlay
                controlsList="nodownload"
                className="w-full h-full object-contain"
                onPlay={startWatchTracking}
                onPause={stopWatchTracking}
                onEnded={stopWatchTracking}
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <p className="text-richblack-400 text-lg">Select a lecture to watch</p>
            )}
          </div>

          {/* Lecture info */}
          {subSection && (
            <div className="px-5 py-4">
              <h2 className="text-richblack-5 font-semibold text-lg">{subSection.title}</h2>
              {subSection.description && (
                <p className="text-richblack-400 text-sm mt-1 leading-relaxed">
                  {subSection.description}
                </p>
              )}
            </div>
          )}
        </div>

      </div>
      <Footer />
    </>
  );
};

export default CourseContent;