import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { drawingDataAtom } from "../utils/atoms";

interface Point {
  x: number;
  y: number;
}

function Drawing() {
  // Ref for the canvas element
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const [canvasData, setCanvasData] = useAtom(drawingDataAtom);

  // Setup canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    // Set canvas size to match parent so that drawing coordinates align
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
  }, []);

  useEffect(() => {
    // If there's existing drawing data, load it
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (canvasData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = canvasData;
    }
  }, [canvasData]);

  // Helper to map client coordinates to canvas pixel coordinates
  const getCanvasPosFromClient = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current!; // Non-null assertion since we check in handlers.
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Helper to get mouse position (uses client coords helper)
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) =>
    getCanvasPosFromClient(e.clientX, e.clientY);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!canvasRef.current) return;
    const pos = getCanvasPos(e);
    isDrawingRef.current = true;
    lastPointRef.current = pos;
    console.log("Mouse down at", pos);
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!isDrawingRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPointRef.current) return;

    const newPos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(newPos.x, newPos.y);
    ctx.stroke();

    lastPointRef.current = newPos;
    // console.log("Mouse move to", newPos);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    canvasRef.current && setCanvasData(canvasRef.current.toDataURL());
    // console.log("Mouse up, drawing saved");
  };

  // Touch handlers for mobile browsers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const t = e.touches[0];
    if (!t) return;
    const pos = getCanvasPosFromClient(t.clientX, t.clientY);
    isDrawingRef.current = true;
    lastPointRef.current = pos;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const t = e.touches[0];
    if (!t) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPointRef.current) return;

    const newPos = getCanvasPosFromClient(t.clientX, t.clientY);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(newPos.x, newPos.y);
    ctx.stroke();

    lastPointRef.current = newPos;
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    canvasRef.current && setCanvasData(canvasRef.current.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasData("");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-2xl shadow-2xl">
        <canvas
          ref={canvasRef}
          className="block w-full cursor-crosshair touch-none"
          style={{
            height: 250,
            backgroundColor: "#ffffffff",
            touchAction: "none",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        />
      </div>
      <button
        onClick={clearCanvas}
        className="fixed bottom-8 right-8 z-20 inline-flex items-center gap-2 rounded-full bg-gray-500 px-6 py-3 text-sm font-semibold text-white shadow-2xl shadow-gray-300/50 transition-all duration-300 hover:bg-gray-600 hover:shadow-gray-400/70 hover:scale-110 active:scale-100"
      >
        🗑️ Clear
      </button>
    </div>
  );
}

export default Drawing;
