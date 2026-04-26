import pkg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from this file's directory
dotenv.config({ path: path.join(__dirname, ".env") });

const { Pool } = pkg;

// Strip params not supported by pg client (channel_binding) and params
// that cause hangs (sslmode — pg v8 now treats 'require' as 'verify-full').
// SSL is controlled exclusively via the ssl:{} option in the Pool config below.
function cleanConnectionString(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    u.searchParams.delete("channel_binding");
    u.searchParams.delete("sslmode");
    return u.toString();
  } catch (err) {
    return url;
  }
}

const rawUrl = process.env.DATABASE_URL || "";
const cleanUrl = cleanConnectionString(rawUrl);

if (!cleanUrl) {
  console.error("DATABASE_URL is not set! Check backend/.env");
}

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 20000,  // allowing 20s max for Neon db cold start
  idleTimeoutMillis: 30000
});

// Auto-create tables
const initDB = async () => {
  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id SERIAL PRIMARY KEY,
        endpoint VARCHAR(255) NOT NULL,
        method VARCHAR(10),
        response_time INTEGER,
        status INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Database tables initialized successfully");

  } catch (err) {

    console.error("DB init error:", err.message);

  }
};

let dbInitialized = false;

const db = {
  query: async (sql, params) => {
    if (!dbInitialized) {
      await initDB();
      dbInitialized = true;
    }
    const { rows } = await pool.query(sql, params);
    return rows;
  },
  pool,
  initDB
};

export default db;

