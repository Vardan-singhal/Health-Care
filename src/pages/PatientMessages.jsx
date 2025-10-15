// src/pages/PatientMessages.jsx
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
  serverTimestamp,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function PatientMessages() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const doctorFromNav = location.state?.doctorId || null;

  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(doctorFromNav);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!user?.uid) return;

    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("patientId", "==", user.uid),
      orderBy("time", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Mark unread messages from doctor as read
        await Promise.all(
          msgs.map(async (msg) => {
            if (msg.fromDoctor && !msg.read) {
              const msgRef = doc(db, "messages", msg.id);
              await updateDoc(msgRef, { read: true });
            }
          })
        );

        setMessages(msgs);

        // Extract unique doctors
        const doctorMap = {};
        msgs.forEach((msg) => {
          if (msg.doctorId) doctorMap[msg.doctorId] = msg.doctorName || msg.doctorId;
        });
        setDoctors(Object.entries(doctorMap).map(([id, name]) => ({ id, name })));

        // Auto-select first doctor if none selected
        if (!selectedDoctor || !doctorMap[selectedDoctor]) {
          setSelectedDoctor(doctorFromNav || Object.keys(doctorMap)[0] || null);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching messages:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, selectedDoctor, doctorFromNav]);

  // Send message
  const handleSendReply = async () => {
    if (!replyText || !selectedDoctor) return alert("Enter a message");

    try {
      await addDoc(collection(db, "messages"), {
        patientId: user.uid,
        doctorId: selectedDoctor,
        text: replyText,
        fromDoctor: false,
        read: false,
        time: serverTimestamp(),
        doctorName: doctors.find((d) => d.id === selectedDoctor)?.name,
      });
      setReplyText("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message.");
    }
  };

  // Filter messages for selected doctor
  const filteredMessages = messages.filter(
    (msg) => msg.doctorId === selectedDoctor
  );

  return (
    <Container fluid className="my-4">
      <Row>
        {/* Left Panel - Doctors list */}
        <Col md={3}>
          <Card>
            <Card.Header>Doctors</Card.Header>
            <ListGroup variant="flush">
              {loading ? (
                <Spinner animation="border" className="m-3" />
              ) : doctors.length === 0 ? (
                <ListGroup.Item>No chats yet</ListGroup.Item>
              ) : (
                doctors.map((doc) => (
                  <ListGroup.Item
                    key={doc.id}
                    action
                    active={doc.id === selectedDoctor}
                    onClick={() => setSelectedDoctor(doc.id)}
                  >
                    {doc.name}
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
              Chat with {doctors.find((d) => d.id === selectedDoctor)?.name || "—"}
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
                      textAlign: msg.fromDoctor ? "left" : "right",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        borderRadius: "15px",
                        backgroundColor: msg.fromDoctor ? "#f1f0f0" : "#007bff",
                        color: msg.fromDoctor ? "#000" : "#fff",
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
                        : msg.time
                        ? new Date(msg.time.seconds * 1000).toLocaleString()
                        : ""}
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
