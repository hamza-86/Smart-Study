/**
 * CourseDetails Page
 * FILE: src/pages/CourseDetails.jsx
 *
 * Changes from original:
 *  - Uses fetchCourseDetails from courseServices (not raw axios)
 *  - instructor name uses firstName/lastName (not name)
 *  - whatYouWillLearn is now an array — renders as list instead of Markdown
 *  - isEnrolled flag now comes from backend response (not local check)
 *  - BuyCourse import updated to use courseIds array
 *  - Added course level, language, requirements, totalStudents display
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { BiInfoCircle } from "react-icons/bi";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { VscStarFull, VscStarHalf } from "react-icons/vsc";
import Section    from "../components/Section";
import Footer     from "../components/Footer";
import CourseDetailsCard from "../components/CourseDetailsCard";
import { BuyCourse } from "../services/buyCourse";
import { fetchCourseDetails } from "../services/courseServices";
import { formatDate } from "../utils/formateDate";
import { textVariant, fadeIn } from "../utils/motion";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const token        = useSelector((state) => state.auth.token);
  const user         = useSelector((state) => state.auth.user);

  const [course,             setCourse]             = useState(null);
  const [isEnrolled,         setIsEnrolled]         = useState(false);
  const [totalNoOfLectures,  setTotalNoOfLectures]  = useState(0);
  const [isActive,           setIsActive]           = useState([]);
  const [loading,            setLoading]            = useState(true);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      setLoading(true);
      const result = await fetchCourseDetails(courseId, dispatch);
      if (result) {
        // Backend returns { data: course, isEnrolled }
        const courseData = result.data || result;
        const enrolled   = result.isEnrolled ?? false;
        setCourse(courseData);
        setIsEnrolled(enrolled);
      }
      setLoading(false);
    };
    load();
  }, [courseId, dispatch]);

  // Count lectures
  useEffect(() => {
    if (!course) return;
    let count = 0;
    course.courseContent?.forEach((sec) => {
      count += sec.subSections?.length || 0;
    });
    setTotalNoOfLectures(count);
  }, [course]);

  const handleActive = (id) =>
    setIsActive((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );

  const handleBuyCourse = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    const effectivePrice = course.discountedPrice ?? course.price;
    if (effectivePrice === 0) {
      // Free course
      import("../services/buyCourse").then(({ enrollFreeCourse }) =>
        enrollFreeCourse(courseId, navigate)
      );
    } else {
      BuyCourse(token, [courseId], user, navigate);
    }
  };

  const instructorName = course?.instructor
    ? `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim() ||
      "Unknown Instructor"
    : "Unknown Instructor";

  const effectivePrice = course
    ? (course.discountedPrice ?? course.price)
    : 0;

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
        <p className="text-richblack-300 text-xl">Course not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-richblack-900 mb-12">

        {/* ── Hero banner ────────────────────────────────────────────────── */}
        <div className="bg-richblack-800">
          <div className="mx-auto max-w-[1260px] px-4 py-8">
            <div className="grid lg:grid-cols-[1fr_auto] gap-8 min-h-[320px]">

              {/* Left: info */}
              <div className="flex flex-col gap-4 text-richblack-5 lg:py-8 max-w-[810px]">

                {/* Mobile thumbnail */}
                <div className="relative lg:hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full aspect-video object-cover rounded-xl"
                  />
                </div>

                {/* Title */}
                <motion.h1
                  variants={textVariant()}
                  initial="hidden"
                  whileInView="show"
                  className="text-2xl lg:text-4xl font-bold leading-tight"
                >
                  {course.title}
                </motion.h1>

                {/* Subtitle */}
                {course.subtitle && (
                  <p className="text-richblack-200 text-lg">{course.subtitle}</p>
                )}

                {/* Description */}
                <motion.p
                  variants={fadeIn("", "", 0.1, 1)}
                  initial="hidden"
                  whileInView="show"
                  className="text-richblack-200 text-base leading-relaxed"
                >
                  {course.description}
                </motion.p>

                {/* Rating + students */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-richblack-200">
                  {course.averageRating > 0 && (
                    <span className="flex items-center gap-1 text-yellow-50 font-semibold">
                      {course.averageRating.toFixed(1)}
                      <VscStarFull className="text-yellow-50" />
                      <span className="text-richblack-300 font-normal">
                        ({course.totalRatings} ratings)
                      </span>
                    </span>
                  )}
                  <span>{course.totalStudents?.toLocaleString() || 0} students enrolled</span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-richblack-300">
                  <span>By <span className="text-yellow-50">{instructorName}</span></span>
                  <span className="flex items-center gap-1">
                    <BiInfoCircle /> Created {formatDate(course.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineGlobeAlt /> {course.language || "English"}
                  </span>
                  {course.level && (
                    <span className="px-2 py-0.5 rounded-full border border-richblack-500 text-xs">
                      {course.level}
                    </span>
                  )}
                </div>

                {/* Mobile: price + buy */}
                <div className="flex flex-col gap-3 border-t border-richblack-600 pt-4 lg:hidden">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-richblack-5">
                      {effectivePrice === 0 ? "Free" : `₹${effectivePrice}`}
                    </span>
                    {course.discountedPrice != null && course.price > 0 && (
                      <span className="text-richblack-400 line-through text-lg">
                        ₹{course.price}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={
                      isEnrolled
                        ? () => navigate(`/dashboard/course-content/${courseId}`)
                        : handleBuyCourse
                    }
                    className="w-full py-3 rounded-lg bg-yellow-50 text-richblack-900 font-bold hover:bg-yellow-100 transition"
                  >
                    {isEnrolled ? "Continue Learning" : effectivePrice === 0 ? "Enroll Free" : "Buy Now"}
                  </button>
                </div>

              </div>

              {/* Desktop: course card */}
              <div className="hidden lg:block w-[360px] shrink-0">
                <div className="sticky top-24">
                  <CourseDetailsCard
                    course={course}
                    isEnrolled={isEnrolled}
                    handleBuyCourse={handleBuyCourse}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Body content ────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-[1260px] px-4 py-10 text-richblack-5">
          <div className="max-w-[810px]">

            {/* What you'll learn */}
            {course.whatYouWillLearn?.length > 0 && (
              <div className="mb-10 border border-richblack-600 rounded-xl p-8">
                <motion.h2
                  variants={textVariant()}
                  initial="hidden"
                  whileInView="show"
                  className="text-2xl font-bold mb-5"
                >
                  What you'll learn
                </motion.h2>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {(Array.isArray(course.whatYouWillLearn)
                    ? course.whatYouWillLearn
                    : [course.whatYouWillLearn]
                  ).map((item, i) => (
                    <li key={i} className="flex gap-2 text-richblack-100 text-sm">
                      <span className="text-yellow-50 mt-0.5 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex gap-2 text-richblack-200 text-sm">
                      <span className="text-richblack-400 mt-0.5">›</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course content */}
            <div className="mb-10">
              <motion.h2
                variants={textVariant()}
                initial="hidden"
                whileInView="show"
                className="text-2xl font-bold mb-4"
              >
                Course Content
              </motion.h2>
              <div className="flex flex-wrap gap-4 text-sm text-richblack-300 mb-4">
                <span>{course.courseContent?.length || 0} sections</span>
                <span>·</span>
                <span>{totalNoOfLectures} lectures</span>
                {course.totalDuration > 0 && (
                  <>
                    <span>·</span>
                    <span>{Math.round(course.totalDuration)} min total</span>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {course.courseContent?.map((section, index) => (
                  <Section
                    key={section._id}
                    course={section}
                    index={index}
                    isActive={isActive}
                    handleActive={handleActive}
                  />
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4">Instructor</h2>
              <div className="flex items-center gap-4 p-5 bg-richblack-800 rounded-xl">
                <img
                  src={
                    course.instructor?.avatar ||
                    `https://api.dicebear.com/5.x/initials/svg?seed=${instructorName}`
                  }
                  alt={instructorName}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <p className="text-richblack-5 font-semibold">{instructorName}</p>
                  {course.instructor?.headline && (
                    <p className="text-richblack-300 text-sm mt-0.5">
                      {course.instructor.headline}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetails;