import db from "../backend/db.js";

export default async function handler(req, res) {

  await db.initDB();

  try {

    const logs = await db.query(
      "SELECT * FROM api_logs ORDER BY created_at DESC LIMIT 50"
    );

    res.status(200).json(logs);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }
};