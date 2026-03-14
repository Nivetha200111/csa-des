import cors from "cors";
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.js";
import progressRoutes from "./routes/progress.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`CSA server running on http://localhost:${PORT}`);
});

