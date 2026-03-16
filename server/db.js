import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

// Neon: use pooled connection string (host contains -pooler) when possible.
// SSL is required for Neon; pg accepts sslmode=require in URL or options.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  console.error("Unexpected pool error:", err);
});

export default pool;

