import React, { useState, useRef, useEffect } from "react";
const overlayImage = "./texture.jpg"; // Replace with the path to your overlay image

const getStageString = (stage) => {
  switch (stage) {
    case 0:
      return "Place the axis point!";
    case 1:
      return "Place the first point!";
    case 2:
      return "Place the second point!";
    case 3:
      return "Place the third point!";
    case 4:
      return "All points placed!";
    default:
      return "Place the axis point!";
  }
};

const PointCreator = () => {
  const [stage, setStage] = useState(0);
  const [points, setPoints] = useState([]); // Store the placed points
  const [axisPoint, setAxisPoint] = useState(null); // Store the axis point
  const canvasRef = useRef(null);

  const handleClick = (event) => {
    const x = event.clientX - 10;
    const y = event.clientY - 10;

    // If the axis point hasn't been set, set it
    if (stage === 0) {
      setAxisPoint({ x, y });
    }

    // If the stage corresponds to placing points, place them
    else if (stage > 0) {
      setPoints((points) => {
        // Replace or add as needed
        const newPoints = [...points];
        if (stage - 1 < points.length) {
          newPoints[stage - 1] = { x, y };
        } else {
          newPoints.push({ x, y });
        }
        return newPoints;
      });
    }
  };

  // Function to draw lines on the canvas
  const drawLines = () => {
    if (!axisPoint || points.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set styles for the lines
    ctx.strokeStyle = "green"; // Line color
    ctx.lineWidth = 2;

    // Draw lines from axis point to all placed points
    points.forEach((point) => {
      ctx.beginPath();
      ctx.moveTo(axisPoint.x, axisPoint.y); // Start at the axis point
      ctx.lineTo(point.x, point.y); // End at the placed point
      ctx.stroke();
    });
  };

  // Effect to update canvas size and draw lines whenever points or axis point change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawLines();
    }
  }, [axisPoint, points]);

  return (
    <div
      onClick={handleClick}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        cursor: "pointer", // Change cursor to indicate interactivity
      }}
    >
      <img
        src={overlayImage}
        alt="Overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // Prevent image from blocking interaction
          opacity: 0.5, // Adjust for visibility
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "3rem",
          color: "white",
        }}
      >
        <h1>{getStageString(stage)}</h1>
        <button
          onClick={(e) => {
            e.stopPropagation();

            if (stage === 4) {
              window.location.href = "/real?cube=" + JSON.stringify([axisPoint, ...points]);
            }
            setStage((stage) => stage + 1);
          }}
          style={{
            padding: "1rem",
            height: "20px",
            backgroundColor: "white",
            color: "black",
            border: "none",
            cursor: "pointer",
          }}
        >
          Next
        </button>
      </div>

      {/* Canvas for drawing lines */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none", // Prevent canvas from blocking clicks
        }}
      />

      {/* Render circles for the axis point and placed points */}
      {axisPoint && (
        <div
          style={{
            position: "absolute",
            top: axisPoint.y,
            left: axisPoint.x,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "blue", // Axis point color
          }}
        />
      )}

      {points.map((point, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: point.y,
            left: point.x,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 0, 0, 0.7)", // Placed points color
          }}
        />
      ))}
    </div>
  );
};

export default PointCreator;
