// src/components/AppointmentCard.jsx
import React from "react";
import { Card, Button, Badge } from "react-bootstrap";

export default function AppointmentCard({ appointment, role, onAction }) {
  const { patientName, doctorName, date, time, status } = appointment;

  const statusColor = {
    Confirmed: "success",
    Cancelled: "danger",
    "Reschedule Requested": "warning",
    Completed: "primary",
  }[status] || "secondary";

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>
          {role === "patient" ? doctorName : patientName}
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {new Date(date.seconds * 1000).toLocaleDateString()} at {time}
        </Card.Subtitle>
        <Badge bg={statusColor}>{status}</Badge>

        <div className="mt-3">
          {role === "doctor" ? (
            <>
              <Button size="sm" variant="success" className="me-1" onClick={() => onAction(appointment.id, "confirm")}>
                Confirm
              </Button>
              <Button size="sm" variant="danger" className="me-1" onClick={() => onAction(appointment.id, "cancel")}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={() => onAction(appointment.id, "complete")}>
                Complete
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="danger" className="me-1" onClick={() => onAction(appointment.id, "cancel")}>
                Cancel
              </Button>
              <Button size="sm" variant="warning" onClick={() => onAction(appointment.id, "reschedule")}>
                Reschedule
              </Button>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
