// src/pages/DoctorMessages.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  ListGroup,
  InputGroup,
  FormControl,
  Button,
  Card,
  Spinner,
} from "react-bootstrap";
import { db } from "../api/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useSelector } from "react-redux";

export default function DoctorMessages() {
  const { user } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Real-time messages listener
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "messages"),
      where("doctorId", "==", user.uid),
      orderBy("time")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Mark unread messages from patient as read
      msgs.forEach(async (msg) => {
        if (!msg.fromDoctor && !msg.read) {
          const msgRef = doc(db, "messages", msg.id);
          await updateDoc(msgRef, { read: true });
        }
      });

      setMessages(msgs);

      // Extract unique patients
      const patientMap = {};
      msgs.forEach((msg) => {
        if (msg.patientId) patientMap[msg.patientId] = msg.patientName || msg.patientId;
      });
      setPatients(
        Object.entries(patientMap).map(([id, name]) => ({ id, name }))
      );

      // Auto-select first patient if none selected
      if (!selectedPatient || !patientMap[selectedPatient]) {
        setSelectedPatient(Object.keys(patientMap)[0] || null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, selectedPatient]);

  // Send a message
  const handleSendReply = async () => {
    if (!replyText || !selectedPatient) return alert("Enter a message");

    await addDoc(collection(db, "messages"), {
      patientId: selectedPatient,
      doctorId: user.uid,
      text: replyText,
      fromDoctor: true,
      read: false,
      time: new Date(),
      patientName: patients.find((p) => p.id === selectedPatient)?.name,
    });

    setReplyText("");
  };

  // Filter messages for selected patient
  const filteredMessages = messages.filter(
    (msg) => msg.patientId === selectedPatient
  );

  return (
    <Container fluid className="my-4">
      <Row>
        {/* Left Panel - Patients list */}
        <Col md={3}>
          <Card>
            <Card.Header>Patients</Card.Header>
            <ListGroup variant="flush">
              {loading ? (
                <Spinner animation="border" className="m-3" />
              ) : patients.length === 0 ? (
                <ListGroup.Item>No chats yet</ListGroup.Item>
              ) : (
                patients.map((p) => (
                  <ListGroup.Item
                    key={p.id}
                    action
                    active={p.id === selectedPatient}
                    onClick={() => setSelectedPatient(p.id)}
                  >
                    {p.name}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Right Panel - Chat */}
        <Col
          md={9}
          style={{ display: "flex", flexDirection: "column", height: "80vh" }}
        >
          <Card
            style={{
              flex: 1,
              overflowY: "auto",
              marginBottom: "10px",
              padding: "10px",
            }}
          >
            <Card.Header>
              Chat with{" "}
              {patients.find((p) => p.id === selectedPatient)?.name || "—"}
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center my-3">
                  <Spinner animation="border" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <p>No messages yet.</p>
              ) : (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      textAlign: msg.fromDoctor ? "right" : "left",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        borderRadius: "15px",
                        backgroundColor: msg.fromDoctor ? "#007bff" : "#f1f0f0",
                        color: msg.fromDoctor ? "#fff" : "#000",
                        maxWidth: "70%",
                        wordWrap: "break-word",
                      }}
                    >
                      {msg.text}
                    </div>
                    <br />
                    <small className="text-muted">
                      {msg.time?.toDate
                        ? msg.time.toDate().toLocaleString()
                        : new Date(msg.time).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </Card.Body>
          </Card>

          {/* Reply Input */}
          <InputGroup>
            <FormControl
              placeholder="Type a message..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendReply();
              }}
            />
            <Button variant="primary" onClick={handleSendReply}>
              Send
            </Button>
          </InputGroup>
        </Col>
      </Row>
    </Container>
  );
}
