import React, { useState } from "react";
import ThreeScene from "./ThreeScene";

const MainScene = () => {
  const [messages, setMessages] = useState([]);
  const [models, setModels] = useState({
    chair:
      "https://web-api.ikea.com/dimma/assets/1.2/90503285/PS01_S01_NV01/rqp3/glb/90503285_PS01_S01_NV01_RQP3_3.0_4f3c38313d63daded1667b4466e0c0ec.glb",
    desk: "https://web-api.ikea.com/dimma/assets/1.2/80354276/PS01_S01_NV01/rqp3/glb/80354276_PS01_S01_NV01_RQP3_3.0_0f6194297ea644d59a905d19e949764c.glb",
  });
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
        const botMessage = { sender: "bot", text: data.reply };
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
                  background: message.sender === "user" ? "#f9f9f3ff" : "#ffffff",
                  color: message.sender === "user" ? "black" : "black",
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
