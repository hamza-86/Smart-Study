/**
 * Error Page
 * FILE: src/pages/Error.jsx
 * No changes needed — kept as-is with minor styling improvement.
 */

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Error = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center min-h-screen bg-richblack-900 text-white gap-4"
  >
    <h1 className="text-8xl font-bold text-yellow-50">404</h1>
    <p className="text-richblack-300 text-xl">Page not found</p>
    <Link
      to="/"
      className="mt-4 px-6 py-3 rounded-lg bg-yellow-50 text-richblack-900 font-semibold hover:bg-yellow-100 transition"
    >
      Back to Home
    </Link>
  </motion.div>
);

export default Error;