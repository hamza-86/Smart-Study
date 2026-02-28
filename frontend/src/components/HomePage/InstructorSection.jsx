import React from "react";
import { FaArrowRight } from "react-icons/fa";
import Instructor from "../../assets/Instructor.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "../../utils/motion";

const InstructorSection = () => {
  const navigate = useNavigate();

  return (
    <div className="py-16">
      <div className="flex flex-col lg:flex-row gap-20 items-center">

        {/* Image */}
        <div className="lg:w-[50%]">
          <img
            src={Instructor}
            alt="Smart Study Instructor"
            className="shadow-white shadow-[-20px_-20px_0_0]"
          />
        </div>

        {/* Content */}
        <div className="lg:w-[50%] flex gap-8 flex-col">

          <motion.div
            variants={textVariant()}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h1 className="text-4xl font-semibold">
              Become a{" "}
              <span className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text font-bold">
                Smart Study Instructor
              </span>
            </h1>
          </motion.div>

          <motion.p
            variants={fadeIn("", "", 0.1, 1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="font-medium text-[16px] text-justify text-richblack-300"
          >
            Share your knowledge with thousands of learners across the world.
            Smart Study provides powerful tools, course management, analytics,
            and monetization support to help you teach what you love.
          </motion.p>

          <div className="w-fit">
            <button
              onClick={() => navigate("/signup")}
              className="bg-yellow-50 flex items-center gap-2 text-black px-4 py-3 rounded-md font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] hover:shadow-none hover:scale-95 hover:bg-richblack-800 hover:text-yellow-50 transition-all duration-200"
            >
              Start Teaching Today
              <FaArrowRight />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstructorSection;