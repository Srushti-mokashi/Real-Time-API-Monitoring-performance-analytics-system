const db = require("../backend/db");

export default async function handler(req, res) {

    if (req.method === "GET") {
        try {

            const tasks = await db.query(
                "SELECT * FROM tasks ORDER BY created_at DESC"
            );

            res.status(200).json(tasks);

        } catch (err) {

            res.status(500).json({ error: err.message });

        }
    }

    if (req.method === "POST") {

        const { title, description, status } = req.body;

        try {

            const newTask = await db.query(
                "INSERT INTO tasks(title,description,status) VALUES($1,$2,$3) RETURNING *",
                [title, description, status]
            );

            res.status(201).json(newTask[0]);

        } catch (err) {

            res.status(500).json({ error: err.message });

        }

    }

}