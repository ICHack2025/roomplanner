import { createRoot } from "react-dom/client";
import "./style/index.scss";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BrowserRouter, Route, Routes } from "react-router";
import PointCreator from "./pages/PointCreator";
import ThreeScene from "./pages/ThreeScene";
import Home from "./pages/Home";
import MainScene from "./pages/MainScene";
import Upload from "./pages/Upload";

createRoot(document.getElementById("root")).render(
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/create_points" element={<PointCreator />} />
          <Route path="/real" element={<MainScene />} />
        </Routes>
      </BrowserRouter>
    </DndProvider>
);
