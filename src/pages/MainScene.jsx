import React, { useState } from "react";
import ThreeScene from "./ThreeScene";
import "../style/index.scss";

const MainScene = () => {
  const [messages, setMessages] = useState([]);
  const [models, setModels] = useState({});
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
          Accept: "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setModels(data);
        // Create a ranodom reply message
        const options = [
          "Sure, I have generated a room design for you.",
          "Sure, heres a room design for you.",
          "Here is a room design for you.",
          "I have generated a room design for you.",
          "I have created a room design for you.",
          "I have designed a room for you.",
          "I have made a room design for you.",
          "I have created a room design for you.",
          "I have made a room design for you.",
        ]

        const picked = options[Math.floor(Math.random() * options.length)];
        const botMessage = { sender: "bot", text: picked };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        const errorMessage = {
          sender: "bot",
          text: "Error: Unable to get a response.",
        };
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
        <ThreeScene modelsStuff={models} />
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
        <h1
          className="title"
          style={{
            fontFamily: "Inter",
            fontSize: "4rem",
            marginTop: "14px",
            paddingBottom: "14px",
            borderBottom: "1px solid black",
            marginBottom: "40px",
          }}
        >
          Chat Bot
        </h1>
        <div
          className="chat-box"
          style={{
            flex: 1,
            overflowY: "scroll",
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
                  background:
                    message.sender === "user" ? "#f9f9f3ff" : "#ffffff",
                  color: message.sender === "user" ? "black" : "black",
                }}
              >
                {message.text}
              </span>
            </div>
          ))}
        </div>
        <div
          className="field has-addons"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "30px" }}
        >
          <div className="control" style={{ flex: 1, marginBottom: 0 }}>
            <input
              className="input"
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              style={{
                borderRadius: "0", // Rounded left corners
                padding: "0.8rem 1rem",
                fontSize: "1rem",
                border: "1px solid #ccc",
                borderRight: "none", // Remove right border to visually connect to the button
                transition: "border-color 0.3s ease",
                width: "100%", // Make input take all available space
              }}
            />
          </div>
          <div className="control">
            <button
              className=""
              style={{
                marginTop: "0", // Remove top margin to align with input
                marginBottom: "0", // Remove bottom margin to align with input
                padding: "0.8rem 1.5rem",
                fontSize: "1rem",
                border: "1px solid #ccc", // Same border style as the input
              }}
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainScene;
