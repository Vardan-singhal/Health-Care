// src/pages/DoctorDetails.jsx
import React, { useEffect, useState } from "react";
import { Container, Card, Button, Row, Col, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../api/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function DoctorDetails() {
  const { doctorId } = useParams(); // from route /doctor/:doctorId
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "doctors", doctorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDoctor(docSnap.data());
        }

        // Fetch appointments for this doctor
        const apptQuery = query(
          collection(db, "appointments"),
          where("doctorId", "==", doctorId),
          orderBy("date", "asc")
        );
        const apptSnap = await getDocs(apptQuery);
        setAppointments(apptSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!doctor) return <p>Doctor not found</p>;

  return (
    <Container className="my-4">
      <Row>
        <Col md={4}>
          <Card>
            <Card.Img variant="top" src={doctor.photo || "https://via.placeholder.com/150"} />
            <Card.Body>
              <Card.Title>{doctor.name}</Card.Title>
              <Card.Text>
                <strong>Specialty:</strong> {doctor.specialty}<br />
                <strong>Hospital:</strong> {doctor.hospital}<br />
                <strong>City:</strong> {doctor.city}<br />
                <strong>Experience:</strong> {doctor.experience} yrs<br />
                <strong>Email:</strong> {doctor.email}<br />
                <strong>Phone:</strong> {doctor.phone}
              </Card.Text>

              {/* Buttons */}
              {auth.currentUser?.uid === doctorId ? (
                <Button variant="outline-primary" className="w-100 mb-2" onClick={() => navigate("/doctor/edit")}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="success" className="w-100 mb-2" onClick={() => navigate(`/messages/${doctorId}`)}>
                    Message Doctor
                  </Button>
                  <Button variant="primary" className="w-100" onClick={() => navigate(`/book/${doctorId}`)}>
                    Book Appointment
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <h4>Upcoming Appointments</h4>
          {appointments.length === 0 ? (
            <p>No upcoming appointments.</p>
          ) : (
            appointments.map(appt => (
              <Card key={appt.id} className="mb-2 p-2">
                <strong>Patient:</strong> {appt.patientName} <br />
                <strong>Date:</strong> {new Date(appt.date.seconds * 1000).toLocaleDateString()} <br />
                <strong>Time:</strong> {appt.time} <br />
                <strong>Status:</strong> {appt.status}
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
}
