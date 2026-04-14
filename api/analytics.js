const db = require("../backend/db");

export default async function handler(req, res) {

    await db.initDB();

    try {

        const totalTasksResult = await db.query("SELECT COUNT(*) FROM tasks");
        const logs = await db.query("SELECT * FROM api_logs");

        const totalTasks = Number(totalTasksResult[0].count);

        let totalLatency = 0;
        let errorCount = 0;

        logs.forEach(l => {
            totalLatency += Number(l.response_time || 0);
            if (l.status >= 400) errorCount++;
        });

        const avgLatency =
            logs.length === 0 ? 0 : Math.round(totalLatency / logs.length);

        const errorRate =
            logs.length === 0 ? 0 : Math.round((errorCount / logs.length) * 100);

        const endpointStats = {};

        logs.forEach(l => {
            endpointStats[l.endpoint] = (endpointStats[l.endpoint] || 0) + 1;
        });

        const endpointArray = Object.keys(endpointStats).map(e => ({
            endpoint: e,
            count: endpointStats[e]
        }));

        return res.status(200).json({
            totalTasks,
            avgLatency,
            errorRate,
            endpointStats: endpointArray
        });

    } catch (err) {

        return res.status(500).json({ error: err.message });

    }

}