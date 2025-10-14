// src/pages/Login.jsx
import React, { useState } from "react";
import { Container, Form, Button, Card, Row, Col, InputGroup } from "react-bootstrap";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../api/firebase"; // Firebase auth & firestore
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        throw new Error("User data not found in database!");
      }

      const userData = userSnapshot.data();
      const role = userData.role || "patient"; // default to patient if role missing

      // Dispatch Redux state
      dispatch(setUser({ user: { email: user.email, uid: user.uid }, role }));

      // Navigate based on role
      if (role === "patient") navigate("/patient");
      else navigate("/doctor");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={6} lg={4}>
          <Card className="p-4 shadow-sm">
            <h3 className="mb-4 text-center">Login</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <Form onSubmit={handleLogin}>
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

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Button type="submit" className="w-50" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                <Button variant="link" onClick={handleForgotPassword}>
                  Forgot Password?
                </Button>
              </div>
            </Form>

            {/* Register Link */}
            <div className="text-center mt-3">
              <span>Don't have an account? </span>
              <Link to="/register">Register</Link>
            </div>

          </Card>
        </Col>
      </Row>
    </Container>
  );
}
