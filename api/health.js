const db = require("../backend/db");

export default async function handler(req, res) {

    try {

        await db.query("SELECT 1");

        res.status(200).json({
            status: "OK",
            database: "connected"
        });

    } catch (err) {

        res.status(500).json({
            status: "ERROR",
            error: err.message
        });

    }

}