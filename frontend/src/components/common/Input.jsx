/**
 * Input Component
 * FILE: src/components/common/Input.jsx
 *
 * Changes from original:
 *  - Styled for dark richblack theme (was light gray border)
 *  - Added error prop for red border + error message display
 *  - Added required prop
 *  - Added leftIcon / rightIcon support
 *  - Consistent with inputClass used in page files
 */

import React from "react";

const Input = ({
  label,
  type        = "text",
  value,
  onChange,
  placeholder = "",
  required    = false,
  error       = null,
  leftIcon    = null,
  rightIcon   = null,
  className   = "",
  ...props
}) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-medium text-richblack-5">
        {label} {required && <sup className="text-pink-200">*</sup>}
      </label>
    )}
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400">
          {leftIcon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full border bg-richblack-700 text-richblack-100 rounded-lg px-4 py-2.5
          focus:outline-none focus:ring-2 placeholder:text-richblack-400 transition
          ${leftIcon  ? "pl-10" : ""}
          ${rightIcon ? "pr-10" : ""}
          ${error
            ? "border-pink-500 focus:ring-pink-500"
            : "border-richblack-600 focus:ring-yellow-50"
          }
          ${className}
        `}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400">
          {rightIcon}
        </span>
      )}
    </div>
    {error && (
      <p className="text-pink-400 text-xs">{error}</p>
    )}
  </div>
);

export default Input;