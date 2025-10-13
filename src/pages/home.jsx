import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Fetch doctors from Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      const snapshot = await getDocs(collection(db, "doctors"));
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDoctors(docs);
    };
    fetchDoctors();
  }, []);

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light text-dark min-vh-100"}>
     

      {/* ================= HERO SECTION ================= */}
      <section className="py-5 text-center container">
        <div className="row py-lg-5">
          <div className="col-lg-8 col-md-10 mx-auto">
            <h1 className="fw-bold mb-3">
              Your Health, Our Priority 💙
            </h1>
            <p className="lead">
              Welcome to <strong>HealthConnect</strong> — a modern healthcare platform that helps patients connect with experienced doctors quickly and easily.  
              Book appointments, view medical specialists, and manage your healthcare journey — all in one place.
            </p>
            <div className="mt-4">
              <Link to="/register" className="btn btn-primary me-3">
                <i className="bi bi-person-plus-fill me-1"></i> Get Started
              </Link>
              <Link to="/doctors" className="btn btn-outline-primary">
                <i className="bi bi-people-fill me-1"></i> Browse Doctors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DOCTOR LIST ================= */}
      <section className="container mb-5">
        <h3 className="mb-4 text-center">
          <i className="bi bi-person-heart me-2 text-primary"></i>
          Our Available Doctors
        </h3>
        <div className="row">
          {doctors.length === 0 ? (
            <p className="text-center">No doctors available yet.</p>
          ) : (
            doctors.map((doc) => (
              <div className="col-md-4 col-sm-6 mb-4" key={doc.id}>
                <div className={`card h-100 shadow-sm border-0 ${darkMode ? "bg-secondary text-light" : "bg-white text-dark"}`}>
                  <div className="card-body">
                    <h5 className="card-title">
                      <i className="bi bi-person-circle me-2 text-primary"></i>
                      {doc.name}
                    </h5>
                    <p className="card-text mb-1">
                      <strong>Specialty:</strong> {doc.specialty || "Not specified"}
                    </p>
                    <p className="card-text mb-1">
                      <strong>City:</strong> {doc.city || "N/A"}
                    </p>
                    <p className="card-text mb-1">
                      <strong>Hospital:</strong> {doc.hospital || "N/A"}
                    </p>
                    <p className="card-text">
                      <strong>Experience:</strong> {doc.experience || 0} years
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className={`${darkMode ? "bg-dark text-light" : "bg-primary text-white"} py-4`}>
        <div className="container text-center">
          <div className="row">
            <div className="col-md-4 mb-3">
              <h5><i className="bi bi-hospital-fill me-2"></i>HealthConnect</h5>
              <p className="small">
                Connecting patients with trusted healthcare professionals — anytime, anywhere.
              </p>
            </div>
            <div className="col-md-4 mb-3">
              <h5>Quick Links</h5>
              <ul className="list-unstyled small">
                <li><Link className="text-white text-decoration-none" to="/">Home</Link></li>
                <li><Link className="text-white text-decoration-none" to="/doctors">Doctors</Link></li>
                <li><Link className="text-white text-decoration-none" to="/register">Register</Link></li>
                <li><Link className="text-white text-decoration-none" to="/login">Login</Link></li>
              </ul>
            </div>
            <div className="col-md-4 mb-3">
              <h5>Contact Us</h5>
              <p className="small mb-1">
                <i className="bi bi-envelope-fill me-2"></i> support@healthconnect.com
              </p>
              <p className="small mb-1">
                <i className="bi bi-telephone-fill me-2"></i> +91 98765 43210
              </p>
              <p className="small">
                <i className="bi bi-geo-alt-fill me-2"></i> New Delhi, India
              </p>
            </div>
          </div>
          <hr className={darkMode ? "border-light" : "border-white"} />
          <p className="small mb-0">&copy; {new Date().getFullYear()} HealthConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
