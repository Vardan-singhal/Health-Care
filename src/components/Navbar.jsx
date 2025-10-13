import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useSelector } from "react-redux";

export default function AppNavbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user); // fetch role from Redux

  // Track login status
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("bg-dark", "text-light");
    } else {
      document.body.classList.remove("bg-dark", "text-light");
    }
  }, [darkMode]);

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <Navbar
      expand="lg"
      bg={darkMode ? "dark" : "light"}
      variant={darkMode ? "dark" : "light"}
      className="shadow-sm py-3"
      sticky="top"
    >
      <Container>
        {/* Brand Logo */}
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
          <i className="bi bi-heart-pulse-fill text-danger me-2"></i>
          HealthCare+
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            {user && (
              <>
                <Nav.Link as={Link} to="/appointments">
                  Appointments
                </Nav.Link>
                <Nav.Link as={Link} to="/messages">
                  Messages
                </Nav.Link>
              </>
            )}
          </Nav>

          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Dark Mode Toggle */}
            <Button
              variant={darkMode ? "outline-light" : "outline-dark"}
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle dark mode"
            >
              <i className={`bi ${darkMode ? "bi-brightness-high-fill" : "bi-moon-fill"}`}></i>
            </Button>

            {/* Auth Section */}
            {!user ? (
              <>
                <Button as={Link} to="/login" variant="outline-primary" size="sm">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Button>
                <Button as={Link} to="/register" variant="primary" size="sm">
                  <i className="bi bi-person-plus-fill me-1"></i> Register
                </Button>
              </>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant={darkMode ? "outline-light" : "outline-secondary"}
                  size="sm"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user.displayName || user.email}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    as={Link}
                    to={
                      authUser?.role === "doctor"
                        ? "/doctor"
                        : authUser?.role === "patient"
                        ? "/patient"
                        : "/"
                    }
                  >
                    <i className="bi bi-speedometer2 me-2"></i> Dashboard
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
