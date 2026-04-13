const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const taskRoutes = require("./routes/tasks");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;


// ---------------- Middleware ----------------
// Explicitly allow frontend origin (Vercel) + localhost for dev
const allowedOrigins = [
    "https://real-time-api-monitoring-performanc.vercel.app",
    "https://real-time-api-monitoring-performance-analytics-system.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:5500"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., curl, Postman) or from allowedOrigins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS: " + origin));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Handle preflight requests for all routes
// Handle preflight requests for all routes (already handled by app.use(cors(...)) above)

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
db.initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

