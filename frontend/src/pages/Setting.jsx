import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Setting = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-center items-start min-h-screen my-10">
      <div className="text-white mt-16 min-h-screen w-full mb-10 lg:w-[1000px] px-5">
        <h1 className="text-[#F1F2FF] font-semibold text-[25px] lg:text-[30px] mb-8">
          Edit Profile
        </h1>

        {/* Update Profile Picture */}
        <div className="flex items-center justify-between rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12 text-richblack-5">
          <div className="flex items-center gap-x-4">
            <img
              src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`}
              alt={`profile-${user?.firstName}`}
              className="aspect-square w-[78px] rounded-full object-cover"
            />
            <div className="space-y-2">
              <p>Change Profile Picture</p>
              <div className="flex flex-row gap-3">
                <button className="cursor-pointer rounded-md bg-yellow-50 py-2 px-5 font-semibold text-richblack-900">
                  Select
                </button>
                <button className="cursor-pointer rounded-md border border-richblack-700 bg-richblack-800 py-2 px-5 font-semibold text-richblack-50">
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <form className="my-10 flex flex-col gap-y-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12">
          <h2 className="text-lg font-semibold text-richblack-5">
            Profile Information
          </h2>
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="firstName" className="text-sm text-richblack-5">First Name</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="Enter first name"
                className="form-input rounded-lg border border-richblack-600 bg-richblack-700 p-3 text-richblack-5 focus:outline-none focus:ring-1 focus:ring-yellow-50"
                defaultValue={user?.firstName}
              />
            </div>
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="lastName" className="text-sm text-richblack-5">Last Name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Enter last name"
                className="form-input rounded-lg border border-richblack-600 bg-richblack-700 p-3 text-richblack-5 focus:outline-none focus:ring-1 focus:ring-yellow-50"
                defaultValue={user?.lastName}
              />
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate("/dashboard/my-profile")}
            className="cursor-pointer rounded-md bg-richblack-700 py-2 px-5 font-semibold text-richblack-50"
          >
            Cancel
          </button>
          <button className="cursor-pointer rounded-md bg-yellow-50 py-2 px-5 font-semibold text-richblack-900 flex items-center gap-x-2">
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default Setting;
