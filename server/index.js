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

// Health check (includes DB ping when DATABASE_URL is set)
app.get("/api/health", async (_req, res) => {
  const payload = { status: "ok", timestamp: new Date().toISOString() };
  if (process.env.DATABASE_URL) {
    try {
      const pool = (await import("./db.js")).default;
      await pool.query("SELECT 1");
      payload.database = "connected";
    } catch (err) {
      payload.database = "error";
      payload.error = err.message;
      res.status(503).json(payload);
      return;
    }
  }
  res.json(payload);
});

// In production (and not on Vercel), serve the Vite-built frontend
const isVercel = Boolean(process.env.VERCEL);
if (isProduction && !isVercel) {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));

  // SPA fallback — serve index.html for any non-API route
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Only listen when running as a standalone server (not on Vercel serverless)
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`CSA server running on http://localhost:${PORT}${isProduction ? " (production)" : ""}`);
  });
}

export default app;
