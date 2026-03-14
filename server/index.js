import cors from "cors";
import "dotenv/config";
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import authRoutes from "./routes/auth.js";
import progressRoutes from "./routes/progress.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// In production, serve the Vite-built frontend
if (isProduction) {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));

  // SPA fallback — serve index.html for any non-API route
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`CSA server running on http://localhost:${PORT}${isProduction ? " (production)" : ""}`);
});
