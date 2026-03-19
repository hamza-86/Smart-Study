/**
 * Home Page
 * FILE: src/pages/Home.jsx
 *
 * Changes from original:
 *  - "SmartLearn" branding references replaced with "EduFlow"
 *  - CTA buttons now go to /allCourses (not /login) — public can browse
 *  - Added useSelector to show different CTA text if already logged in
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { MdArrowForward } from "react-icons/md";
import heroImg from "../assets/hero image.webp";
import TimelineSection        from "../components/HomePage/TimeLine";
import InstructorSection      from "../components/HomePage/InstructorSection";
import LearningLanguageSection from "../components/HomePage/LearningLanguagesSection";
import Footer  from "../components/Footer";
import { textVariant, fadeIn } from "../utils/motion";

const Home = () => {
  const navigate = useNavigate();
  const token    = useSelector((state) => state.auth.token);

  const ctaLabel    = token ? "Browse Courses"    : "Start Learning Free";
  const ctaPath     = token ? "/allCourses"        : "/signup";
  const secondLabel = token ? "Continue Learning"  : "Learn More";
  const secondPath  = token ? "/dashboard"         : "/allCourses";

  return (
    <div className="min-h-screen h-auto flex w-full flex-col justify-center items-center">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-richblack-900 lg:pt-24 lg:min-h-screen relative mx-auto flex flex-col md:flex-row w-full max-w-screen-xl items-center justify-between gap-9 lg:gap-5 text-white px-4">

        <div className="text-center md:text-left space-y-6 pt-28 lg:pt-0 w-[90%]">
          <motion.div
            variants={textVariant()}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl pb-1 font-semibold bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text">
              Empower Your Future with Coding Skills
            </h1>
          </motion.div>

          <motion.p
            variants={fadeIn("", "", 0.1, 1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="text-lg text-richblack-200 max-w-xl leading-relaxed"
          >
            With our coding courses, you can learn at your own pace, from
            anywhere in the world, and get access to hands-on projects, quizzes,
            and personalised feedback from expert instructors.
          </motion.p>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => navigate(ctaPath)}
              className="flex items-center gap-2 bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-100 transition shadow-md"
            >
              {ctaLabel}
              <MdArrowForward size={18} />
            </button>
            <button
              onClick={() => navigate(secondPath)}
              className="flex items-center gap-2 border border-richblack-500 text-richblack-200 px-6 py-3 rounded-lg font-medium hover:bg-richblack-800 transition"
            >
              {secondLabel}
            </button>
          </div>
        </div>

        <img
          src={heroImg}
          alt="Hero — students learning online"
          className="w-full md:w-[55%] h-auto rounded-xl shadow-xl"
        />
      </div>

      {/* ── Skills section ─────────────────────────────────────────────── */}
      <div className="w-full bg-[#F9F9F9] px-4 sm:px-6">
        <div className="mx-auto mt-24 lg:mt-0 flex max-w-maxContent flex-col items-center justify-evenly gap-8">

          <div className="mb-10 mt-[-100px] flex flex-col justify-between gap-7 lg:mt-20 lg:flex-row lg:gap-0">
            <div className="text-4xl font-semibold lg:w-[45%]">
              Get the skills you need for a{" "}
              <span className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text font-bold">
                job that is in demand.
              </span>
            </div>
            <div className="flex flex-col items-start gap-8 lg:w-[40%]">
              <p className="text-[15px] text-[#2C333F] font-semibold leading-relaxed">
                Today's learner sets their own terms. To stay competitive you
                need more than just professional skills — you need up-to-date,
                practical knowledge from real industry practitioners.
              </p>
              <button
                onClick={() => navigate("/allCourses")}
                className="bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-100 transition"
              >
                Explore Courses
              </button>
            </div>
          </div>

          <TimelineSection />
          <LearningLanguageSection />
        </div>
      </div>

      {/* ── Instructor section ─────────────────────────────────────────── */}
      <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
        <InstructorSection />
      </div>

      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Home;