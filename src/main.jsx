import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import "./index.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BrowserRouter, Route, Routes } from "react-router";
import PointCreator from "./pages/PointCreator";
import ThreeScene from "./pages/ThreeScene";

createRoot(document.getElementById("root")).render(
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <Routes>
          <Route path="/create_points" element={<PointCreator />} />
          <Route path="/real" element={<ThreeScene />} />
        </Routes>
      </BrowserRouter>
    </DndProvider>
);
