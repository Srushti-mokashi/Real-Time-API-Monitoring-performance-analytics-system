const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const taskRoutes = require("./routes/tasks");
const db = require("./db");

const app = express();

// ---------------- Middleware ----------------
app.use(cors());
app.use(express.json());

// ---------------- API Monitoring Middleware ----------------
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
        message: "Real-Time API Monitoring API running",
        status: "OK",
        timestamp: new Date()
    });
});


// ---------------- Health Check ----------------
app.get("/health", async (req, res) => {

    try {

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


// ---------------- Export App for Vercel ----------------
module.exports = app;


// ---------------- Local Development Only ----------------
if (process.env.NODE_ENV !== "production") {

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

}


// ---------------- Initialize DB ----------------
db.initDB();