import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Layout from "./components/Layout.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Drawing from "./components/Drawing.tsx";
import PatternSelector from "./components/PatternSelector.tsx";
import Preview from "./components/Preview.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PatternSelector />} />
          <Route path="draw" element={<Drawing />} />
          <Route path="preview" element={<Preview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
