const db = require("../backend/db");

module.exports = async function handler(req, res) {

    await db.initDB();

    try {

        const totalTasksResult = await db.query("SELECT COUNT(*) FROM tasks");
        const logs = await db.query("SELECT * FROM api_logs");

        const totalTasks = Number(totalTasksResult[0].count);

        let totalLatency = 0;
        let errorCount = 0;

        logs.forEach(log => {
            totalLatency += Number(log.response_time || 0);

            if (log.status >= 400) {
                errorCount++;
            }
        });

        const avgLatency =
            logs.length === 0
                ? 0
                : Math.round(totalLatency / logs.length);

        const errorRate =
            logs.length === 0
                ? 0
                : Math.round((errorCount / logs.length) * 100);

        const endpointMap = {};

        logs.forEach(log => {
            endpointMap[log.endpoint] =
                (endpointMap[log.endpoint] || 0) + 1;
        });

        const endpointStats = Object.keys(endpointMap).map(endpoint => ({
            endpoint,
            count: endpointMap[endpoint]
        }));

        return res.status(200).json({
            totalTasks,
            avgLatency,
            errorRate,
            endpointStats
        });

    } catch (err) {

        console.error("Analytics error:", err);

        return res.status(500).json({
            error: err.message
        });

    }

};