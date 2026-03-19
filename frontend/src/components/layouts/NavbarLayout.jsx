/**
 * NavbarLayout
 * FILE: src/components/layout/NavbarLayout.jsx
 * No changes needed from original.
 */

import React from "react";
import Navbar from "../Navbar";

const NavbarLayout = ({ children }) => (
  <div>
    <Navbar />
    <main>{children}</main>
  </div>
);

export default NavbarLayout;