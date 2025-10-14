// src/pages/Landing.jsx
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaHeartbeat, FaCalendarAlt, FaPills, FaStethoscope, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-5 text-center bg-primary text-light">
        <Container>
          <h1 className="mb-3">Welcome to Healthcare App</h1>
          <p className="mb-4">
            Your personal health companion. Manage appointments, consult doctors, track medications, and access medical records seamlessly.
          </p>
          <div>
            <Button as={Link} to="/register" variant="light" className="me-2">Get Started</Button>
            
          </div>
        </Container>
      </section>

      {/* Key Features */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-4">Key Features</h2>
          <Row className="g-4">
            <Col md={6} lg={4}>
              <Card className="h-100 text-center p-3 shadow-sm">
                <FaHeartbeat size={50} className="mb-3 text-primary" />
                <Card.Body>
                  <Card.Title>Health Summary</Card.Title>
                  <Card.Text>
                    View vitals, lab results, allergies, and past medical history at a glance.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="h-100 text-center p-3 shadow-sm">
                <FaCalendarAlt size={50} className="mb-3 text-success" />
                <Card.Body>
                  <Card.Title>Appointments</Card.Title>
                  <Card.Text>
                    Book, reschedule, or cancel appointments with doctors easily.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="h-100 text-center p-3 shadow-sm">
                <FaPills size={50} className="mb-3 text-warning" />
                <Card.Body>
                  <Card.Title>Medications & Reminders</Card.Title>
                  <Card.Text>
                    Track your medications, get reminders, and request refills.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="h-100 text-center p-3 shadow-sm">
                <FaStethoscope size={50} className="mb-3 text-danger" />
                <Card.Body>
                  <Card.Title>Doctor Consultation</Card.Title>
                  <Card.Text>
                    Connect with doctors for consultations and get personalized advice.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="h-100 text-center p-3 shadow-sm">
                <FaEnvelope size={50} className="mb-3 text-info" />
                <Card.Body>
                  <Card.Title>Messages & Notifications</Card.Title>
                  <Card.Text>
                    Receive messages from doctors, appointment alerts, and important health updates.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      

      {/* Footer */}
      <footer className="py-3 bg-dark text-light text-center">
        <Container>
          <p className="mb-0">© 2025 Healthcare App. All Rights Reserved.</p>
        </Container>
      </footer>
    </>
  );
}
