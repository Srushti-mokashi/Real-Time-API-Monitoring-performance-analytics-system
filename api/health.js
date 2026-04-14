import db from "../backend/db.js";

export default async function handler(req, res) {
    try {

        await db.query("SELECT 1");

        return res.status(200).json({
            status: "OK",
            database: "connected"
        });

    } catch (err) {

        return res.status(500).json({
            status: "ERROR",
            error: err.message
        });

    }
}