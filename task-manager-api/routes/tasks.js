const express = require("express");
const router = express.Router();

const taskController = require("../controllers/taskController");


// ---------------- TASK ROUTES ----------------

// Get all tasks
router.get("/tasks", taskController.getTasks);

// Create new task
router.post("/tasks", taskController.createTask);

// Update task
router.put("/tasks/:id", taskController.updateTask);

// Delete task
router.delete("/tasks/:id", taskController.deleteTask);


// ---------------- API MONITORING ROUTES ----------------

// Get API logs
router.get("/logs", taskController.getLogs);

// Get analytics data
router.get("/analytics", taskController.getAnalytics);


module.exports = router;