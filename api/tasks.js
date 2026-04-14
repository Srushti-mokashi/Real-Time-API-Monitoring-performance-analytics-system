import db from "../backend/db.js";

export default async function handler(req, res) {

  await db.initDB();

  try {

    // Extract ID from URL if present
    const urlParts = req.url.split("/");
    const id = urlParts.length > 3 ? urlParts[urlParts.length - 1] : null;

    // ---------------- GET TASKS ----------------
    if (req.method === "GET") {

      const tasks = await db.query(
        "SELECT * FROM tasks ORDER BY created_at DESC"
      );

      return res.status(200).json(tasks);
    }

    // ---------------- CREATE TASK ----------------
    if (req.method === "POST") {

      const { title, description, status } = req.body;

      const newTask = await db.query(
        "INSERT INTO tasks(title,description,status) VALUES($1,$2,$3) RETURNING *",
        [title, description, status]
      );

      return res.status(201).json(newTask[0]);
    }

    // ---------------- UPDATE TASK ----------------
    if (req.method === "PUT") {

      if (!id) {
        return res.status(400).json({ error: "Task ID required" });
      }

      const { status } = req.body;

      const updated = await db.query(
        "UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *",
        [status, id]
      );

      return res.status(200).json(updated[0]);
    }

    // ---------------- DELETE TASK ----------------
    if (req.method === "DELETE") {

      if (!id) {
        return res.status(400).json({ error: "Task ID required" });
      }

      await db.query("DELETE FROM tasks WHERE id=$1", [id]);

      return res.status(200).json({ message: "Task deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (err) {

    console.error("Tasks API error:", err);

    return res.status(500).json({
      error: err.message
    });

  }
}