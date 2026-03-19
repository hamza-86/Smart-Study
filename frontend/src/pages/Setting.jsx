/**
 * Settings Page
 * FILE: src/pages/Setting.jsx
 *
 * Changes from original:
 *  - Was a purely static form with no API calls
 *  - Now calls updateProfile() from authServices on save
 *  - Upload avatar button calls uploadAvatar() from authServices
 *  - Change password section calls changePassword()
 *  - firstName/lastName model (not name)
 *  - Added instructor-specific fields (headline, website, social links)
 */

import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { updateProfile, uploadAvatar, changePassword } from "../services/Authservices";

const inputClass =
  "w-full border border-richblack-600 bg-richblack-700 text-richblack-5 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-400 transition";

const Setting = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((state) => state.auth);
  const fileRef   = useRef(null);

  const isInstructor = user?.accountType === "Instructor";

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";

  // ── Profile form state ──────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    firstName:  user?.firstName  || "",
    lastName:   user?.lastName   || "",
    phone:      user?.phone      || "",
    bio:        user?.bio        || "",
    gender:     user?.gender     || "",
    dateOfBirth:user?.dateOfBirth ? user.dateOfBirth.substring(0, 10) : "",
    headline:   user?.headline   || "",
    website:    user?.website    || "",
    linkedin:   user?.linkedin   || "",
    twitter:    user?.twitter    || "",
    youtube:    user?.youtube    || "",
  });

  const [saving,  setSaving]  = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // ── Password form state ─────────────────────────────────────────────────
  const [pwdForm, setPwdForm] = useState({
    oldPassword:      "",
    newPassword:      "",
    confirmNewPassword: "",
  });
  const [showPwd,    setShowPwd]    = useState({ old: false, new: false, conf: false });
  const [pwdSaving,  setPwdSaving]  = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleProfileChange = (e) =>
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePwdChange = (e) =>
    setPwdForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    await uploadAvatar(file, dispatch);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(profile, dispatch);
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSaving(true);
    await changePassword(
      pwdForm.oldPassword,
      pwdForm.newPassword,
      pwdForm.confirmNewPassword,
      dispatch
    );
    setPwdSaving(false);
    setPwdForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex justify-center bg-richblack-900 min-h-screen"
    >
      <div className="mt-16 w-full max-w-3xl px-4 pb-16">
        <h1 className="text-richblack-5 font-bold text-2xl pt-10 mb-8">Edit Profile</h1>

        {/* ── Avatar section ────────────────────────────────────────────── */}
        <div className="bg-richblack-800 rounded-2xl p-6 mb-6 flex items-center gap-5">
          <img
            src={
              avatarPreview ||
              user?.avatar ||
              `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(fullName)}`
            }
            alt={fullName}
            className="w-20 h-20 rounded-full object-cover border-2 border-richblack-600"
          />
          <div className="space-y-1">
            <p className="text-richblack-5 font-medium text-sm">Profile Picture</p>
            <p className="text-richblack-400 text-xs">JPG, PNG or WEBP — max 5MB</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 mt-2 px-4 py-1.5 rounded-lg bg-richblack-700 border border-richblack-600 text-richblack-200 text-sm hover:bg-richblack-600 transition"
            >
              <FiUpload size={14} /> Change Photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>
        </div>

        {/* ── Profile form ──────────────────────────────────────────────── */}
        <form onSubmit={handleSaveProfile} className="bg-richblack-800 rounded-2xl p-6 mb-6">
          <h2 className="text-richblack-5 font-semibold mb-5">Personal Information</h2>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-richblack-300">First Name</span>
              <input name="firstName" value={profile.firstName} onChange={handleProfileChange} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-richblack-300">Last Name</span>
              <input name="lastName" value={profile.lastName} onChange={handleProfileChange} className={inputClass} />
            </label>
          </div>

          {/* Phone + Gender */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-richblack-300">Phone</span>
              <input name="phone" value={profile.phone} onChange={handleProfileChange} placeholder="+91 98765 43210" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-richblack-300">Gender</span>
              <select name="gender" value={profile.gender} onChange={handleProfileChange} className={inputClass}>
                <option value="">Select gender</option>
                {["Male", "Female", "Other", "Prefer not to say"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>
          </div>

          {/* DOB */}
          <label className="flex flex-col gap-1.5 mb-4">
            <span className="text-xs text-richblack-300">Date of Birth</span>
            <input type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleProfileChange} className={inputClass} />
          </label>

          {/* Bio */}
          <label className="flex flex-col gap-1.5 mb-4">
            <span className="text-xs text-richblack-300">Bio</span>
            <textarea
              name="bio" value={profile.bio} onChange={handleProfileChange}
              rows={3} maxLength={1000} placeholder="Tell students about yourself"
              className={`${inputClass} resize-none`}
            />
          </label>

          {/* Instructor fields */}
          {isInstructor && (
            <>
              <h3 className="text-richblack-300 text-sm font-medium mt-6 mb-4">Instructor Information</h3>
              <label className="flex flex-col gap-1.5 mb-4">
                <span className="text-xs text-richblack-300">Headline</span>
                <input name="headline" value={profile.headline} onChange={handleProfileChange} placeholder="e.g. Full Stack Developer | 10+ years experience" className={inputClass} />
              </label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-richblack-300">Website</span>
                  <input name="website" value={profile.website} onChange={handleProfileChange} placeholder="https://yourwebsite.com" className={inputClass} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-richblack-300">LinkedIn</span>
                  <input name="linkedin" value={profile.linkedin} onChange={handleProfileChange} placeholder="LinkedIn URL" className={inputClass} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-richblack-300">Twitter</span>
                  <input name="twitter" value={profile.twitter} onChange={handleProfileChange} placeholder="Twitter URL" className={inputClass} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-richblack-300">YouTube</span>
                  <input name="youtube" value={profile.youtube} onChange={handleProfileChange} placeholder="YouTube channel URL" className={inputClass} />
                </label>
              </div>
            </>
          )}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => navigate("/dashboard/my-profile")}
              className="px-5 py-2.5 rounded-lg border border-richblack-600 text-richblack-300 hover:bg-richblack-700 transition text-sm"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-yellow-50 text-richblack-900 font-semibold hover:bg-yellow-100 transition text-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* ── Change Password ────────────────────────────────────────────── */}
        <form onSubmit={handleChangePassword} className="bg-richblack-800 rounded-2xl p-6">
          <h2 className="text-richblack-5 font-semibold mb-5">Change Password</h2>

          {[
            { name: "oldPassword",        label: "Current Password", key: "old" },
            { name: "newPassword",        label: "New Password",     key: "new" },
            { name: "confirmNewPassword", label: "Confirm New Password", key: "conf" },
          ].map(({ name, label, key }) => (
            <label key={name} className="flex flex-col gap-1.5 mb-4">
              <span className="text-xs text-richblack-300">{label}</span>
              <div className="relative">
                <input
                  type={showPwd[key] ? "text" : "password"}
                  name={name}
                  value={pwdForm[name]}
                  onChange={handlePwdChange}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className={`${inputClass} pr-10`}
                />
                <button type="button"
                  onClick={() => setShowPwd((p) => ({ ...p, [key]: !p[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-yellow-50 transition"
                >
                  {showPwd[key] ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>
            </label>
          ))}

          <button
            type="submit" disabled={pwdSaving}
            className="px-5 py-2.5 rounded-lg bg-yellow-50 text-richblack-900 font-semibold hover:bg-yellow-100 transition text-sm disabled:opacity-60"
          >
            {pwdSaving ? "Updating..." : "Update Password"}
          </button>
        </form>

      </div>
    </motion.div>
  );
};

export default Setting;