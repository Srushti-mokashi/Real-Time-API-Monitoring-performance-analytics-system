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

// Get combined analytics
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Total tasks counter
    const tasksCountResult = await db.query("SELECT COUNT(*) FROM tasks");
    const totalTasks = parseInt(tasksCountResult[0].count);

    // 2. Latency and Error Analytics from logs
    const logStats = await db.query(`
      SELECT 
        AVG(response_time) as avg_latency,
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status >= 400) as error_count
      FROM api_logs
    `);

    const avgLatency = Math.round(logStats[0].avg_latency || 0);
    const totalRequests = parseInt(logStats[0].total_requests || 0);
    const errorCount = parseInt(logStats[0].error_count || 0);
    const errorRate = totalRequests > 0 ? ((errorCount / totalRequests) * 100).toFixed(2) : 0;

    // 3. Per-endpoint statistics
    const endpointStats = await db.query(`
      SELECT endpoint, COUNT(*) as count, AVG(status) as avg_status
      FROM api_logs
      GROUP BY endpoint
      ORDER BY count DESC
    `);

    res.json({
      totalTasks,
      avgLatency,
      totalRequests,
      errorRate,
      endpointStats
    });

  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};