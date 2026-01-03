import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import usePrinter from "../hooks/usePrinter";
import { curPatternAtom, drawingDataAtom } from "../utils/atoms";

function Preview() {
  const [curPattern] = useAtom(curPatternAtom);
  const [canvasData] = useAtom(drawingDataAtom);
  const previewRef = useRef<HTMLCanvasElement | null>(null);

  const getPatternImage = async (): Promise<HTMLImageElement | null> => {
    if (!curPattern) return null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = curPattern.imageUrl || curPattern.thumbnailUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load pattern image"));
    });

    return img;
  };

  const getDrawingImage = async (): Promise<HTMLImageElement | null> => {
    if (!canvasData) return null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = canvasData;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load drawing image"));
    });
    return img;
  };

  const drawCombinedImage = async () => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawRoundedRect = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius = 12
    ) => {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
      );
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
    };

    // Left: pattern image
    try {
      const pattern = await getPatternImage();
      if (pattern) {
        ctx.drawImage(
          pattern,
          0,
          0,
          pattern.width,
          pattern.height,
          0,
          0,
          canvas.width / 2,
          canvas.height
        );
      }
    } catch (e) {
      // ignore pattern error for now
    }

    // Right: user drawing copied from draw canvas
    try {
      const pattern = await getPatternImage();
      if (pattern) {
        ctx.drawImage(
          pattern,
          0,
          0,
          pattern.width,
          pattern.height,
          canvas.width / 2,
          0,
          canvas.width / 2,
          canvas.height
        );
      }

      // Overlay user drawing and rotate 90 degrees with white background and rounded corerners box.
      const drawing = await getDrawingImage();
      if (drawing) {
        const inset = 64;
        const boxX = canvas.width / 2 + inset;
        const boxY = inset;
        const boxW = canvas.width / 2 - inset * 2;
        const boxH = canvas.height - inset * 2;

        // White backing to boost contrast for the drawing overlay.
        ctx.save();
        drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 14);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fill();
        ctx.restore();

        ctx.drawImage(
          drawing,
          0,
          0,
          drawing.width,
          drawing.height,
          boxX,
          boxY,
          boxW,
          boxH
        );
      }
    } catch (e) {
      // ignore drawing error for now
    }
  };

  useEffect(() => {
    drawCombinedImage();
  }, [curPattern, canvasData]);

  return (
    <div className="mx-auto max-w-4xl">
      <canvas
        ref={previewRef}
        className="mb-6 w-full rounded-2xl shadow-2xl"
        style={{
          height: 250,
          display: "block",
          backgroundColor: "#ffffffff",
        }}
      />
      <PrintButton previewRef={previewRef} />
      <PrinterStatusBar />
    </div>
  );
}

export default Preview;

interface Props {
  previewRef: React.RefObject<HTMLCanvasElement | null>;
}

function PrintButton({ previewRef }: Props) {
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    setPrinting(true);
    const canvasRef = previewRef.current;
    if (!canvasRef) return;

    canvasRef.toBlob((blob) => {
      const formData = new FormData();
      if (blob) {
        formData.append("image", blob, "image.png");

        fetch("/api/print", {
          method: "POST",
          body: formData,
        })
          .then((res) => {
            if (!res.ok) {
              console.error("Print request failed");
            }
          })
          .catch((err) => {
            console.error("Print request error:", err);
          })
          .finally(() => {
            setPrinting(false);
          });
      }
    }, "image/png");

    // const dataUrl = canvasRef.toDataURL("image/png");
    // const res = await fetch("/api/print", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     dataUrl: dataUrl,
    //   }),
    // });
    // if (!res.ok) {
    //   const text = await res.text();
    //   console.error("Print request failed:", text);
    // }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={printing}
      className="fixed bottom-8 right-8 z-20 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-md font-bold text-white shadow-2xl shadow-green-400/50 transition-all duration-300 hover:shadow-green-500/70 hover:scale-110 active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
    >
      {printing ? (
        <>
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Printing...
        </>
      ) : (
        <>Print</>
      )}
    </button>
  );
}

function PrinterStatusBar() {
  const { printStatus, isLoading, error } = usePrinter();

  const statusLabel = printStatus
    ? printStatus.isPrinting
      ? "Printing"
      : "Idle"
    : "Unavailable";

  return (
    <div className="fixed left-6 bottom-6 z-30">
      <div className="flex items-center gap-3 rounded-full bg-white/90 backdrop-blur px-4 py-2 shadow-lg border border-gray-200">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <svg
              className="h-4 w-4 animate-spin text-gray-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <span
              className={`h-3 w-3 rounded-full ${
                printStatus?.isPrinting ? "bg-rose-500" : "bg-emerald-500"
              }`}
            />
          )}

          <span className="text-sm font-semibold text-gray-800">
            Printer: {statusLabel}
          </span>
        </div>

        <span className="text-sm text-gray-600">
          Queue: {printStatus?.queueLength ?? "-"}
        </span>

        {error && <span className="ml-2 text-sm text-red-600">Error</span>}
      </div>

      {error && (
        <div className="mt-2 px-3 py-1 rounded-md bg-red-50 text-red-700 text-sm shadow-inner max-w-xs">
          {String((error as any)?.message ?? error)}
        </div>
      )}
    </div>
  );
}
