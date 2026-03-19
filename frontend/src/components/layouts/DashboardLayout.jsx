/**
 * DashboardLayout
 * FILE: src/components/layout/DashboardLayout.jsx
 *
 * Changes from original:
 *  - Background changed from bg-gray-50 (light) to bg-richblack-900 (dark)
 *  - Added padding-top so content clears the fixed Navbar
 */

import React from "react";
import Sidebar from "../Sidebar";

const DashboardLayout = ({ children }) => (
  <div className="flex min-h-screen bg-richblack-900">
    <Sidebar />
    <div className="flex-1 pt-16 overflow-y-auto">
      {children}
    </div>
  </div>
);

export default DashboardLayout;