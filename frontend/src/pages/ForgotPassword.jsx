/**
 * ForgotPassword Page
 * FILE: src/pages/ForgotPassword.jsx
 *
 * NEW PAGE — was missing from your original codebase.
 * App.js routes /forgot-password here.
 * Uses forgotPassword() from authServices.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BiArrowBack } from "react-icons/bi";
import { forgotPassword } from "../services/Authservices";

const inputClass =
  "w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-400 transition";

const ForgotPassword = () => {
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await forgotPassword(email);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-richblack-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        {submitted ? (
          /* ── Success state ──────────────────────────────────────────── */
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-caribbeangreen-900 flex items-center justify-center mx-auto mb-4">
              <span className="text-caribbeangreen-200 text-3xl">✓</span>
            </div>
            <h2 className="text-richblack-5 font-bold text-2xl mb-2">Check your email</h2>
            <p className="text-richblack-300 text-sm leading-relaxed mb-6">
              If an account with <span className="text-yellow-50">{email}</span> exists,
              we've sent a password reset link. Check your inbox and spam folder.
            </p>
            <p className="text-richblack-400 text-xs mb-6">
              The link expires in 15 minutes.
            </p>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-richblack-300 hover:text-richblack-5 transition text-sm"
            >
              <BiArrowBack size={16} /> Back to Sign In
            </Link>
          </div>
        ) : (
          /* ── Form state ─────────────────────────────────────────────── */
          <>
            <h1 className="text-richblack-5 font-bold text-2xl mb-2">Forgot Password?</h1>
            <p className="text-richblack-300 text-sm mb-8 leading-relaxed">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-richblack-5">
                  Email Address <sup className="text-pink-200">*</sup>
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className={inputClass}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-yellow-50 text-richblack-900 font-bold hover:bg-yellow-100 transition disabled:opacity-60"
              >
                {loading ? "Sending reset link..." : "Send Reset Link"}
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
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;