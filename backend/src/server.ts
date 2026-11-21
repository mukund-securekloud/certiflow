
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import healthRoutes from "./routes/health.routes.js";
import userRoutes from "./routes/user.routes.js";
import batchRoutes from "./routes/batch.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to CertiFlow API"
  });
});

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/batches", batchRoutes);

// Handle unknown routes
app.use((_req, res) => {
  res.status(404).json({
    message: "API route not found"
  });
});

// Server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`CertiFlow server running on port ${PORT}`);
});
