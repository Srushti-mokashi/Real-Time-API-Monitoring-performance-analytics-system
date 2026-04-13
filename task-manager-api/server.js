const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const taskRoutes = require("./routes/tasks");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;


// ---------------- Middleware ----------------
app.use(cors()); // Simplified for verification
app.options("/:path*", cors()); // Express 5 compatible pre-flight catch-all

app.use(express.json());


// ---------------- API Monitoring Middleware ----------------
// Logs every API request into api_logs table
app.use((req, res, next) => {

    const start = Date.now();

    res.on("finish", async () => {

        const responseTime = Date.now() - start;

        try {

            await db.query(
                `INSERT INTO api_logs (endpoint, method, response_time, status)
                 VALUES ($1,$2,$3,$4)`,
                [
                    req.originalUrl,
                    req.method,
                    responseTime,
                    res.statusCode
                ]
            );

        } catch (err) {

            console.error("API log insert error:", err.message);

        }

    });

    next();

});


// ---------------- Root Route ----------------
app.get("/", (req, res) => {
    res.json({
        message: "Real-Time API Monitoring & Performance Analytics API is running",
        status: "OK",
        timestamp: new Date()
    });
});


// ---------------- Health Check Route ----------------
// Used by frontend dashboard to check API availability
app.get("/health", async (req, res) => {

    try {

        // test database connection
        await db.query("SELECT 1");

        res.json({
            status: "OK",
            database: "connected",
            service: "API Monitoring Backend",
            timestamp: new Date()
        });

    } catch (error) {

        res.status(500).json({
            status: "ERROR",
            database: "disconnected",
            error: error.message
        });

    }

});


// ---------------- API Routes ----------------
app.use("/api", taskRoutes);


// ---------------- 404 Handler ----------------
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});


// ---------------- Start Server ----------------
// Start listening immediately to avoid Render/Heroku boot timeout
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// Initialize database in the background
db.initDB();

