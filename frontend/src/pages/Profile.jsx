/**
 * Profile Page
 * FILE: src/pages/Profile.jsx
 *
 * Changes from original:
 *  - user.name → user.firstName + user.lastName (new User model)
 *  - Avatar fallback seed uses firstName + lastName
 *  - Added instructor-specific fields (headline, website)
 *  - Shows accountType badge
 */

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { VscEdit } from "react-icons/vsc";

const ProfileField = ({ label, value }) => (
  <div className="py-3 border-b border-richblack-700 last:border-0">
    <p className="text-xs text-richblack-400 mb-0.5">{label}</p>
    <p className="text-richblack-100 text-sm">{value || <span className="text-richblack-500 italic">Not set</span>}</p>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const fullName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || "User";

  const isInstructor = user?.accountType === "Instructor";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex justify-center items-start min-h-screen bg-richblack-900"
    >
      <div className="mt-16 w-full max-w-2xl px-4 pb-16">
        <div className="pt-10 mb-6 flex items-center justify-between">
          <h1 className="text-richblack-5 font-bold text-2xl">My Profile</h1>
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-richblack-600 text-richblack-200 hover:bg-richblack-700 transition text-sm"
          >
            <VscEdit size={16} /> Edit Profile
          </button>
        </div>

        {/* Avatar + basic info */}
        <div className="bg-richblack-800 rounded-2xl p-6 flex items-center gap-5 mb-4">
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(fullName)}`
            }
            alt={fullName}
            className="w-20 h-20 rounded-full object-cover border-2 border-richblack-600"
          />
          <div>
            <p className="text-richblack-5 font-semibold text-lg">{fullName}</p>
            <p className="text-richblack-400 text-sm">{user?.email}</p>
            <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
              ${isInstructor
                ? "bg-blue-900 text-blue-300"
                : "bg-caribbeangreen-900 text-caribbeangreen-300"
              }`}
            >
              {user?.accountType}
            </span>
          </div>
        </div>

        {/* Profile details */}
        <div className="bg-richblack-800 rounded-2xl p-6 mb-4">
          <h2 className="text-richblack-5 font-semibold text-base mb-2">Personal Information</h2>
          <ProfileField label="First Name"    value={user?.firstName} />
          <ProfileField label="Last Name"     value={user?.lastName} />
          <ProfileField label="Email"         value={user?.email} />
          <ProfileField label="Phone"         value={user?.phone} />
          <ProfileField label="Date of Birth" value={
            user?.dateOfBirth
              ? new Date(user.dateOfBirth).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })
              : null
          } />
          <ProfileField label="Gender"        value={user?.gender} />
          <ProfileField label="Bio"           value={user?.bio} />
        </div>

        {/* Instructor-specific fields */}
        {isInstructor && (
          <div className="bg-richblack-800 rounded-2xl p-6 mb-4">
            <h2 className="text-richblack-5 font-semibold text-base mb-2">Instructor Info</h2>
            <ProfileField label="Headline" value={user?.headline} />
            <ProfileField label="Website"  value={user?.website} />
            <ProfileField label="LinkedIn" value={user?.linkedin} />
            <ProfileField label="Twitter"  value={user?.twitter} />
            <ProfileField label="YouTube"  value={user?.youtube} />
          </div>
        )}

        <button
          onClick={() => navigate("/dashboard/settings?edit=password")}
          className="w-full py-3 rounded-lg border border-richblack-600 text-richblack-200 hover:bg-richblack-700 transition text-sm font-medium"
        >
          Change Password
        </button>
      </div>
    </motion.div>
  );
};

export default Profile;