import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const docsRef = collection(db, "doctors");
        const snapshot = await getDocs(docsRef);
        const docList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setDoctors(docList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="mt-4">
      {/* Welcome Banner */}
      <Card className="shadow-sm mb-4 text-center">
        <Card.Body>
          <h2>Welcome, {user?.displayName || "Patient"}!</h2>
          <p className="text-muted">
            Here are the available doctors. You can view their profiles for more details.
          </p>
        </Card.Body>
      </Card>

      {/* Doctors List */}
      <Row className="g-4">
        {doctors.length === 0 ? (
          <p>No doctors available at the moment.</p>
        ) : (
          doctors.map((doc) => (
            <Col md={4} key={doc.id}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Img
                  variant="top"
                  src={doc.photoURL || "https://via.placeholder.com/200x200?text=Doctor"}
                  alt={doc.name}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>
                    <i className="bi bi-person-badge me-2 text-primary"></i>
                    {doc.name}
                  </Card.Title>
                  <Card.Subtitle className="text-muted mb-2">
                    {doc.specialty || "General Practitioner"}
                  </Card.Subtitle>
                  <Card.Text className="flex-grow-1">
                    <i className="bi bi-geo-alt-fill text-danger"></i> {doc.city || "N/A"} <br />
                    <i className="bi bi-hospital text-success"></i> {doc.hospital || "N/A"} <br />
                    <i className="bi bi-briefcase-fill text-warning"></i> {doc.experience || "0"} years
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/doctors/${doc.id}`)}
                  >
                    View Profile
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}
