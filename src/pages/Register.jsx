// src/pages/Register.jsx
import React, { useState } from "react";
import { Container, Form, Button, Card, InputGroup } from "react-bootstrap";
import { 
  FaLock, FaUser, FaHospital, FaCity, FaBriefcase, 
  FaStethoscope, FaEnvelope, FaEyeSlash, FaEye, FaPhone 
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../api/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); // Added phone state
  const [role, setRole] = useState("patient");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [hospital, setHospital] = useState("");
  const [city, setCity] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const specialties = [
    "Cardiologist", "Dermatologist", "Neurologist", "Pediatrics", "Gynecologist",
    "Orthopedics", "Psychiatrist", "Radiologist", "ENT", "Ophthalmologist",
    "Urologist", "Gastroenterologist", "Endocrinologist", "Nephrologist", "Oncologist"
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Build user data (common for all)
      const userData = {
        uid: user.uid,
        name,
        email,
        phone, // include phone
        role,
        createdAt: new Date(),
      };

      // Add extra info if doctor
      if (role === "doctor") {
        userData.specialty = specialty;
        userData.experience = experience;
        userData.hospital = hospital;
        userData.city = city;
      }

      // Store in main unified collection
      await setDoc(doc(db, "users", user.uid), userData);

      // Store in role-specific collection as well
      if (role === "doctor") {
        await setDoc(doc(db, "doctors", user.uid), {
          ...userData,
          patients: [], // initialize empty list
        });
      } else if (role === "patient") {
        await setDoc(doc(db, "patients", user.uid), {
          ...userData,
          medicalHistory: [],
          appointments: [],
        });
      }

      // Update Redux state
      dispatch(setUser({ user: { email: user.email, uid: user.uid }, role }));

      // Redirect based on role
      navigate(role === "patient" ? "/patient" : "/doctor");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" 
      style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <Card style={{ width: "100%", maxWidth: "500px" }} className="p-4 shadow-sm">
        <h3 className="mb-4 text-center">Register</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <Form onSubmit={handleRegister}>
          {/* Name */}
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <InputGroup>
              <InputGroup.Text><FaUser /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          {/* Phone */}
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <InputGroup>
              <InputGroup.Text><FaPhone /></InputGroup.Text>
              <Form.Control
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <InputGroup>
              <InputGroup.Text><FaEnvelope /></InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <InputGroup.Text><FaLock /></InputGroup.Text>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </Button>
            </InputGroup>
          </Form.Group>

          {/* Role */}
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </Form.Select>
          </Form.Group>

          {/* Doctor-specific fields */}
          {role === "doctor" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Specialty</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaStethoscope /></InputGroup.Text>
                  <Form.Select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                  >
                    <option value="">Select Specialty</option>
                    {specialties.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Experience (years)</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaBriefcase /></InputGroup.Text>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="Enter years of experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Hospital / Clinic</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaHospital /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Enter hospital or clinic name"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    required
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaCity /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </InputGroup>
              </Form.Group>
            </>
          )}

          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
