import { Router } from "express";
import pool from "../db.js";
import { verifyAuth } from "../middleware/auth.js";

const router = Router();

const VALID_KEYS = ["days", "scores", "notes", "blueprint", "flashcards", "selectedDay"];

// GET /api/progress — returns all progress for the authenticated user
router.get("/", verifyAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT progress_key, data FROM user_progress WHERE user_id = $1",
      [req.user.id]
    );

    const progress = {};
    for (const row of result.rows) {
      progress[row.progress_key] = row.data;
    }

    res.json({ progress });
  } catch (err) {
    console.error("Get progress error:", err);
    res.status(500).json({ error: "Failed to load progress" });
  }
});

// PUT /api/progress/:key — upsert a single progress key
router.put("/:key", verifyAuth, async (req, res) => {
  try {
    const { key } = req.params;

    if (!VALID_KEYS.includes(key)) {
      return res.status(400).json({ error: `Invalid progress key: ${key}` });
    }

    const { data } = req.body;

    if (data === undefined || data === null) {
      return res.status(400).json({ error: "Missing data field" });
    }

    await pool.query(
      `INSERT INTO user_progress (user_id, progress_key, data, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, progress_key)
       DO UPDATE SET data = $3, updated_at = NOW()`,
      [req.user.id, key, JSON.stringify(data)]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Save progress error:", err);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

// PUT /api/progress — bulk upsert all progress keys
router.put("/", verifyAuth, async (req, res) => {
  try {
    const { progress } = req.body;

    if (!progress || typeof progress !== "object") {
      return res.status(400).json({ error: "Missing progress object" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const [key, data] of Object.entries(progress)) {
        if (!VALID_KEYS.includes(key)) continue;

        await client.query(
          `INSERT INTO user_progress (user_id, progress_key, data, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (user_id, progress_key)
           DO UPDATE SET data = $3, updated_at = NOW()`,
          [req.user.id, key, JSON.stringify(data)]
        );
      }

      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Bulk save progress error:", err);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

export default router;

