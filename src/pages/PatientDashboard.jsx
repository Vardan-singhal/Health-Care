// src/pages/PatientDashboard.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, InputGroup, Nav, Tab, Table, Badge, Modal, Spinner } from "react-bootstrap";
import { FaSearch, FaBell, FaUser, FaFileDownload, FaPrescriptionBottle, FaEnvelope, FaCalendarAlt, FaHeartbeat } from "react-icons/fa";
import DoctorCard from "../components/DoctorCard";
import { db } from "../api/firebase";
import { collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import { useSelector } from "react-redux";

export default function PatientDashboard() {
  const { user } = useSelector(state => state.auth);
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "doctor"));
        const snap = await getDocs(q);
        const doctorList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDoctors(doctorList);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      try {
        const q = query(
          collection(db, "appointments"),
          where("patientId", "==", user.uid),
          orderBy("date", "asc")
        );
        const snap = await getDocs(q);
        const apptList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAppointments(apptList);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoadingAppointments(false);
      }
    };
    fetchAppointments();
  }, [user.uid]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const q = query(
          collection(db, "messages"),
          where("patientId", "==", user.uid),
          orderBy("time", "desc")
        );
        const snap = await getDocs(q);
        const msgList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgList);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [user.uid]);

  // Open book appointment modal
  const handleBookAppointment = (doctor = null) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  // Confirm booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    const dateTime = e.target.elements.datetime.value;
    if (!dateTime) return alert("Select date and time");
    if (!selectedDoctor) return alert("Select a doctor");

    try {
      await addDoc(collection(db, "appointments"), {
        patientId: user.uid,
        patientName: user.name || "Patient",
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: new Date(dateTime),
        time: new Date(dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Booked",
        createdAt: new Date()
      });
      alert("Appointment booked successfully!");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to book appointment");
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
    doc.hospital.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container fluid className="p-3">
      {/* Header */}
      <Row className="align-items-center mb-4">
        <Col md={4}><h2>Welcome Back!</h2></Col>
        <Col md={4}>
          <InputGroup>
            <Form.Control
              placeholder="Search doctors, prescriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroup.Text><FaSearch /></InputGroup.Text>
          </InputGroup>
        </Col>
        <Col md={4} className="text-end">
          <Button variant="light" className="me-2"><FaBell /></Button>
          <Button variant="light"><FaUser /></Button>
        </Col>
      </Row>

      {/* Main Sections */}
      <Row className="mb-4">
        {/* Medical Summary */}
        <Col lg={4} md={6} className="mb-3">
          <Card className="p-3 h-100">
            <Card.Title><FaHeartbeat className="me-2" /> Medical Summary</Card.Title>
            <Card.Text>
              <strong>Vitals:</strong> BP: 120/80, Sugar: 90 mg/dL, Heart Rate: 72 bpm<br />
              <strong>Recent Lab:</strong> Blood Test - Normal<br />
              <strong>Allergies:</strong> None
            </Card.Text>
            <Button variant="primary" className="me-2"><FaFileDownload /> Download Report</Button>
            <Button variant="secondary">View Full History</Button>
          </Card>
        </Col>

        {/* Appointments */}
        <Col lg={4} md={6} className="mb-3">
          <Card className="p-3 h-100">
            <Card.Title><FaCalendarAlt className="me-2" /> Appointments</Card.Title>
            {loadingAppointments ? (
              <Spinner animation="border" />
            ) : appointments.length ? (
              <Card.Text>
                <strong>Next:</strong> {appointments[0].doctorName} - {appointments[0].date.toDateString()} {appointments[0].time}<br />
                <strong>Past:</strong> {appointments.length > 1 ? appointments[1].doctorName + " - " + appointments[1].date.toDateString() : "No past appointments"}
              </Card.Text>
            ) : (
              <Card.Text>No appointments yet.</Card.Text>
            )}
            <Button variant="success" className="me-2" onClick={() => handleBookAppointment()}>Book Appointment</Button>
            <Button variant="warning" className="me-2">Cancel / Reschedule</Button>
            <Button variant="secondary">View Prescription</Button>
          </Card>
        </Col>

        {/* Medications */}
        <Col lg={4} md={12} className="mb-3">
          <Card className="p-3 h-100">
            <Card.Title><FaPrescriptionBottle className="me-2" /> Medications</Card.Title>
            <Card.Text>
              <strong>Current:</strong> Aspirin 75mg - 1x/day<br />
              <strong>Past:</strong> Metformin 500mg - Completed
            </Card.Text>
            <Button variant="primary" className="me-2">Request Refill</Button>
            <Button variant="secondary" className="me-2"><FaFileDownload /> Download Prescription</Button>
            <Button variant="warning">Set Reminder</Button>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tab.Container defaultActiveKey="messages">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="messages"><FaEnvelope className="me-2" /> Messages</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="reports"><FaFileDownload className="me-2" /> Health Reports</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="billing"><FaCalendarAlt className="me-2" /> Billing / Insurance</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Messages */}
          <Tab.Pane eventKey="messages">
            <Card className="p-3 mb-3">
              <Card.Title>Inbox</Card.Title>
              {loadingMessages ? (
                <Spinner animation="border" />
              ) : messages.length ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(msg => (
                      <tr key={msg.id}>
                        <td>{msg.fromName}</td>
                        <td>{msg.text}</td>
                        <td><Badge bg={msg.read ? "success" : "warning"}>{msg.read ? "Read" : "Unread"}</Badge></td>
                        <td><Button size="sm">View Conversation</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : <p>No messages found</p>}
            </Card>
          </Tab.Pane>

          {/* Reports */}
          <Tab.Pane eventKey="reports">
            <Card className="p-3 mb-3">
              <Card.Title>Lab Reports / Documents</Card.Title>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Report</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Blood Test</td>
                    <td>10 Oct 2025</td>
                    <td>
                      <Button size="sm" className="me-2"><FaFileDownload /> Download</Button>
                      <Button size="sm">Share with Doctor</Button>
                    </td>
                  </tr>
                  <tr>
                    <td>X-Ray</td>
                    <td>05 Oct 2025</td>
                    <td>
                      <Button size="sm" className="me-2"><FaFileDownload /> Download</Button>
                      <Button size="sm">Share with Doctor</Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Tab.Pane>

          {/* Billing */}
          <Tab.Pane eventKey="billing">
            <Card className="p-3 mb-3">
              <Card.Title>Billing / Insurance</Card.Title>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Consultation Fee</td>
                    <td>10 Oct 2025</td>
                    <td><Badge bg="success">Paid</Badge></td>
                    <td><Button size="sm">Download Invoice</Button></td>
                  </tr>
                  <tr>
                    <td>Lab Test</td>
                    <td>05 Oct 2025</td>
                    <td><Badge bg="warning">Pending</Badge></td>
                    <td><Button size="sm">Pay Now</Button></td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Find a Doctor */}
      <h2 className="mb-4 mt-5">Find a Doctor</h2>
      <Row>
        {filteredDoctors.map(doc => (
          <Col md={4} key={doc.id} className="mb-3">
            <DoctorCard doctor={doc} onBook={() => handleBookAppointment(doc)} />
          </Col>
        ))}
      </Row>

      {/* Book Appointment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor ? (
            <>
              <p>Booking appointment with <strong>{selectedDoctor.name}</strong> ({selectedDoctor.specialty})</p>
              <Form onSubmit={handleConfirmBooking}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Date & Time</Form.Label>
                  <Form.Control type="datetime-local" name="datetime" required />
                </Form.Group>
                <Button variant="primary" type="submit">Confirm Booking</Button>
              </Form>
            </>
          ) : (
            <p>Please select a doctor first.</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
