/**
 * Signup Page
 * FILE: src/pages/Signup.jsx
 *
 * Changes from original:
 *  - name field split into firstName + lastName (new User model)
 *  - signupData now stores firstName/lastName (not name)
 *  - Uses sendOTP from authServices (not raw axios)
 *  - Added password strength hint
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { motion } from "framer-motion";
import Tab from "../components/Tab";
import signupImage from "../assets/signupImage.png";
import { setSignupData } from "../slices/authSlice";
import axiosInstance from "../services/axiosInstance";
import { endpoints } from "../services/api";
import { toast } from "react-hot-toast";

const { SENDOTP_API } = endpoints;

const ACCOUNT_TYPE = { STUDENT: "Student", INSTRUCTOR: "Instructor" };

const tabData = [
  { id: 1, tabName: "Student",    type: ACCOUNT_TYPE.STUDENT    },
  { id: 2, tabName: "Instructor", type: ACCOUNT_TYPE.INSTRUCTOR },
];

const inputClass =
  "w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-400 transition";

const Signup = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT);
  const [loading,     setLoading]     = useState(false);
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConf,    setShowConf]    = useState(false);

  const [form, setForm] = useState({
    firstName:       "",
    lastName:        "",
    email:           "",
    password:        "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Store signup data so VerifyEmail can use it
    dispatch(setSignupData({ ...form, accountType }));

    setLoading(true);
    const toastId = toast.loading("Sending OTP...");
    try {
      const response = await axiosInstance.post(SENDOTP_API, {
        email: form.email,
      });
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("OTP sent to your email");
      navigate("/verify-email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send OTP");
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-richblack-900 flex items-center justify-center px-4 py-24 lg:py-10 flex-col-reverse lg:flex-row gap-10">

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[460px]"
      >
        <h1 className="text-richblack-5 text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-richblack-300 text-sm mb-4">
          Empower your learning.{" "}
          <span className="italic text-blue-100 font-semibold">Shape Your Future.</span>
        </p>

        {/* Role selector */}
        <Tab tabData={tabData} field={accountType} setField={setAccountType} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-5">

          {/* First + Last name */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-richblack-5">
                First Name <sup className="text-pink-200">*</sup>
              </span>
              <input
                required name="firstName" value={form.firstName}
                onChange={handleChange} placeholder="First name"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-richblack-5">
                Last Name <sup className="text-pink-200">*</sup>
              </span>
              <input
                required name="lastName" value={form.lastName}
                onChange={handleChange} placeholder="Last name"
                className={inputClass}
              />
            </label>
          </div>

          {/* Email */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-richblack-5">
              Email Address <sup className="text-pink-200">*</sup>
            </span>
            <input
              required type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="Enter your email"
              className={inputClass}
            />
          </label>

          {/* Password */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-richblack-5">
                Password <sup className="text-pink-200">*</sup>
              </span>
              <div className="relative">
                <input
                  required
                  type={showPwd ? "text" : "password"}
                  name="password" value={form.password}
                  onChange={handleChange} placeholder="Create password"
                  className={`${inputClass} pr-10`}
                />
                <button type="button" onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-yellow-50 transition"
                >
                  {showPwd ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-richblack-5">
                Confirm Password <sup className="text-pink-200">*</sup>
              </span>
              <div className="relative">
                <input
                  required
                  type={showConf ? "text" : "password"}
                  name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} placeholder="Confirm password"
                  className={`${inputClass} pr-10`}
                />
                <button type="button" onClick={() => setShowConf((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-yellow-50 transition"
                >
                  {showConf ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>
            </label>
          </div>

          <p className="text-richblack-400 text-xs -mt-1">
            Password must be 8+ characters with uppercase, lowercase, number &amp; special character.
          </p>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-yellow-50 text-richblack-900 font-bold hover:bg-yellow-100 transition disabled:opacity-60 mt-1"
          >
            {loading ? "Sending OTP..." : "Create Account"}
          </button>

          <p className="text-center text-richblack-300 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-yellow-50 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img src={signupImage} alt="Signup" className="w-full max-w-[520px]" />
      </motion.div>
    </div>
  );
};

export default Signup;