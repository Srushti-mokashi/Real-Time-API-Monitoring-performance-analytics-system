const db = require("../db");

/* ===============================
   TASK CONTROLLERS
================================ */

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await db.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  const { title, description, status } = req.body;

  try {
    const task = await db.query(
      `INSERT INTO tasks (title, description, status)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [title, description, status]
    );

    res.json(task[0]);
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Update task status
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query(
      `UPDATE tasks SET status=$1 WHERE id=$2`,
      [status, id]
    );

    res.json({ message: "Task updated" });
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      `DELETE FROM tasks WHERE id=$1`,
      [id]
    );

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

/* ===============================
   API MONITORING CONTROLLERS
================================ */

// Get API logs
exports.getLogs = async (req, res) => {
  try {
    const logs = await db.query(
      "SELECT * FROM api_logs ORDER BY created_at DESC"
    );

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await db.query(`
      SELECT endpoint,
             COUNT(*) AS total_requests,
             AVG(response_time) AS avg_response_time
      FROM api_logs
      GROUP BY endpoint
      ORDER BY avg_response_time DESC
    `);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};