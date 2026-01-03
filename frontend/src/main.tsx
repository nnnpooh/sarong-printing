import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import Drawing from "./components/Drawing.tsx";
import Layout from "./components/Layout.tsx";
import PatternSelector from "./components/PatternSelector.tsx";
import Preview from "./components/Preview.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<PatternSelector />} />
            <Route path="draw" element={<Drawing />} />
            <Route path="preview" element={<Preview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
