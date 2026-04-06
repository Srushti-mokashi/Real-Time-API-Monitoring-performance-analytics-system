const db = require('../db');

exports.getTasks = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

exports.createTask = async (req, res) => {
    const { title, description, status } = req.body;
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    try {
        const result = await db.query(
            'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
            [title, description, status || 'Pending']
        );
        const insertId = result.insertId;
        const [newTask] = await db.query('SELECT * FROM tasks WHERE id = ?', [insertId]);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ message: "Status is required" });
    }
    try {
        const result = await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json({ message: "Task updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
};
