import "dotenv/config";
import Debug from "debug";
import express from "express";
import cors from "cors";
import { PORT } from "./env.js";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import type { ErrorRequestHandler } from "express";
import { enqueuePrintJob, getPrintStatus } from "./queue.js";

const debug = Debug("myapp");
const app = express();

//Middleware
app.use(morgan("dev", { immediate: false }));
app.use(helmet());
app.use(
  cors({
    origin: false, // Disable CORS
    // origin: "*", // Allow all origins
  })
);
// Extracts the entire body portion of an incoming request stream and exposes it on req.body.
app.use(express.json());

// Serving built frontend
app.use(express.static("public"));

// Multer setup for handling multipart/form-data (file uploads)
const storage = multer.memoryStorage();
const print = multer({ storage: storage });

app.post("/api/print", print.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  debug(
    `Received print request with file: ${req.file.originalname}, size: ${req.file.size} bytes`
  );

  await enqueuePrintJob(async () => {
    // Simulate print job processing
    debug(
      `Processing print job for file: ${req.file?.originalname}, size: ${req.file?.size} bytes`
    );
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Simulate delay
    debug(`Print job completed for file: ${req.file?.originalname}`);
  });

  res.status(200).json({ message: "Print request received successfully." });
});

app.get("/api/queue", (req, res) => {
  res.status(200).json(getPrintStatus());
});

// Catch all endpoints
app.use(async (req, res, next) => {
  res.sendFile("index.html", { root: "public" });
});

// JSON Error Middleware
const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  debug(err.message);
  const errorResponse = {
    message: err.message || "Internal Server Error",
    type: err.name || "Error",
    stack: err.stack,
  };
  res.status(500).send(errorResponse);
};
app.use(jsonErrorHandler);

// * Running app
app.listen(PORT, async () => {
  debug(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
