import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Spinner } from "react-bootstrap";
import { auth, db } from "../firebase";
import { collection, addDoc, deleteDoc, doc, query, where, getDocs } from "firebase/firestore";

export default function DoctorCard({ doctor }) {
  const [loading, setLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const user = auth.currentUser;

  // Open/close modal
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!user) return alert("Please login first");
    if (!selectedDate || !selectedTime) return alert("Please select date and time");

    setLoading(true);

    try {
      // Check if already booked
      const q = query(
        collection(db, "appointments"),
        where("doctorId", "==", doctor.id),
        where("patientId", "==", user.uid)
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        alert("You already have an appointment with this doctor!");
        setLoading(false);
        return;
      }

      // Add appointment
      const docRef = await addDoc(collection(db, "appointments"), {
        doctorId: doctor.id,
        patientId: user.uid,
        patientName: user.displayName,
        doctorName: doctor.name,
        specialty: doctor.specialty, // make sure your Firestore has "specialty"
        date: selectedDate,
        time: selectedTime,
        status: "booked",
        createdAt: new Date().toISOString(),
      });

      setAppointmentId(docRef.id);
      alert("Appointment booked successfully!");
      handleCloseModal();
    } catch (err) {
      console.error("Firestore booking error:", err);
      alert("Error booking appointment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const handleCancel = async () => {
    if (!appointmentId) return alert("No appointment to cancel");
    setLoading(true);
    try {
      await deleteDoc(doc(db, "appointments", appointmentId));
      setAppointmentId(null);
      alert("Appointment cancelled!");
    } catch (err) {
      console.error(err);
      alert("Error cancelling appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleManage = () => {
    alert("Redirecting to appointment management page (to be built)");
  };

  return (
    <>
      <Card className="shadow-sm h-100">
        <Card.Body className="d-flex flex-column">
          <Card.Title>{doctor.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            <i className="bi bi-heart-pulse-fill me-1"></i>
            {doctor.specialty} — {doctor.city}
          </Card.Subtitle>
          <Card.Text className="flex-grow-1">
            <strong>Hospital:</strong> {doctor.hospital || "N/A"} <br />
            <strong>Experience:</strong> {doctor.experience || "N/A"} years
          </Card.Text>

          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <div className="d-flex justify-content-between mt-3">
              {!appointmentId ? (
                <Button variant="primary" onClick={handleOpenModal}>
                  <i className="bi bi-calendar-plus me-1"></i> Book
                </Button>
              ) : (
                <Button variant="danger" onClick={handleCancel}>
                  <i className="bi bi-x-circle me-1"></i> Cancel
                </Button>
              )}
              <Button variant="secondary" onClick={handleManage}>
                <i className="bi bi-gear-fill me-1"></i> Manage
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Booking Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment with {doctor.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Date</Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Select Time</Form.Label>
              <Form.Control
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleConfirmBooking}>
            Confirm Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
