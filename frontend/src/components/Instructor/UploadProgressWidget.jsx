import React, { useMemo } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";

const formatSpeed = (bytesPerSec) => {
  if (!bytesPerSec || bytesPerSec <= 0) return "--";
  if (bytesPerSec > 1024 * 1024) return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
};

const ringStyle = (progress) => ({
  background: `conic-gradient(#F2E94E ${Math.max(0, Math.min(100, progress))}%, #424854 0%)`,
});

const UploadProgressWidget = ({ uploadState, panelOpen, onTogglePanel, onClosePanel }) => {
  const percent = uploadState?.progress || 0;
  const busy = uploadState?.status === "uploading";
  const statusText = uploadState?.status || "idle";
  const speed = useMemo(() => formatSpeed(uploadState?.speedBps), [uploadState?.speedBps]);

  if (!uploadState || statusText === "idle") return null;

  return (
    <>
      <button
        type="button"
        onClick={onTogglePanel}
        className="fixed right-5 top-24 z-40 flex items-center gap-2 rounded-full border border-richblack-600 bg-richblack-800 px-3 py-2 shadow-lg hover:border-yellow-50"
      >
        <span className="relative grid h-8 w-8 place-items-center rounded-full p-[2px]" style={ringStyle(percent)}>
          <span className="grid h-full w-full place-items-center rounded-full bg-richblack-900 text-[10px] font-semibold text-richblack-50">
            {Math.round(percent)}%
          </span>
        </span>
        <FiUploadCloud className={`${busy ? "text-yellow-50" : "text-caribbeangreen-300"}`} />
      </button>

      {panelOpen ? (
        <div className="fixed right-5 top-36 z-40 w-80 rounded-xl border border-richblack-600 bg-richblack-800 p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-richblack-50">Upload Panel</p>
            <button
              type="button"
              onClick={onClosePanel}
              className="rounded p-1 text-richblack-300 hover:bg-richblack-700"
            >
              <FiX size={14} />
            </button>
          </div>
          <p className="truncate text-xs text-richblack-300">{uploadState?.fileName || "Preparing..."}</p>
          <div className="mt-3 h-2 w-full rounded-full bg-richblack-700">
            <div
              className="h-2 rounded-full bg-yellow-50 transition-all"
              style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
            />
          </div>
          <div className="mt-3 space-y-1 text-xs text-richblack-300">
            <p>Status: {statusText}</p>
            <p>Progress: {Math.round(percent)}%</p>
            <p>Speed: {speed}</p>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default UploadProgressWidget;

