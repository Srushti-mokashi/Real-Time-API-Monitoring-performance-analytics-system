const db = require("../backend/db");

export default async function handler(req, res) {

    // Initialize DB tables (safe to call each time in serverless)
    await db.initDB();

    if (req.method === "GET") {
        try {

            const tasks = await db.query(
                "SELECT * FROM tasks ORDER BY created_at DESC"
            );

            return res.status(200).json(tasks);

        } catch (err) {

            return res.status(500).json({ error: err.message });

        }
    }

    if (req.method === "POST") {

        const { title, description, status } = req.body;

        try {

            const newTask = await db.query(
                "INSERT INTO tasks(title,description,status) VALUES($1,$2,$3) RETURNING *",
                [title, description, status]
            );

            return res.status(201).json(newTask[0]);

        } catch (err) {

            return res.status(500).json({ error: err.message });

        }

    }

    // If method not allowed
    return res.status(405).json({ message: "Method not allowed" });

}