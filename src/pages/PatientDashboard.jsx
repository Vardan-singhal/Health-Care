// src/pages/PatientDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Nav,
  Tab,
  Table,
  Badge,
  Modal,
  Spinner,
  FormControl,
} from "react-bootstrap";
import {
  FaSearch,
  FaBell,
  FaUser,
  FaFileDownload,
  FaPrescriptionBottle,
  FaEnvelope,
  FaCalendarAlt,
  FaHeartbeat,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import { db } from "../api/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useSelector } from "react-redux";

export default function PatientDashboard() {
  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [patientName, setPatientName] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleOpenMessageModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMessageModal(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return alert("Please enter a message");
    if (!selectedAppointment) return;

    try {
      await addDoc(collection(db, "messages"), {
        patientId: user.uid,
        doctorId: selectedAppointment.doctorId,
        patientName: patientName,
        doctorName: selectedAppointment.doctorName,
        text: messageText.trim(),
        time: serverTimestamp(), // use serverTimestamp for proper ordering
        read: false,
        fromDoctor: false,
      });

      alert("Message sent successfully!");
      setMessageText("");
      setShowMessageModal(false);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Try again later.");
    }
  };

  // Convert Firestore Timestamp to JS Date
  const toJSDate = (date) => {
    if (!date) return null;
    if (date.seconds) return new Date(date.seconds * 1000);
    if (date instanceof Date) return date;
    return new Date(date);
  };

  // Fetch patient name
  useEffect(() => {
    const fetchPatientName = async () => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPatientName(docSnap.data().name || "");
      }
    };
    fetchPatientName();
  }, [user]);

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "doctor"));
        const snap = await getDocs(q);
        const doctorList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDoctors(doctorList);
        setFilteredDoctors(doctorList);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  // Filter doctors based on search
  useEffect(() => {
    const queryStr = search.toLowerCase();
    const filtered = doctors.filter(
      (doc) =>
        (doc.name && doc.name.toLowerCase().includes(queryStr)) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(queryStr)) ||
        (doc.hospital && doc.hospital.toLowerCase().includes(queryStr)) ||
        (doc.city && doc.city.toLowerCase().includes(queryStr))
    );
    setFilteredDoctors(filtered);
  }, [search, doctors]);

  // Real-time Fetch of Approved Appointments
  useEffect(() => {
    if (!user?.uid) return;
    setLoadingAppointments(true);

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid),
      where("status", "==", "Approved"),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const approvedList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(approvedList);
        setLoadingAppointments(false);
      },
      (error) => {
        console.error("Error fetching appointments:", error);
        setLoadingAppointments(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // ✅ Real-time messages synchronization
  useEffect(() => {
    if (!user?.uid) return;
    setLoadingMessages(true);

    const q = query(
      collection(db, "messages"),
      where("patientId", "==", user.uid),
      orderBy("time", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Mark unread messages from doctor as read
        msgList.forEach(async (msg) => {
          if (msg.fromDoctor && !msg.read) {
            const msgRef = doc(db, "messages", msg.id);
            await updateDoc(msgRef, { read: true });
          }
        });

        setMessages(msgList);
        setLoadingMessages(false);
      },
      (err) => {
        console.error("Error fetching messages:", err);
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  // Book appointment modal
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
        time: new Date(dateTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "Booked",
        createdAt: new Date(),
      });
      alert("Appointment booked successfully!");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to book appointment");
    }
  };

  return (
    <Container fluid className="p-3">
      {/* Header */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="text-center">
            Welcome Back{patientName ? `, ${patientName}` : ""}!
          </h2>
        </Col>
      </Row>

      {/* Main Sections */}
      <Row className="mb-4">
        {/* Medical Summary */}
        <Col lg={4} md={6} className="mb-3">
          <Card className="p-3 h-100">
            <Card.Title>
              <FaHeartbeat className="me-2" /> Medical Summary
            </Card.Title>
            <Card.Text>
              <strong>Vitals:</strong> BP: 120/80, Sugar: 90 mg/dL, Heart Rate: 72 bpm
              <br />
              <strong>Recent Lab:</strong> Blood Test - Normal
              <br />
              <strong>Allergies:</strong> None
            </Card.Text>
            <Button variant="primary" className="me-2 my-2 rounded-pill">
              <FaFileDownload /> Download Report
            </Button>
            <Button variant="secondary" className="me-2 my-2 rounded-pill">
              View Full History
            </Button>
          </Card>
        </Col>

        {/* Appointments Card */}
        <Col lg={4} md={6} className="mb-3">
          <Card className="p-3 h-100">
            <Card.Title>
              <FaCalendarAlt className="me-2" /> Appointments
            </Card.Title>
            {loadingAppointments ? (
              <Spinner animation="border" />
            ) : (
              <Card.Text>
                <strong>Next:</strong>{" "}
                {appointments.length > 0 ? (
                  `${toJSDate(appointments[0].date).toLocaleDateString()} at ${
                    appointments[0].time
                  }`
                ) : (
                  "No approved upcoming appointments"
                )}
                <br />
                <strong>Total Approved:</strong> {appointments.length} appointments
              </Card.Text>
            )}

            <Button
              as={Link}
              to="/patient/appointments/manage"
              variant="success"
              className="me-2 my-2 rounded-pill"
            >
              Book Appointment
            </Button>
            <Button
              as={Link}
              to="/patient/appointments/manage"
              variant="warning"
              className="me-2 my-2 rounded-pill"
            >
              Cancel / Reschedule
            </Button>
          </Card>
        </Col>

        {/* Medications */}
        <Col lg={4} md={12} className="mb-3">
          <Card className="p-3 h-100">
            <Card.Title>
              <FaPrescriptionBottle className="me-2" /> Medications
            </Card.Title>
            <Card.Text>
              You will find your Prescription issued by doctors here.
            </Card.Text>
            <Button
              variant="secondary"
              className="me-2 my-2 rounded-pill"
              as={Link}
              to="/patient/records/prescriptions"
            >
              <FaFileDownload /> Download Prescription
            </Button>
            <Button variant="warning" className="me-2 my-2 rounded-pill">
              Set Reminder
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Tabs Section */}
      <Tab.Container defaultActiveKey="messages">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="messages">
              <FaEnvelope className="me-2" /> Messages
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="reports">
              <FaFileDownload className="me-2" /> Health Reports
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="billing">
              <FaCalendarAlt className="me-2" /> Billing / Insurance
            </Nav.Link>
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
                    {messages.map((msg) => (
                      <tr key={msg.id}>
                        <td>{msg.fromDoctor ? msg.doctorName : msg.patientName}</td>
                        <td>{msg.text}</td>
                        <td>
                          <Badge bg={msg.read ? "success" : "warning"}>
                            {msg.read ? "Read" : "Unread"}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            onClick={() =>
                              (window.location.href = `/patient/messages/${msg.doctorId}`)
                            }
                          >
                            View Conversation
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No messages found</p>
              )}
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
                      <Button size="sm" className="me-2">
                        <FaFileDownload /> Download
                      </Button>
                      <Button size="sm">Share with Doctor</Button>
                    </td>
                  </tr>
                  <tr>
                    <td>X-Ray</td>
                    <td>05 Oct 2025</td>
                    <td>
                      <Button size="sm" className="me-2">
                        <FaFileDownload /> Download
                      </Button>
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
                    <td>
                      <Badge bg="success">Paid</Badge>
                    </td>
                    <td>
                      <Button size="sm">Download Invoice</Button>
                    </td>
                  </tr>
                  <tr>
                    <td>Lab Test</td>
                    <td>05 Oct 2025</td>
                    <td>
                      <Badge bg="warning">Pending</Badge>
                    </td>
                    <td>
                      <Button size="sm">Pay Now</Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Find a Doctor */}
      <h2 className="mb-4 mt-5">Find a Doctor</h2>
      <Col md={4}>
        <InputGroup className="my-3">
          <FormControl
            placeholder="Search doctors by name, city, hospital, specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
        </InputGroup>
      </Col>
      <Row>
        {filteredDoctors.map((doc) => (
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
              <p>
                Booking appointment with <strong>{selectedDoctor.name}</strong> ({selectedDoctor.specialty})
              </p>
              <Form onSubmit={handleConfirmBooking}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Date & Time</Form.Label>
                  <Form.Control type="datetime-local" name="datetime" required />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Confirm Booking
                </Button>
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
