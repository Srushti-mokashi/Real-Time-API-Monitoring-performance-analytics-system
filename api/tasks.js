const db = require("../backend/db");

module.exports = async (req, res) => {

  await db.initDB();

  try {

    if (req.method === "GET") {

      const tasks = await db.query(
        "SELECT * FROM tasks ORDER BY created_at DESC"
      );

      return res.status(200).json(tasks);
    }

    if (req.method === "POST") {

      const { title, description, status } = req.body;

      const newTask = await db.query(
        "INSERT INTO tasks(title,description,status) VALUES($1,$2,$3) RETURNING *",
        [title, description, status]
      );

      return res.status(201).json(newTask[0]);
    }

    if (req.method === "PUT") {

      const id = req.query.id;
      const { status } = req.body;

      const updated = await db.query(
        "UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *",
        [status, id]
      );

      return res.status(200).json(updated[0]);
    }

    if (req.method === "DELETE") {

      const id = req.query.id;

      await db.query(
        "DELETE FROM tasks WHERE id=$1",
        [id]
      );

      return res.status(200).json({ message: "Task deleted" });
    }

    res.status(405).json({ message: "Method not allowed" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};