import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

export default function Messages() {
  const { user } = useSelector((s) => s.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatPartner, setChatPartner] = useState(null);
  const [threads, setThreads] = useState([]);
  const messagesEndRef = useRef(null);

  // 🔹 Listen for available chat threads
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Group by partner
      const uniqueThreads = {};
      allMsgs.forEach((msg) => {
        const partnerId = msg.participants.find((p) => p !== user.uid);
        if (!uniqueThreads[partnerId]) {
          uniqueThreads[partnerId] = msg;
        }
      });
      setThreads(Object.values(uniqueThreads));
    });

    return () => unsubscribe();
  }, [user]);

  // 🔹 Load messages for selected partner
  useEffect(() => {
    if (!chatPartner || !user) return;

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (msg) =>
            msg.participants.includes(chatPartner.uid) &&
            msg.participants.includes(user.uid)
        );
      setMessages(allMsgs);
    });

    return () => unsubscribe();
  }, [chatPartner, user]);

  // 🔹 Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatPartner) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: input,
        from: user.uid,
        to: chatPartner.uid,
        participants: [user.uid, chatPartner.uid],
        createdAt: serverTimestamp(),
      });
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Container fluid className="py-4" style={{ marginTop: "80px" }}>
      <Row>
        {/* Left Sidebar - Threads */}
        <Col md={3} className="border-end">
          <h5 className="mb-3">Chats</h5>
          {threads.length === 0 ? (
            <p className="text-muted">No chats yet.</p>
          ) : (
            threads.map((t) => {
              const partnerId = t.participants.find((p) => p !== user.uid);
              return (
                <Card
                  key={partnerId}
                  className={`mb-2 p-2 shadow-sm ${
                    chatPartner?.uid === partnerId ? "bg-primary text-white" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setChatPartner({ uid: partnerId, name: t.partnerName || "User" })}
                >
                  <div className="d-flex align-items-center">
                    <i className="bi bi-person-circle fs-4 me-2"></i>
                    <div>
                      <strong>{t.partnerName || "User"}</strong>
                      <div className="small text-muted">
                        {t.text?.slice(0, 25) || "Tap to chat"}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </Col>

        {/* Right Chat Panel */}
        <Col md={9}>
          {chatPartner ? (
            <Card className="shadow-sm">
              <Card.Header className="d-flex align-items-center justify-content-between">
                <div>
                  <i className="bi bi-person-circle me-2"></i>
                  <strong>{chatPartner.name}</strong>
                </div>
              </Card.Header>
              <Card.Body
                style={{ height: "65vh", overflowY: "auto", background: "#f8f9fa" }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`d-flex ${
                      msg.from === user.uid ? "justify-content-end" : "justify-content-start"
                    } mb-2`}
                  >
                    <div
                      className={`p-2 rounded-3 ${
                        msg.from === user.uid
                          ? "bg-primary text-white"
                          : "bg-light border"
                      }`}
                      style={{ maxWidth: "70%" }}
                    >
                      {msg.text}
                      <div className="small text-muted mt-1">
                        {msg.createdAt?.toDate
                          ? msg.createdAt.toDate().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </Card.Body>
              <Card.Footer>
                <Form onSubmit={handleSend} className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="me-2"
                  />
                  <Button variant="primary" type="submit">
                    <i className="bi bi-send-fill"></i>
                  </Button>
                </Form>
              </Card.Footer>
            </Card>
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100 text-muted">
              <p>Select a chat to start messaging.</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
