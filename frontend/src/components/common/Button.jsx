/**
 * Button Component
 * FILE: src/components/common/Button.jsx
 *
 * Changes from original:
 *  - Styled to match richblack dark theme (was light blue)
 *  - Added variant prop: "primary" | "secondary" | "danger" | "ghost"
 *  - Added size prop: "sm" | "md" | "lg"
 *  - Added loading state with spinner
 *  - Added disabled styling
 */

import React from "react";

const variants = {
  primary:   "bg-yellow-50 text-richblack-900 hover:bg-yellow-100",
  secondary: "bg-richblack-700 text-richblack-100 border border-richblack-600 hover:bg-richblack-600",
  danger:    "bg-pink-700 text-white hover:bg-pink-600",
  ghost:     "bg-transparent text-richblack-300 border border-richblack-600 hover:bg-richblack-800",
};

const sizes = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3",
};

const Button = ({
  children,
  onClick,
  type      = "button",
  variant   = "primary",
  size      = "md",
  loading   = false,
  disabled  = false,
  className = "",
  ...props
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center gap-2 rounded-lg font-semibold
      transition-all duration-200
      ${variants[variant] || variants.primary}
      ${sizes[size] || sizes.md}
      ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      ${className}
    `}
    {...props}
  >
    {loading && (
      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
    )}
    {children}
  </button>
);

export default Button;