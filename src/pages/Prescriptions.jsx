// src/pages/Prescriptions.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Spinner, Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import { db } from "../api/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function Prescriptions() {
  const { user } = useSelector((state) => state.auth);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Convert Firestore Timestamp to JS Date
  const toJSDate = (date) => {
    if (!date) return null;
    if (date.seconds) return new Date(date.seconds * 1000);
    if (date instanceof Date) return date;
    return new Date(date);
  };

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        let q;
        if (user.role === "patient") {
          // Patient sees only their prescriptions
          q = query(
            collection(db, "prescriptions"),
            where("patientId", "==", user.uid),
            orderBy("date", "desc")
          );
        } else if (user.role === "doctor") {
          // Doctor sees prescriptions of their patients
          q = query(
            collection(db, "prescriptions"),
            where("doctorId", "==", user.uid),
            orderBy("date", "desc")
          );
        } else {
          setPrescriptions([]);
          return;
        }

        const snap = await getDocs(q);
        const presList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPrescriptions(presList);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user]);

  return (
    <Container className="p-3">
      <h2 className="mb-4">
        {user.role === "patient" ? "Your Prescriptions" : "Prescriptions Issued"}
      </h2>

      {loading ? (
        <Spinner animation="border" />
      ) : prescriptions.length === 0 ? (
        <p>No prescriptions found.</p>
      ) : (
        <Table striped hover responsive>
          <thead>
            <tr>
              {user.role === "doctor" && <th>Patient Name</th>}
              {user.role === "patient" && <th>Doctor Name</th>}
              <th>Medication</th>
              <th>Dosage</th>
              <th>Notes</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p) => (
              <tr key={p.id}>
                {user.role === "doctor" && <td>{p.patientName}</td>}
                {user.role === "patient" && <td>{p.doctorName}</td>}
                <td>{p.medication}</td>
                <td>{p.dosage}</td>
                <td>{p.notes || "-"}</td>
                <td>{toJSDate(p.date)?.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
