// src/pages/ManageAppointments.jsx
import React, { useEffect, useState } from "react";
import { Container, Button, Form, Row, Col, Spinner, Table, Modal } from "react-bootstrap";
import { db, auth } from "../api/firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import { FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // <-- import useNavigate

export default function ManageAppointments() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate(); // <-- initialize navigate

  const [doctors, setDoctors] = useState([]);
  const [doctorMap, setDoctorMap] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("book");
  const [appointments, setAppointments] = useState([]);

  // Messaging modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [currentDoctorId, setCurrentDoctorId] = useState("");
  const [messageText, setMessageText] = useState("");

  // Fetch appointments
  const fetchAppointments = async () => {
    if (!user) return;
    const q = query(collection(db, "appointments"), where("patientId", "==", user.uid));
    const docs = await getDocs(q);
    setAppointments(docs.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Fetch doctors and appointments
  useEffect(() => {
    const fetchDoctors = async () => {
      const q = query(collection(db, "users"), where("role", "==", "doctor"));
      const docs = await getDocs(q);
      const doctorList = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctors(doctorList);
      const map = {};
      doctorList.forEach(doc => {
        map[doc.id] = `${doc.name} (${doc.specialty})`;
      });
      setDoctorMap(map);
    };
    fetchDoctors();
    if (activeTab === "manage") fetchAppointments();
    // eslint-disable-next-line
  }, [activeTab, user]);

  // Book appointment
  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !time) return alert("All fields required");
    setLoading(true);
    try {
      await addDoc(collection(db, "appointments"), {
        patientId: user.uid,
        doctorId: selectedDoctor,
        date: new Date(date),
        time,
        status: "Pending",
        createdAt: new Date(),
      });
      alert("Appointment booked successfully!");
      setDate("");
      setTime("");
      setSelectedDoctor("");
    } catch (err) {
      console.error(err);
      alert("Error booking appointment");
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Cancel this appointment?")) return;
    await deleteDoc(doc(db, "appointments", appointmentId));
    alert("Appointment cancelled.");
    fetchAppointments();
  };

  // Reschedule appointment
  const handleReschedule = async (appointmentId) => {
    const newDate = prompt("Enter new date (YYYY-MM-DD):");
    const newTime = prompt("Enter new time (HH:MM):");
    if (!newDate || !newTime) return alert("Both date and time required!");

    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, {
      date: new Date(newDate),
      time: newTime,
      status: "Rescheduled",
    });

    alert("Appointment rescheduled.");
    fetchAppointments();
  };

  return (
    <Container className="my-4">
      {/* Tabs */}
      <div className="mb-3">
        <Button
          variant={activeTab === "book" ? "primary" : "outline-primary"}
          className="me-2"
          onClick={() => setActiveTab("book")}
        >
          Book Appointment
        </Button>
        <Button
          variant={activeTab === "manage" ? "primary" : "outline-primary"}
          onClick={() => setActiveTab("manage")}
        >
          Manage Appointments
        </Button>
      </div>

      {/* Book Appointment */}
      {activeTab === "book" && (
        <Form onSubmit={handleBook}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Select Doctor</Form.Label>
                <Form.Select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                  <option value="">Choose...</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialty})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Time</Form.Label>
                <Form.Control type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Book Appointment"}
          </Button>
        </Form>
      )}

      {/* Manage Appointments */}
      {activeTab === "manage" && (
        <>
          {appointments.length === 0 ? (
            <p>No appointments yet.</p>
          ) : (
            <Table striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{doctorMap[a.doctorId] || a.doctorId}</td>
                    <td>{a.date.toDate ? a.date.toDate().toLocaleDateString() : "—"}</td>
                    <td>{a.time}</td>
                    <td>{a.status}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleReschedule(a.id)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="me-2"
                        onClick={() => handleCancel(a.id)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => navigate("/patient/messages", { state: { doctorId: a.doctorId } })}
                      >
                        <FaEnvelope className="me-1" /> Message
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Container>
  );
}
