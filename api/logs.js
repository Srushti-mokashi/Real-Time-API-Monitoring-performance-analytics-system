const db = require("../backend/db");

module.exports = async (req, res) => {

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