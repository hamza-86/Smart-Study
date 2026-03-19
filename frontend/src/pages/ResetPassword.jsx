/**
 * ResetPassword Page
 * FILE: src/pages/ResetPassword.jsx
 *
 * NEW PAGE — was missing from your original codebase.
 * App.js routes /reset-password/:token here.
 * Token comes from URL param (email link).
 * Uses resetPassword() from authServices.
 */

import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { resetPassword } from "../services/Authservices";

const inputClass =
  "w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-400 transition";

const ResetPassword = () => {
  const navigate     = useNavigate();
  const { token }    = useParams();

  const [form,      setForm]      = useState({ newPassword: "", confirmPassword: "" });
  const [showPwd,   setShowPwd]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return;
    setLoading(true);
    // resetPassword handles toast and navigation to /login on success
    await resetPassword(token, form.newPassword, form.confirmPassword, navigate);
    setLoading(false);
  };

  const passwordMismatch =
    form.confirmPassword.length > 0 &&
    form.newPassword !== form.confirmPassword;

  return (
    <div className="min-h-screen bg-richblack-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <h1 className="text-richblack-5 font-bold text-2xl mb-2">Set New Password</h1>
        <p className="text-richblack-300 text-sm mb-8 leading-relaxed">
          Choose a strong password. It must be at least 8 characters with
          uppercase, lowercase, a number, and a special character.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* New Password */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-richblack-5">
              New Password <sup className="text-pink-200">*</sup>
            </span>
            <div className="relative">
              <input
                required
                type={showPwd ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                minLength={8}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-yellow-50 transition"
              >
                {showPwd ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
          </label>

          {/* Confirm Password */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-richblack-5">
              Confirm Password <sup className="text-pink-200">*</sup>
            </span>
            <div className="relative">
              <input
                required
                type={showConf ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                minLength={8}
                className={`${inputClass} pr-10 ${
                  passwordMismatch ? "border-pink-500 focus:ring-pink-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConf((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-yellow-50 transition"
              >
                {showConf ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-pink-400 text-xs mt-0.5">Passwords do not match</p>
            )}
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || passwordMismatch || !form.newPassword}
            className="w-full py-3 rounded-lg bg-yellow-50 text-richblack-900 font-bold hover:bg-yellow-100 transition disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-richblack-300 hover:text-richblack-5 transition text-sm"
          >
            <BiArrowBack size={16} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;