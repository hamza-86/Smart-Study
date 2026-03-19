/**
 * EmptyState Component
 * FILE: src/components/common/EmptyState.jsx
 *
 * Changes from original:
 *  - Styled for dark richblack theme (was light gray)
 *  - Added optional icon prop
 *  - Added optional description prop (subtitle under message)
 *  - Button styled with yellow-50 to match app theme
 */

import React from "react";
import { motion } from "framer-motion";
import { VscInbox } from "react-icons/vsc";

const EmptyState = ({
  message,
  description,
  actionLabel,
  onAction,
  Icon = VscInbox,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center px-4"
  >
    <div className="w-16 h-16 rounded-full bg-richblack-800 flex items-center justify-center mb-5">
      <Icon className="text-richblack-400" size={28} />
    </div>

    <h3 className="text-richblack-100 font-semibold text-lg mb-2">
      {message}
    </h3>

    {description && (
      <p className="text-richblack-400 text-sm mb-6 max-w-sm leading-relaxed">
        {description}
      </p>
    )}

    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-5 py-2.5 rounded-lg bg-yellow-50 text-richblack-900 font-semibold hover:bg-yellow-100 transition text-sm"
      >
        {actionLabel}
      </button>
    )}
  </motion.div>
);

export default EmptyState;