require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function main() {
  const urls = [
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ].filter(Boolean);

  console.log('Testing', urls.length, 'URLs');
  for (const url of urls) {
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
    try {
      const res = await pool.query('SELECT 1');
      console.log('CONNECTED', url.split('@')[1], res.rows[0]);
      await pool.end();
      return;
    } catch (e) {
      console.error('FAILED', url.split('@')[1], e.code, e.message || e);
      await pool.end().catch(() => {});
    }
  }
  process.exit(1);
}

main();
