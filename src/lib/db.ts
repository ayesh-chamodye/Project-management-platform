import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

let poolInstance: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL or POSTGRES_URL is not set. In Vercel, add one of them in Settings > Environment Variables > Production."
    );
  }

  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    } as any);
  }

  return poolInstance;
}

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getPool());
  }
  return dbInstance;
}

export { getDb as db, getPool };

export default {
  query: (text: string, params?: any[]) => getPool().query(text, params),
  connect: () => getPool().connect(),
  end: () => getPool().end(),
} as any;
