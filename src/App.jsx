// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Landing from "./pages/landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
// import Footer from "./components/Footer";
import AppLayout from "./layouts/applayout";

// PrivateRoute for protecting dashboard routes
function PrivateRoute({ children, role }) {
  const userRole = useSelector(state => state.auth.role);
  if (!userRole) return <Navigate to="/login" />;
  if (role && userRole !== role) return <Navigate to="/" />;
  return children;
}

function App() {
  const { role } = useSelector(state => state.auth);

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <AppLayout page="landing">
              <Landing />
            </AppLayout>
          }
        />

        <Route
          path="/landing"
          element={
            <AppLayout page="landing">
              <Landing />
            </AppLayout>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient Dashboard */}
        <Route
          path="/patient/*"
          element={
            <PrivateRoute role="patient">
              <AppLayout role="patient" page="dashboard">
                <PatientDashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Doctor Dashboard */}
        <Route
          path="/doctor/*"
          element={
            <PrivateRoute role="doctor">
              <AppLayout role="doctor" page="dashboard">
                <DoctorDashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      {/* <Footer darkMode={darkMode} /> */}
      </Routes>
    </Router>
  );
}

export default App;
