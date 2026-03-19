import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BiArrowBack } from "react-icons/bi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useForgotPassword, useResetPassword } from "../hooks";

const inputClass =
  "w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-400 transition";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const forgotMutation = useForgotPassword();
  const resetMutation = useResetPassword();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const result = await forgotMutation.mutateAsync({ email });
      if (result?.success) {
        setStep(2);
      }
    } catch {
      // handled by mutation onError toast
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      const result = await resetMutation.mutateAsync({
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      if (result?.success) {
        navigate("/login");
      }
    } catch {
      // handled by mutation onError toast
    }
  };

  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const passwordInvalid =
    newPassword.length > 0 && !passwordRule.test(newPassword);

  return (
    <div className="min-h-screen bg-richblack-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px]"
      >
        {step === 1 ? (
          <>
            <h1 className="text-richblack-5 font-bold text-2xl mb-2">Forgot Password?</h1>
            <p className="text-richblack-300 text-sm mb-8 leading-relaxed">
              Enter your account email. We will send a 6-digit OTP valid for 10 minutes.
            </p>

            <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-richblack-5">Email Address</span>
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
                disabled={forgotMutation.isPending}
                className="w-full py-3 rounded-lg bg-yellow-50 text-richblack-900 font-bold hover:bg-yellow-100 transition disabled:opacity-60"
              >
                {forgotMutation.isPending ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-richblack-5 font-bold text-2xl mb-2">Reset Password</h1>
            <p className="text-richblack-300 text-sm mb-8 leading-relaxed">
              Enter the OTP sent to <span className="text-yellow-50">{email}</span> and set your new password.
            </p>

            <form onSubmit={handleReset} className="flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-richblack-5">OTP</span>
                <input
                  required
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-richblack-5">New Password</span>
                <div className="relative">
                  <input
                    required
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`${inputClass} pr-10 ${passwordInvalid ? "border-pink-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-300"
                    aria-label="Toggle new password visibility"
                  >
                    {showNewPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                </div>
                {passwordInvalid && (
                  <p className="text-pink-400 text-xs">
                    Use 8+ chars with uppercase, lowercase, number, and special character.
                  </p>
                )}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-richblack-5">Confirm Password</span>
                <div className="relative">
                  <input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`${inputClass} pr-10 ${passwordMismatch ? "border-pink-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-300"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                </div>
                {passwordMismatch && <p className="text-pink-400 text-xs">Passwords do not match</p>}
              </label>

              <button
                type="submit"
                disabled={passwordMismatch || passwordInvalid || resetMutation.isPending}
                className="w-full py-3 rounded-lg bg-yellow-50 text-richblack-900 font-bold hover:bg-yellow-100 transition disabled:opacity-60"
              >
                {resetMutation.isPending ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  void handleSendOtp(e);
                }}
                disabled={forgotMutation.isPending}
                className="text-blue-200 text-sm hover:text-yellow-50"
              >
                {forgotMutation.isPending ? "Resending..." : "Resend OTP"}
              </button>
            </form>
          </>
        )}

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

export default ForgotPassword;
