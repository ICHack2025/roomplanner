import { createRoot } from "react-dom/client";
import "./style/index.scss";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BrowserRouter, Route, Routes } from "react-router";
import PointCreator from "./pages/PointCreator";
import ThreeScene from "./pages/ThreeScene";
import Home from "./pages/Home";

createRoot(document.getElementById("root")).render(
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create_points" element={<PointCreator />} />
          <Route path="/real" element={<ThreeScene />} />
        </Routes>
      </BrowserRouter>
      {/* Cover the whole page */}
      <img src="./wavebg.png" style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        objectFit: "cover",
        opacity: 0.2,
        zIndex: 0,
        pointerEvents: "none"
      }} />
    </DndProvider>
);
