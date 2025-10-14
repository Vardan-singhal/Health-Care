// src/pages/Appointments.jsx
import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { db } from "../api/firebase";
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from "firebase/firestore";
import AppointmentCard from "../components/AppointmentCard";

export default function Appointments() {
  const { user, role } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        let q;
        if (role === "patient") {
          q = query(
            collection(db, "appointments"),
            where("patientId", "==", user.uid),
            orderBy("date", "asc")
          );
        } else if (role === "doctor") {
          q = query(
            collection(db, "appointments"),
            where("doctorId", "==", user.uid),
            orderBy("date", "asc")
          );
        }

        const snap = await getDocs(q);
        setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [role, user.uid]);

  // Doctor actions
  const handleDoctorAction = async (id, action) => {
    const statusMap = {
      confirm: "Confirmed",
      cancel: "Cancelled",
      complete: "Completed",
    };
    try {
      const apptRef = doc(db, "appointments", id);
      await updateDoc(apptRef, { status: statusMap[action] });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: statusMap[action] } : a));
    } catch (err) {
      console.error(err);
    }
  };

  // Patient actions
  const handlePatientAction = async (id, action) => {
    const statusMap = {
      cancel: "Cancelled",
      reschedule: "Reschedule Requested",
    };
    try {
      const apptRef = doc(db, "appointments", id);
      await updateDoc(apptRef, { status: statusMap[action] });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: statusMap[action] } : a));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!appointments.length) {
    return (
      <Container className="my-4">
        <h3>No appointments found</h3>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h3>{role === "patient" ? "My Appointments" : "Doctor Appointments"}</h3>

      <div className="appointments-list">
        {appointments.map(appt => (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            role={role}
            onAction={role === "doctor" ? handleDoctorAction : handlePatientAction}
          />
        ))}
      </div>
    </Container>
  );
}
