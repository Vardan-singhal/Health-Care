import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/home"; // ✅ Added Home page
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorList from "./pages/DoctorList";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorDetails from "./pages/DoctorDetails";
import Appointments from "./pages/Appointments";
import Messages from "./pages/Messages";
import PrivateRoute from "./routes/PrivateRoute";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setAuthSuccess, logout } from "./features/authSlice";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Bootstrap styles
import "bootstrap-icons/font/bootstrap-icons.css"; // ✅ Icons support

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        const user = {
          uid: u.uid,
          email: u.email,
          name: u.displayName || u.email,
          role: "patient",
        };
        dispatch(setAuthSuccess({ user, token: u.accessToken, role: user.role }));
      } else {
        dispatch(logout());
      }
    });
    return () => unsub();
  }, [dispatch]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* ✅ Added Home Route */}
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/doctors/:id" element={<DoctorDetails />} />

          <Route
            path="/patient"
            element={
              <PrivateRoute role="patient">
                <PatientDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <PrivateRoute role="doctor">
                <DoctorDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <PrivateRoute>
                <Appointments />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
