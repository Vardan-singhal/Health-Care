import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // appointment filter

  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // Fetch doctor profile
    const fetchDoctor = async () => {
      try {
        const docRef = doc(db, "doctors", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setDoctor({ id: docSnap.id, ...docSnap.data() });
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
      }
    };
    fetchDoctor();

    // Real-time appointments
    const apptQ = query(
      collection(db, "appointments"),
      where("doctorId", "==", user.uid),
      orderBy("date", "desc")
    );
    const unsubscribeAppt = onSnapshot(apptQ, (snapshot) => {
      const appts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAppointments(appts);
      setLoading(false);
    });

    // Real-time messages
    const msgQ = query(collection(db, "messages"), where("doctorId", "==", user.uid));
    const unsubscribeMsg = onSnapshot(msgQ, (snapshot) => {
      const msgs = snapshot.docs.map((m) => ({ id: m.id, ...m.data() }));
      setMessages(msgs);
    });

    return () => {
      unsubscribeAppt();
      unsubscribeMsg();
    };
  }, [user]);

  if (loading || !doctor) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Filter appointments
  const filteredAppointments = appointments.filter((a) => {
    const today = new Date();
    const apptDate = new Date(a.date);
    if (filter === "today") return apptDate.toDateString() === today.toDateString();
    if (filter === "week")
      return apptDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return true;
  });

  return (
    <Container className="mt-4">
      {/* Profile + Summary Section */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Img
              variant="top"
              src={doctor.photoURL || "https://via.placeholder.com/200x200?text=Doctor"}
              alt="Doctor"
            />
            <Card.Body>
              <Card.Title className="d-flex align-items-center">
                <i className="bi bi-person-badge me-2 text-primary"></i>
                {doctor.name}
              </Card.Title>
              <Card.Subtitle className="text-muted mb-2">
                {doctor.specialty || "General Practitioner"}
              </Card.Subtitle>
              <Card.Text>
                <i className="bi bi-geo-alt-fill text-danger"></i> {doctor.city || "N/A"} <br />
                <i className="bi bi-hospital text-success"></i> {doctor.hospital || "N/A"} <br />
                <i className="bi bi-briefcase-fill text-warning"></i> {doctor.experience || "0"} years
              </Card.Text>
              <Button variant="outline-primary" onClick={() => navigate("/messages")}>
                <i className="bi bi-envelope-fill me-1"></i> View Messages
              </Button>{" "}
              <Button variant="outline-secondary" onClick={() => navigate("/edit-doctor")}>
                <i className="bi bi-pencil-square me-1"></i> Edit Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Row className="g-3">
            <Col sm={6}>
              <Card className="text-center shadow-sm border-0 p-3">
                <i className="bi bi-calendar-check display-5 text-primary mb-2"></i>
                <h5>Total Appointments</h5>
                <h3>{appointments.length}</h3>
              </Card>
            </Col>
            <Col sm={6}>
              <Card className="text-center shadow-sm border-0 p-3">
                <i className="bi bi-person-heart display-5 text-success mb-2"></i>
                <h5>Patients This Week</h5>
                <h3>
                  {appointments.filter(
                    (a) =>
                      new Date(a.date).getTime() >
                      new Date().getTime() - 7 * 24 * 60 * 60 * 1000
                  ).length}
                </h3>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Appointment Management */}
      <Card className="shadow-sm border-0 mt-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-clock-history me-2"></i> Appointment History
          </span>
          <Form.Select
            size="sm"
            style={{ width: "180px" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Appointments</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </Form.Select>
        </Card.Header>
        <Card.Body>
          {filteredAppointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <i className="bi bi-person-fill me-2"></i>
                        {a.patientName}
                      </td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td>
                        <Badge
                          bg={
                            a.status === "confirmed"
                              ? "success"
                              : a.status === "pending"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Messages Section */}
      <Card className="shadow-sm border-0 mt-4">
        <Card.Header className="bg-info text-white">
          <i className="bi bi-chat-dots-fill me-2"></i> Messages from Patients
        </Card.Header>
        <Card.Body>
          {messages.length === 0 ? (
            <p>No messages received yet.</p>
          ) : (
            <ul className="list-group">
              {messages
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((msg) => (
                  <li key={msg.id} className="list-group-item d-flex justify-content-between align-items-start">
                    <div>
                      <i className="bi bi-person-fill text-primary me-2"></i>
                      <strong>{msg.patientName || msg.from}</strong>: {msg.content || msg.text}
                    </div>
                    <small className="text-muted">
                      {msg.createdAt?.toDate
                        ? msg.createdAt.toDate().toLocaleString()
                        : new Date(msg.createdAt).toLocaleString()}
                    </small>
                  </li>
                ))}
            </ul>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
