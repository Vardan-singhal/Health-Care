import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Tabs,
  Tab,
  ListGroup,
  InputGroup,
  FormControl,
  Spinner,
} from "react-bootstrap";
import {
  FaUserMd,
  FaCalendarCheck,
  FaEnvelope,
  FaClock,
  FaFileDownload,
} from "react-icons/fa";
import { auth, db } from "../api/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [key, setKey] = useState("appointments");
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch doctor profile + live appointments
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        // Fetch doctor profile
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === "doctor") {
          setDoctorProfile(docSnap.data());
        }

        // Live listen to appointments
        const apptQuery = query(
          collection(db, "appointments"),
          where("doctorId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(apptQuery, async (snapshot) => {
          const data = await Promise.all(
            snapshot.docs.map(async (d) => {
              const appointment = { id: d.id, ...d.data() };

              // Fetch patient name
              try {
                const patientQuery = query(
                  collection(db, "users"),
                  where("uid", "==", appointment.patientId)
                );
                const patientSnap = await getDocs(patientQuery);
                if (!patientSnap.empty) {
                  appointment.patientName =
                    patientSnap.docs[0].data().name || "Unknown";
                } else {
                  appointment.patientName = "Unknown";
                }
              } catch (err) {
                appointment.patientName = "Unknown";
              }

              return appointment;
            })
          );

          setAppointments(data);
          setLoading(false);
        });

        // Fetch messages
        const msgQuery = query(
          collection(db, "messages"),
          where("doctorId", "==", user.uid)
        );
        const msgSnap = await getDocs(msgQuery);
        const msgs = msgSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().time?.toDate?.(),
        }));
        setMessages(msgs);

        return () => unsubscribe();
      } catch (err) {
        console.error(err);
      }
    };

    fetchDoctorData();
  }, [navigate]);

  // Update appointment status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const docRef = doc(db, "appointments", id);
      await updateDoc(docRef, { status: newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  const handleEditProfile = () => alert("Edit Profile clicked!");
  const handleAddAvailability = () => alert("Add Availability clicked!");
  const handleSendMessage = () => alert("Send Message clicked!");
  const handleDownloadReports = () => alert("Download Reports clicked!");
  const handleSendReply = (msgId) => {
    alert(`Reply to message ${msgId}: ${replyText[msgId]}`);
    setReplyText((prev) => ({ ...prev, [msgId]: "" }));
  };

  if (!doctorProfile) return <p>Loading doctor data...</p>;

  // Summary Metrics
  const summaryMetrics = [
    {
      title: "Total Appointments",
      value: appointments.length,
      color: "primary",
      icon: <FaCalendarCheck />,
    },
    {
      title: "Patients This Week",
      value: new Set(appointments.map((a) => a.patientName)).size,
      color: "success",
      icon: <FaUserMd />,
    },
    {
      title: "Pending Appointments",
      value: appointments.filter((a) => a.status === "Pending").length,
      color: "warning",
      icon: <FaClock />,
    },
    {
      title: "Messages Waiting",
      value: messages.filter((m) => !m.read).length,
      color: "danger",
      icon: <FaEnvelope />,
    },
  ];

  return (
    <Container fluid className="my-4">
      <Row>
        {/* Left Column */}
        <Col lg={3} className="mb-4">
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{doctorProfile.name}</Card.Title>
              <Card.Text>
                <strong>Specialty:</strong> {doctorProfile.specialty} <br />
                <strong>Hospital:</strong> {doctorProfile.hospital} <br />
                <strong>City:</strong> {doctorProfile.city} <br />
                <strong>Experience:</strong> {doctorProfile.experience} yrs
                <br />
                <strong>Email:</strong> {doctorProfile.email} <br />
                <strong>Phone:</strong> {doctorProfile.phone || "N/A"}
              </Card.Text>
              <Button
                variant="outline-primary"
                className="w-100 mb-2"
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
              <Button
                variant="secondary"
                className="w-100"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Card.Body>
          </Card>

          {/* Summary Cards */}
          {summaryMetrics.map((metric, idx) => (
            <Card key={idx} className="mb-3 border-left-0 shadow-sm">
              <Card.Body
                className={`d-flex align-items-center text-${metric.color}`}
              >
                <div
                  style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}
                >
                  {metric.icon}
                </div>
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
              <Button
                variant="success"
                className="w-100 mb-2"
                onClick={handleAddAvailability}
              >
                <FaClock className="me-2" />
                Add Availability
              </Button>
              <Button
                variant="info"
                className="w-100 mb-2"
                onClick={handleSendMessage}
              >
                <FaEnvelope className="me-2" />
                Send Message
              </Button>
              <Button
                variant="dark"
                className="w-100"
                onClick={handleDownloadReports}
              >
                <FaFileDownload className="me-2" />
                Download Reports
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Tabs */}
        <Col lg={9}>
          <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
            {/* Appointments */}
            <Tab eventKey="appointments" title="Appointments">
              <h5>Upcoming Appointments</h5>
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" />
                </div>
              ) : appointments.length === 0 ? (
                <p>No appointments scheduled yet.</p>
              ) : (
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
                    {appointments.map((appt) => (
                      <tr key={appt.id}>
                        <td>{appt.patientName}</td>
                        <td>
                          {appt.date?.toDate
                            ? appt.date.toDate().toLocaleDateString()
                            : new Date(appt.date).toLocaleDateString()}
                        </td>
                        <td>{appt.time}</td>
                        <td>
                          <Badge
                            bg={
                              appt.status === "Pending"
                                ? "warning"
                                : appt.status === "Approved"
                                ? "success"
                                : appt.status === "Cancelled"
                                ? "danger"
                                : "secondary"
                            }
                          >
                            {appt.status}
                          </Badge>
                        </td>
                        <td>
                          {appt.status === "Pending" && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() =>
                                  handleStatusChange(appt.id, "Approved")
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(appt.id, "Cancelled")
                                }
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>

            {/* Messages */}
            <Tab eventKey="messages" title="Messages">
              <h5>Patient Messages</h5>
              <ListGroup>
                {messages.map((msg) => (
                  <ListGroup.Item
                    key={msg.id}
                    className={msg.read ? "" : "bg-light"}
                  >
                    <strong>{msg.patientName}</strong> - {msg.text} <br />
                    <small className="text-muted">
                      {msg.time?.toLocaleString()}
                    </small>
                    <div className="mt-1">
                      <InputGroup>
                        <FormControl
                          placeholder="Reply..."
                          value={replyText[msg.id] || ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({
                              ...prev,
                              [msg.id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          variant="primary"
                          onClick={() => handleSendReply(msg.id)}
                        >
                          Send
                        </Button>
                      </InputGroup>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Tab>

            {/* Calendar */}
            <Tab eventKey="calendar" title="Calendar">
              <h5>Schedule</h5>
              <p>Calendar view placeholder - integrate FullCalendar here.</p>
            </Tab>

            {/* Reports */}
            <Tab eventKey="reports" title="Reports">
              <h5>Analytics & Reports</h5>
              <p>Patient demographics, appointment trends, etc.</p>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}
