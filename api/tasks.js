const db = require("../backend/db");

export default async function handler(req, res) {

    if (req.method === "GET") {
        try {

            const tasks = await db.query("SELECT * FROM tasks ORDER BY created_at DESC");

            res.status(200).json(tasks);

        } catch (err) {

            res.status(500).json({ error: err.message });

        }
    }

}