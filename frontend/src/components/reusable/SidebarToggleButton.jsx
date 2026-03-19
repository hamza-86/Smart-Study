import React from "react";
import { VscMenu } from "react-icons/vsc";

const SidebarToggleButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center justify-center rounded-md p-2 text-richblack-5 hover:bg-richblack-700"
    aria-label="Toggle dashboard menu"
  >
    <VscMenu size={20} />
  </button>
);

export default SidebarToggleButton;
