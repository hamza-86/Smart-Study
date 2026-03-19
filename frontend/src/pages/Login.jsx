import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { motion } from "framer-motion";
import signupImage from "../assets/signupImage.png";
import { useLogin } from "../hooks";

const inputClass =
  "w-full border border-richblack-600 bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-50 placeholder:text-richblack-400 transition";

const Login = () => {
  const navigate = useNavigate();
  const { mutateAsync: doLogin, isPending } = useLogin();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await doLogin({ email: formData.email, password: formData.password });
      if (result?.success) {
        navigate("/dashboard");
      }
    } catch {
      // handled by useLogin onError toast
    }
  };

  return (
    <div className="min-h-screen bg-richblack-900 flex items-center justify-center px-4 py-24 lg:py-10 flex-col-reverse lg:flex-row gap-10">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]"
      >
        <h1 className="text-richblack-5 text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-richblack-300 text-sm mb-8">
          Discover your passions. <span className="italic text-blue-100 font-semibold">Be Unstoppable.</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-richblack-5">
              Email Address <sup className="text-pink-200">*</sup>
            </span>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-richblack-5">
                Password <sup className="text-pink-200">*</sup>
              </span>
              <Link
                to="/forgot-password"
                className="text-xs text-blue-200 hover:text-yellow-50 transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-yellow-50 transition"
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-lg bg-yellow-50 text-richblack-900 font-bold hover:bg-yellow-100 transition disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-richblack-300 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-yellow-50 font-medium hover:underline">
              Sign up for free
            </Link>
          </p>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img src={signupImage} alt="Login" className="w-full max-w-[520px]" />
      </motion.div>
    </div>
  );
};

export default Login;
