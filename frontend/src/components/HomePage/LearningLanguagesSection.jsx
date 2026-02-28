import React from "react";
import Know_your_progress from "../../assets/Know_your_progress.svg";
import Compare_with_others from "../../assets/Compare_with_others.svg";
import Plan_your_lessons from "../../assets/Plan_your_lessons.svg";
import { useNavigate } from "react-router-dom";

const LearningLanguageSection = () => {
  const navigate = useNavigate();

  return (
    <div className="py-16">

      <div className="text-4xl font-semibold text-center mb-6">
        Your Ultimate Platform for{" "}
        <span className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text font-bold">
          Smart Learning
        </span>
      </div>

      <p className="text-center text-richblack-700 font-medium lg:w-[75%] mx-auto leading-6 text-base">
        Smart Study helps you track progress, compare performance, and plan
        your learning journey effectively. Explore structured courses,
        interactive lessons, and real-world skills development.
      </p>

      <div className="flex flex-col lg:flex-row items-center justify-center mt-10">
        <img src={Know_your_progress} alt="Track Progress" className="lg:-mr-32" />
        <img src={Compare_with_others} alt="Compare Performance" className="lg:-mb-10 -mt-12" />
        <img src={Plan_your_lessons} alt="Plan Lessons" className="lg:-ml-36 -mt-16" />
      </div>

      <div className="w-fit mx-auto mt-10">
        <button
          onClick={() => navigate("/signup")}
          className="bg-yellow-50 text-black px-4 py-3 rounded-md font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] hover:shadow-none hover:scale-95 hover:bg-richblack-800 hover:text-yellow-50 transition-all duration-200"
        >
          Get Started
        </button>
      </div>

    </div>
  );
};

export default LearningLanguageSection;