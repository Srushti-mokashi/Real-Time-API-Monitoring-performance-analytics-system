import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load env from backend folder
dotenv.config({ path: "./backend/.env" });

// Import API handlers
import tasksHandler from "./api/tasks.js";
import logsHandler from "./api/logs.js";
import analyticsHandler from "./api/analytics.js";
import healthHandler from "./api/health.js";
import db from "./backend/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// API Request Logging Middleware
app.use(async (req, res, next) => {
  // Only log API requests, let static files pass without logging
  if (!req.path.startsWith("/api/")) {
    return next();
  }

  const start = Date.now();
  
  // Wait until the response finishes to get the status code and calculate latency
  res.on("finish", async () => {
    // We optionally skip logging our own monitoring endpoints to avoid infinite growth loops!
    if (req.path === "/api/logs" || req.path === "/api/analytics") {
      return;
    }

    const responseTime = Date.now() - start;
    try {
      await db.query(
        "INSERT INTO api_logs (endpoint, method, response_time, status) VALUES ($1, $2, $3, $4)",
        [req.path, req.method, responseTime, res.statusCode]
      );
    } catch (err) {
      console.error("Failed to insert api_log:", err.message);
    }
  });

  next();
});

// Serve static frontend files
app.use(express.static(__dirname));

// API Routes — map Vercel serverless handlers to Express routes
app.all("/api/tasks", tasksHandler);
app.all("/api/tasks/:id", (req, res) => {
  // Forward :id as a query param so handler can read req.query.id
  req.query.id = req.params.id;
  tasksHandler(req, res);
});

app.all("/api/logs", logsHandler);
app.all("/api/analytics", analyticsHandler);
app.all("/api/health", healthHandler);

// Catch-all: serve index.html for any unknown routes (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Antigravity Monitoring Server`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   API:     http://localhost:${PORT}/api/health\n`);
});
