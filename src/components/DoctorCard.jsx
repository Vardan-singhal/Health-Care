// src/components/DoctorCard.jsx
import React from "react";
import { Card, Button } from "react-bootstrap";

export default function DoctorCard({ doctor }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{doctor.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{doctor.specialty}</Card.Subtitle>
        <Card.Text>{doctor.hospital}</Card.Text>
        <Button variant="primary">View Details</Button>
      </Card.Body>
    </Card>
  );
}
