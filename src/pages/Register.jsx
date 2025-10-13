import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState('');
  const [experience, setExperience] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      // Save basic user details
      await addDoc(collection(db, 'users'), {
        uid: cred.user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      });

      // If doctor, save doctor-specific details
      if (role === 'doctor') {
        await addDoc(collection(db, 'doctors'), {
          uid: cred.user.uid,
          name,
          email,
          hospital: hospital || 'Not specified',
          city: city || 'Not specified',
          experience: experience || 0,
          specialty: specialty || 'Not specified',
        });
      }

      nav('/doctors');
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-sm p-4" style={{ maxWidth: 420, width: '100%' }}>
        <h3 className="text-center mb-4">Register</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handle}>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-person-fill"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}></i>
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {/* Doctor Fields */}
          {role === 'doctor' && (
            <>
              {/* Specialty */}
              <div className="mb-3">
                <label className="form-label">Specialty</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-heart-pulse-fill"></i></span>
                  <select
                    className="form-select"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    required
                  >
                    <option value="">Select Specialty</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="ENT">ENT</option>
                    <option value="Dentist">Dentist</option>
                  </select>
                </div>
              </div>

              {/* Hospital */}
              <div className="mb-3">
                <label className="form-label">Hospital</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-building"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter hospital name"
                    value={hospital}
                    onChange={e => setHospital(e.target.value)}
                  />
                </div>
              </div>

              {/* City */}
              <div className="mb-3">
                <label className="form-label">City</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-geo-alt-fill"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter city"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="mb-3">
                <label className="form-label">Experience (in years)</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-briefcase-fill"></i></span>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter experience"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-primary">Register</button>
          </div>

          <div className="text-center">
            <span>Already have an account? </span>
            <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
