const db = require('../db');

// Get all API logs
exports.getLogs = async (req, res) => {
    try {
        const logs = await db.query(
            'SELECT * FROM api_logs ORDER BY created_at DESC'
        );
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

// Get performance analytics
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