import db from "../backend/db.js";

export default async function handler(req, res) {

  await db.initDB();

  try {

    const totalTasksResult = await db.query(
      "SELECT COUNT(*) FROM tasks"
    );

    const logs = await db.query(
      "SELECT * FROM api_logs"
    );

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

    const endpointCountMap = {};
    const endpointLatencyMap = {};

    logs.forEach(log => {
      endpointCountMap[log.endpoint] = (endpointCountMap[log.endpoint] || 0) + 1;
      endpointLatencyMap[log.endpoint] = (endpointLatencyMap[log.endpoint] || 0) + Number(log.response_time || 0);
    });

    const endpointStats = Object.keys(endpointCountMap).map(endpoint => ({
      endpoint,
      count: endpointCountMap[endpoint],
      avgLatency: Math.round(endpointLatencyMap[endpoint] / endpointCountMap[endpoint])
    }));

    res.status(200).json({
      totalTasks,
      avgLatency,
      errorRate,
      endpointStats
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};