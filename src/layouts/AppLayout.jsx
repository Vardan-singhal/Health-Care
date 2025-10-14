// src/layouts/AppLayout.jsx
import React from "react";
import AppNavbar from "../components/Navbar";

export default function AppLayout({ children, role, page }) {
  return (
    <>
      {/* Navbar receives role (patient/doctor) and page (landing/dashboard) */}
      <AppNavbar role={role} page={page} />
      <main>{children}</main>
    </>
  );
}
