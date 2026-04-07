const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: async (sql, params) => {
        const { rows } = await pool.query(sql, params);
        return rows;
    },
    pool
};