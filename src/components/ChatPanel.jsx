import React, { useState, useEffect, useRef } from "react";

export default function ChatPanel({ thread = [], onSend }) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className="border rounded d-flex flex-column shadow-sm"
      style={{
        height: "70vh",
        maxHeight: "600px",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Header */}
      <div className="bg-primary text-white py-2 px-3 d-flex align-items-center justify-content-between rounded-top">
        <div className="d-flex align-items-center">
          <i className="bi bi-chat-dots-fill me-2 fs-5"></i>
          <h6 className="m-0">Live Chat</h6>
        </div>
        <i className="bi bi-person-circle fs-4"></i>
      </div>

      {/* Messages Area */}
      <div
        className="flex-grow-1 overflow-auto p-3"
        style={{ scrollBehavior: "smooth" }}
      >
        {thread.length === 0 ? (
          <div className="text-center text-muted mt-5">
            <i className="bi bi-chat-left-text display-6"></i>
            <p className="mt-2">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          thread.map((m, i) => (
            <div
              key={i}
              className={`d-flex mb-3 ${
                m.from === "me" ? "justify-content-end" : "justify-content-start"
              }`}
            >
              {m.from !== "me" && (
                <i className="bi bi-person-circle text-secondary me-2 fs-4 align-self-end"></i>
              )}
              <div
                className={`p-2 rounded shadow-sm ${
                  m.from === "me"
                    ? "bg-primary text-white"
                    : "bg-white border border-light"
                }`}
                style={{
                  maxWidth: "70%",
                  wordWrap: "break-word",
                }}
              >
                <div>{m.text}</div>
                <div
                  className={`small mt-1 ${
                    m.from === "me" ? "text-light opacity-75" : "text-muted"
                  }`}
                  style={{ fontSize: "0.75rem" }}
                >
                  {m.time
                    ? new Date(m.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
              {m.from === "me" && (
                <i className="bi bi-person-circle text-primary ms-2 fs-4 align-self-end"></i>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input Area */}
      <div className="border-top bg-light p-2 d-flex align-items-center">
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-emoji-smile text-secondary"></i>
          </span>
          <input
            className="form-control"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button className="btn btn-primary d-flex align-items-center" onClick={send}>
            <i className="bi bi-send-fill me-1"></i> Send
          </button>
        </div>
      </div>
    </div>
  );
}
