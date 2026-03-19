/**
 * Modal Component
 * FILE: src/components/common/Modal.jsx
 *
 * Changes from original:
 *  - Styled for dark richblack theme (was white background)
 *  - Added fade + scale animation via framer-motion
 *  - Clicking backdrop closes modal
 *  - Added title and footer slot props
 *  - Added size prop: "sm" | "md" | "lg"
 *  - Added preventClose prop to disable backdrop click
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size          = "md",
  preventClose  = false,
}) => {
  const handleBackdrop = () => {
    if (!preventClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={handleBackdrop}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className={`
              relative w-full ${sizes[size] || sizes.md}
              bg-richblack-800 border border-richblack-700
              rounded-2xl shadow-2xl overflow-hidden
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || !preventClose) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-richblack-700">
                {title && (
                  <h3 className="text-richblack-5 font-semibold text-lg">{title}</h3>
                )}
                {!preventClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto text-richblack-400 hover:text-richblack-100 transition p-1 rounded-lg hover:bg-richblack-700"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-richblack-700 flex justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;