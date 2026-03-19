/**
 * ProfileField Component
 * FILE: src/components/common/ProfileField.jsx
 *
 * Changes from original:
 *  - Styled for dark richblack theme (was light gray)
 *  - Edit button styled to match app theme
 *  - Added divider between fields
 *  - Handles null/empty values gracefully
 */

import React from "react";
import { VscEdit } from "react-icons/vsc";

const ProfileField = ({ label, value, editable, onEdit }) => (
  <div className="flex items-center justify-between py-3 border-b border-richblack-700 last:border-0">
    <div className="flex-1">
      <p className="text-xs text-richblack-400 mb-0.5">{label}</p>
      <p className="text-richblack-100 text-sm">
        {value || <span className="text-richblack-500 italic">Not set</span>}
      </p>
    </div>
    {editable && (
      <button
        onClick={onEdit}
        className="ml-4 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-richblack-600 text-richblack-300 text-xs hover:bg-richblack-700 hover:text-richblack-100 transition shrink-0"
      >
        <VscEdit size={12} />
        Edit
      </button>
    )}
  </div>
);

export default ProfileField;