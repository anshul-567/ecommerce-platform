const { Pool } = require('pg');
require('dotenv').config();

// Supports two ways of configuring the connection:
// 1. A single DATABASE_URL (what Neon, Supabase, and most modern providers give you)
// 2. The older split vars (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD) - kept
//    for backward compatibility / local development if you prefer separate fields.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    });

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;
