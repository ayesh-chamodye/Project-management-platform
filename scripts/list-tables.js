require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
  const res = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  console.log(res.rows.map(r => r.tablename).join('\n') || 'NO TABLES');
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
