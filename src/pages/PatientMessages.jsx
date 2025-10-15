// src/pages/PatientMessages.jsx
import React, { useEffect, useState } from "react";
import { Container, ListGroup, InputGroup, FormControl, Button } from "react-bootstrap";
import { db } from "../api/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { useSelector } from "react-redux";

export default function PatientMessages() {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});

  const fetchMessages = async () => {
    if (!user) return;
    const q = query(collection(db, "messages"), where("patientId", "==", user.uid));
    const msgSnap = await getDocs(q);
    setMessages(msgSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  const handleSendReply = async (msgId, doctorId) => {
    const text = replyText[msgId];
    if (!text) return alert("Enter a message");

    // Add new message document for doctor
    await addDoc(collection(db, "messages"), {
      patientId: user.uid,
      doctorId,
      text,
      read: false,
      time: new Date(),
    });

    // Optionally mark original message as read
    const msgRef = doc(db, "messages", msgId);
    await updateDoc(msgRef, { read: true });

    setReplyText(prev => ({ ...prev, [msgId]: "" }));
    fetchMessages();
  };

  return (
    <Container className="my-4">
      <h3>Messages</h3>
      {messages.length === 0 ? <p>No messages yet.</p> : (
        <ListGroup>
          {messages.map(msg => (
            <ListGroup.Item key={msg.id} className={msg.read ? "" : "bg-light"}>
              <strong>From Dr. {msg.doctorId}</strong>: {msg.text} <br />
              <small className="text-muted">{msg.time?.toDate ? msg.time.toDate().toLocaleString() : "—"}</small>
              <div className="mt-2">
                <InputGroup>
                  <FormControl
                    placeholder="Reply..."
                    value={replyText[msg.id] || ""}
                    onChange={e => setReplyText(prev => ({ ...prev, [msg.id]: e.target.value }))}
                  />
                  <Button
                    variant="primary"
                    onClick={() => handleSendReply(msg.id, msg.doctorId)}
                  >
                    Send
                  </Button>
                </InputGroup>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}
