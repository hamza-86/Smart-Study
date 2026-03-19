/**
 * VerifyEmail Page
 * FILE: src/pages/VerifyEmail.jsx
 *
 * Changes from original:
 *  - SIGNUP_API call now sends firstName/lastName instead of name
 *  - Uses axiosInstance (not raw axios)
 *  - Handles new response shape from backend
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BiArrowBack } from "react-icons/bi";
import { RxCountdownTimer } from "react-icons/rx";
import { toast } from "react-hot-toast";
import axiosInstance from "../services/axiosInstance";
import { endpoints } from "../services/api";

const { SIGNUP_API, SENDOTP_API } = endpoints;

const VerifyEmail = () => {
  const navigate     = useNavigate();
  const signupData   = useSelector((state) => state.auth.signupData);

  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!signupData) navigate("/signup");
  }, [signupData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Verifying...");
    try {
      // signupData now has firstName + lastName (not name)
      const { accountType, firstName, lastName, email, password, confirmPassword } = signupData;

      const response = await axiosInstance.post(SIGNUP_API, {
        firstName,
        lastName,
        email,
        accountType,
        password,
        confirmPassword,
        otp,
      });

      if (!response.data.success) throw new Error(response.data.message);

      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
      navigate("/signup");
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    const toastId = toast.loading("Resending OTP...");
    try {
      const response = await axiosInstance.post(SENDOTP_API, {
        email: signupData?.email,
      });
      if (!response.data.success) throw new Error(response.data.message);
      toast.success("OTP resent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not resend OTP");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="min-h-screen bg-richblack-900 flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] flex flex-col gap-6">

        <div>
          <h1 className="text-richblack-5 font-bold text-2xl mb-2">Verify your email</h1>
          <p className="text-richblack-300 text-sm">
            A 6-digit OTP has been sent to{" "}
            <span className="text-yellow-50">{signupData?.email}</span>.
            Enter it below to verify your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-richblack-5">
              OTP <sup className="text-pink-200">*</sup>
            </span>
            <input
              required
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              className="w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-3 text-center text-xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-500 placeholder:tracking-normal"
            />
          </label>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 rounded-lg bg-yellow-50 text-richblack-900 font-bold hover:bg-yellow-100 transition disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <Link to="/signup" className="flex items-center gap-2 text-richblack-300 hover:text-richblack-5 transition">
            <BiArrowBack size={16} /> Back to Signup
          </Link>
          <button
            onClick={resendOTP}
            className="flex items-center gap-1.5 text-blue-200 hover:text-yellow-50 transition"
          >
            <RxCountdownTimer size={16} /> Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;