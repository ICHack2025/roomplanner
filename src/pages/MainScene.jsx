import React, { useState } from "react";
import ThreeScene from "./ThreeScene";

const MainScene = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Function to handle sending a message
  const handleSend = async () => {
    if (!input.trim()) return; // Do nothing if input is empty

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    try {
      // Call the API with the user's input
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        const botMessage = { sender: "bot", text: data.reply };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        const errorMessage = { sender: "bot", text: "Error: Unable to get a response." };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { sender: "bot", text: "Error: Network issue." };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh", // Ensures the full height of the viewport
      }}
    >
      {/* 3D Scene Section */}
      <div style={{ flex: 3, borderRight: "1px solid #ddd" }}>
        <ThreeScene />
      </div>

      {/* Sidebar Section */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "10px",
        }}
      >
        <h1 className="title">Chat Bot</h1>
        <div
          className="chat-box"
          style={{
            flex: 1,
            overflowY: "scroll",
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                textAlign: message.sender === "user" ? "right" : "left",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  background: message.sender === "user" ? "#007bff" : "#f1f1f1",
                  color: message.sender === "user" ? "white" : "black",
                }}
              >
                {message.text}
              </span>
            </div>
          ))}
        </div>
        <div className="field has-addons">
          <div className="control" style={{ flex: 1 }}>
            <input
              className="input"
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
          </div>
          <div className="control">
            <button className="button is-primary" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainScene;
