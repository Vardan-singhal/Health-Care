// src/components/Navbar.jsx
import React, { useState } from "react";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Offcanvas,
  Form,
  Badge,
  Dropdown,
} from "react-bootstrap";
import {
  FaHome,
  FaCalendarAlt,
  FaEnvelope,
  FaFolderOpen,
  FaPills,
  FaCreditCard,
  FaUserCircle,
  FaBell,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";

export default function AppNavbar({ role, page }) {
  // role: 'patient' | 'doctor' | null
  // page: 'landing' | 'dashboard'
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showCanvas, setShowCanvas] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const toggleCanvas = () => setShowCanvas(!showCanvas);

  const renderLanding = () => (
    <>
      <Nav className="ms-auto d-flex align-items-center">
        <Button as={Link} to="/login" variant="outline-light" className="me-2">
          Login
        </Button>
        <Button as={Link} to="/register" variant="light" className="me-2">
          Register
        </Button>
        <Button variant="outline-light" onClick={toggleDarkMode}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </Button>
      </Nav>
    </>
  );

  const renderPatientNavbar = () => (
    <Nav className="ms-auto d-flex align-items-center">
      <Nav.Link as={Link} to="/patient" className="d-flex align-items-center me-2">
        <FaHome className="me-1" /> Dashboard
      </Nav.Link>

      <Dropdown className="me-2">
        <Dropdown.Toggle variant="light">
          <FaCalendarAlt className="me-1" /> Appointments
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/patient/appointments/manage">
            Book Appointment
          </Dropdown.Item>
          <Dropdown.Item as={Link} to="/patient/appointments/manage">
            Reschedule / Cancel
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Nav.Link as={Link} to="/patient/messages" className="me-2 d-flex align-items-center">
        <FaEnvelope className="me-1" />
        Messages 
      </Nav.Link>

      <Dropdown className="me-2">
        <Dropdown.Toggle variant="light">
          <FaFolderOpen className="me-1" /> Health Records
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/patient/records/labs">Lab Reports</Dropdown.Item>
          <Dropdown.Item as={Link} to="/patient/records/prescriptions">Prescriptions</Dropdown.Item>
          <Dropdown.Item as={Link} to="/patient/records/vaccination">Vaccination Records</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown className="me-2">
        <Dropdown.Toggle variant="light">
          <FaPills className="me-1" /> Medications
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/patient/medications/current">Current Medications</Dropdown.Item>
          <Dropdown.Item as={Link} to="/patient/medications/refill">Refill Request</Dropdown.Item>
          <Dropdown.Item as={Link} to="/patient/medications/reminder">Set Reminder</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown className="me-2">
        <Dropdown.Toggle variant="light">
          <FaCreditCard className="me-1" /> Billing
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/patient/billing/pay">Pay Now</Dropdown.Item>
          <Dropdown.Item as={Link} to="/patient/billing/invoices">Download Invoice</Dropdown.Item>
          <Dropdown.Item as={Link} to="/patient/billing/insurance">Insurance Info</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Nav.Link className="me-2" onClick={toggleDarkMode}>
        {darkMode ? <FaSun /> : <FaMoon />}
      </Nav.Link>

      <Dropdown align="end">
        <Dropdown.Toggle variant="light">
          <FaUserCircle />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/patient/profile">Profile</Dropdown.Item>
          <Dropdown.Item as={Link} to="/patient/settings">Settings</Dropdown.Item>
          <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Nav.Link className="ms-2 position-relative">
        <FaBell />
        <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle p-1 rounded-circle">
          3
        </Badge>
      </Nav.Link>
    </Nav>
  );

  const renderDoctorNavbar = () => (
    <Nav className="ms-auto d-flex align-items-center">
      <Nav.Link as={Link} to="/doctor" className="d-flex align-items-center me-2">
        <FaHome className="me-1" /> Dashboard
      </Nav.Link>

      <Dropdown className="me-2">
        <Dropdown.Toggle variant="light">
          <FaCalendarAlt className="me-1" /> Appointments
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/doctor/appointments/today">Today’s Appointments</Dropdown.Item>
          <Dropdown.Item as={Link} to="/doctor/appointments/upcoming">Upcoming Week</Dropdown.Item>
          <Dropdown.Item as={Link} to="/doctor/appointments/manage">Reschedule / Cancel</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown className="me-2">
        <Dropdown.Toggle variant="light">
          <FaUserCircle className="me-1" /> Patients
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/doctor/patients">All Patients</Dropdown.Item>
          <Dropdown.Item as={Link} to="/doctor/patients/search">Search Patient</Dropdown.Item>
          <Dropdown.Item as={Link} to="/doctor/patients/new">Add New Patient</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Nav.Link as={Link} to="/doctor/messages" className="me-2 d-flex align-items-center">
        <FaEnvelope className="me-1" /> Messages <Badge bg="danger" className="ms-1">5</Badge>
      </Nav.Link>

      <Dropdown className="me-2">
        <Dropdown.Toggle variant="light">
          <FaFolderOpen className="me-1" /> Reports
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/doctor/reports/labs">Lab Reports</Dropdown.Item>
          <Dropdown.Item as={Link} to="/doctor/reports/scans">Scans / Imaging</Dropdown.Item>
          <Dropdown.Item as={Link} to="/doctor/reports/prescriptions">Prescriptions</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown className="me-2">
        <Dropdown.Toggle variant="light">
          <FaPills className="me-1" /> Prescriptions
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/doctor/prescriptions/create">Create Prescription</Dropdown.Item>
          <Dropdown.Item as={Link} to="/doctor/prescriptions/past">Past Prescriptions</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Nav.Link className="me-2" onClick={toggleDarkMode}>
        {darkMode ? <FaSun /> : <FaMoon />}
      </Nav.Link>

      <Dropdown align="end">
        <Dropdown.Toggle variant="light">
          <FaUserCircle />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/doctor/profile">Profile</Dropdown.Item>
          <Dropdown.Item as={Link} to="/doctor/settings">Settings</Dropdown.Item>
          <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Nav.Link className="ms-2 position-relative">
        <FaBell />
        <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle p-1 rounded-circle">
          4
        </Badge>
      </Nav.Link>
    </Nav>
  );

  return (
    <Navbar
      bg={darkMode ? "dark" : "primary"}
      variant={darkMode ? "dark" : "dark"}
      expand="lg"
      className="mb-4"
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          Healthcare App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={toggleCanvas} />
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
          show={showCanvas}
          onHide={toggleCanvas}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasNavbarLabel">
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {page === "landing" && renderLanding()}
            {role === "patient" && page === "dashboard" && renderPatientNavbar()}
            {role === "doctor" && page === "dashboard" && renderDoctorNavbar()}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
        {/* <div className="d-none d-lg-flex"> */}
          {/* {page === "landing" && renderLanding()} */}
          {/* {role === "patient" && page === "dashboard" && renderPatientNavbar()}
          {role === "doctor" && page === "dashboard" && renderDoctorNavbar()} */}
        {/* </div> */}
      </Container>
    </Navbar>
  );
}
