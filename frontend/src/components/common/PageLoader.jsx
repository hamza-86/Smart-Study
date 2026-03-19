/**
 * PageLoader Component
 * FILE: src/components/common/PageLoader.jsx
 *
 * Full-screen loading spinner shown during lazy page loads
 */

import React from "react";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-richblack-900">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning ring */}
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-richblack-700" />
          <div
            className="absolute inset-0 rounded-full border-4 border-t-yellow-50 animate-spin"
            style={{ animationDuration: "0.8s" }}
          />
        </div>
        <p className="text-sm text-richblack-300 tracking-widest uppercase animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}