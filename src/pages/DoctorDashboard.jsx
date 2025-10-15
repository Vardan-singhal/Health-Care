// src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Form, Badge, Tabs, Tab, ListGroup, InputGroup, FormControl } from "react-bootstrap";
import { FaUserMd, FaCalendarCheck, FaEnvelope, FaClock, FaFileDownload } from "react-icons/fa";
import { auth, db } from "../api/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [key, setKey] = useState("appointments");
  const [replyText, setReplyText] = useState({});

  // Helper to convert Firestore Timestamp to string
  const convertTimestamp = (ts) => {
    if (!ts) return "";
    if (ts.toDate) return ts.toDate().toLocaleString();
    return ts;
  };

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login"); // redirect if not logged in
          return;
        }

        // Fetch doctor profile
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === "doctor") {
          setDoctorProfile(docSnap.data());
        }

        // Fetch appointments for this doctor
        const apptQuery = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
        const apptSnap = await getDocs(apptQuery);
        const appts = apptSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate?.(),  // convert Firestore Timestamp to JS Date
            time: data.time?.toDate?.() || data.time, // convert time if timestamp
          };
        });
        setUpcomingAppointments(appts);

        // Fetch messages for this doctor
        const msgQuery = query(collection(db, "messages"), where("doctorId", "==", user.uid));
        const msgSnap = await getDocs(msgQuery);
        const msgs = msgSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            time: data.time?.toDate?.(),
          };
        });
        setMessages(msgs);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDoctorData();
  }, [navigate]);

  // Button Handlers
  const handleLogout = async () => {
    await auth.signOut();
    navigate("/"); // redirect to landing page
  };

  const handleEditProfile = () => alert("Edit Profile clicked!");
  const handleAddAvailability = () => alert("Add Availability clicked!");
  const handleSendMessage = () => alert("Send Message clicked!");
  const handleDownloadReports = () => alert("Download Reports clicked!");
  const handleConfirmAppointment = (id) => alert(`Confirm Appointment ${id}`);
  const handleCancelAppointment = (id) => alert(`Cancel Appointment ${id}`);
  const handleRescheduleAppointment = (id) => alert(`Reschedule Appointment ${id}`);
  const handleSendReply = (msgId) => {
    alert(`Reply to message ${msgId}: ${replyText[msgId]}`);
    setReplyText(prev => ({ ...prev, [msgId]: "" }));
  };

  if (!doctorProfile) return <p>Loading doctor data...</p>;

  // Summary Metrics
  const summaryMetrics = [
    { title: "Total Appointments", value: upcomingAppointments.length, color: "primary", icon: <FaCalendarCheck /> },
    { title: "Patients This Week", value: new Set(upcomingAppointments.map(a => a.patientName)).size, color: "success", icon: <FaUserMd /> },
    { title: "Pending Appointments", value: upcomingAppointments.filter(a => a.status === "Pending").length, color: "warning", icon: <FaClock /> },
    { title: "Messages Waiting", value: messages.filter(m => !m.read).length, color: "danger", icon: <FaEnvelope /> },
  ];

  return (
    <Container fluid className="my-4">
      <Row>
        {/* Left Column: Profile + Summary */}
        <Col lg={3} className="mb-4">
          <Card className="mb-4">
            <Card.Img variant="top" src={doctorProfile.photo || "https://via.placeholder.com/150"} />
            <Card.Body>
              <Card.Title>{doctorProfile.name}</Card.Title>
              <Card.Text>
                <strong>Specialty:</strong> {doctorProfile.specialty} <br />
                <strong>Hospital:</strong> {doctorProfile.hospital} <br />
                <strong>City:</strong> {doctorProfile.city} <br />
                <strong>Experience:</strong> {doctorProfile.experience} yrs <br />
                <strong>Email:</strong> {doctorProfile.email} <br />
                <strong>Phone:</strong> {doctorProfile.phone || "N/A"}
              </Card.Text>
              <Button variant="outline-primary" className="w-100 mb-2" onClick={handleEditProfile}>Edit Profile</Button>
              <Button variant="secondary" className="w-100" onClick={handleLogout}>Logout</Button>
            </Card.Body>
          </Card>

          {/* Summary Cards */}
          {summaryMetrics.map((metric, idx) => (
            <Card key={idx} className="mb-3 border-left-0 shadow-sm">
              <Card.Body className={`d-flex align-items-center text-${metric.color}`}>
                <div style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>{metric.icon}</div>
                <div>
                  <div>{metric.title}</div>
                  <div className="fw-bold">{metric.value}</div>
                </div>
              </Card.Body>
            </Card>
          ))}

          {/* Quick Actions */}
          <Card className="mb-3">
            <Card.Body>
              <Button variant="success" className="w-100 mb-2" onClick={handleAddAvailability}><FaClock className="me-2"/>Add Availability</Button>
              <Button variant="info" className="w-100 mb-2" onClick={handleSendMessage}><FaEnvelope className="me-2"/>Send Message</Button>
              <Button variant="dark" className="w-100" onClick={handleDownloadReports}><FaFileDownload className="me-2"/>Download Reports</Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Tabs */}
        <Col lg={9}>
          <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
            {/* Appointments Tab */}
            <Tab eventKey="appointments" title="Appointments">
              <h5>Upcoming Appointments</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>{appt.patientName}</td>
                      <td>{appt.date?.toLocaleDateString()}</td>
                      <td>{appt.date?.toLocaleTimeString()}</td>
                      <td>
                        <Badge bg={appt.status === "Confirmed" ? "success" : appt.status === "Pending" ? "warning" : "secondary"}>
                          {appt.status}
                        </Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="success" className="me-1" onClick={() => handleConfirmAppointment(appt.id)}>Confirm</Button>
                        <Button size="sm" variant="danger" className="me-1" onClick={() => handleCancelAppointment(appt.id)}>Cancel</Button>
                        <Button size="sm" variant="outline-primary" onClick={() => handleRescheduleAppointment(appt.id)}>Reschedule</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            {/* Messages Tab */}
            <Tab eventKey="messages" title="Messages">
              <h5>Patient Messages</h5>
              <ListGroup>
                {messages.map((msg) => (
                  <ListGroup.Item key={msg.id} className={msg.read ? "" : "bg-light"}>
                    <strong>{msg.patientName}</strong> - {msg.text} <br />
                    <small className="text-muted">{msg.time?.toLocaleString()}</small>
                    <div className="mt-1">
                      <InputGroup>
                        <FormControl
                          placeholder="Reply..."
                          value={replyText[msg.id] || ""}
                          onChange={(e) => setReplyText(prev => ({ ...prev, [msg.id]: e.target.value }))}
                        />
                        <Button variant="primary" onClick={() => handleSendReply(msg.id)}>Send</Button>
                      </InputGroup>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Tab>

            {/* Calendar Tab */}
            <Tab eventKey="calendar" title="Calendar">
              <h5>Schedule</h5>
              <p>Calendar view placeholder - integrate FullCalendar or React Big Calendar here.</p>
            </Tab>

            {/* Reports Tab */}
            <Tab eventKey="reports" title="Reports">
              <h5>Analytics & Reports</h5>
              <p>Patient demographics, appointment trends, performance metrics go here.</p>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}
