// src/pages/Messages.jsx
import React, { useEffect, useState } from "react";
import { Container, Card, ListGroup, InputGroup, FormControl, Button, Spinner } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa";
import { db, auth } from "../api/firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";

export default function Messages({ role }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    // Fetch messages where current user is sender or receiver
    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);

      // Mark unread messages as read if they are received by current user
      msgs.forEach(async (msg) => {
        if (!msg.read && msg.receiverId === currentUser.uid) {
          await updateDoc(doc(db, "messages", msg.id), { read: true });
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // For simplicity, sending message to all doctors/patients? Adjust receiverId logic as needed
    // Here, you can extend UI to select receiver from a dropdown

    const receiverId = ""; // TODO: set correct receiverId dynamically
    await addDoc(collection(db, "messages"), {
      senderId: currentUser.uid,
      receiverId,
      participants: [currentUser.uid, receiverId],
      text: newMessage,
      timestamp: serverTimestamp(),
      read: false,
    });

    setNewMessage("");
  };

  return (
    <Container fluid className="my-4">
      <h3 className="mb-3">Messages</h3>

      <Card className="p-3 mb-3" style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
            <Spinner animation="border" />
          </div>
        ) : messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <ListGroup variant="flush">
            {messages.map(msg => (
              <ListGroup.Item
                key={msg.id}
                className={msg.senderId === currentUser.uid ? "text-end bg-light" : "text-start bg-white"}
              >
                <strong>{msg.senderId === currentUser.uid ? "You" : "Sender"}</strong>: {msg.text}
                <br />
                <small className="text-muted">{msg.timestamp?.toDate().toLocaleString()}</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card>

      <InputGroup>
        <FormControl
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button onClick={handleSend}>
          <FaPaperPlane />
        </Button>
      </InputGroup>
    </Container>
  );
}
