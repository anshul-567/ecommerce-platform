const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Render (and most managed PostgreSQL hosts) require SSL, but reject
  // self-signed certs by default with Node's strict verification.
  // rejectUnauthorized: false is safe here since we're already connecting
  // via a trusted host/password Render gave us directly.
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;
