import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const PurchaseHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-center items-start min-h-screen my-10">
      <div className="text-white mt-16 min-h-screen w-full mb-10 lg:w-[1000px] px-5">
        <h1 className="text-[#F1F2FF] font-semibold text-[25px] lg:text-[30px] mb-8">
          Cart
        </h1>

        <p className="border-b border-b-richblack-400 pb-2 font-semibold text-richblack-400">
          0 Courses in Cart
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-y-4">
          <p className="text-3xl text-richblack-100">Your cart is empty</p>
          <button
            onClick={() => navigate('/allCourses')}
            className="cursor-pointer rounded-md bg-yellow-50 py-2 px-5 font-semibold text-richblack-900 mt-4"
          >
            Browse Courses
          </button>
        </div>

      </div>
    </div>
  );
};

export default PurchaseHistory;
