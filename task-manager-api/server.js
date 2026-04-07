const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const taskRoutes = require('./routes/tasks');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route (for quick health check)
app.get('/', (req, res) => {
    res.json({ message: "Real-Time API Monitoring & Performance Analytics API is running" });
});

// API Routes
app.use('/api', taskRoutes);

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});