import * as dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or POSTGRES_URL is not set.");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
} as any);

async function seed() {
  console.log("Seeding database...");

  const userId = "11111111-1111-1111-1111-111111111111";
  const workspaceId = "22222222-2222-2222-2222-222222222222";
  const projectId = "33333333-3333-3333-3333-333333333333";
  const task1Id = "44444444-4444-4444-4444-444444444444";
  const task2Id = "55555555-5555-5555-5555-555555555555";

  await pool.query(
    `INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
    [userId, "Demo User", "demo@example.com", "demo123", new Date(), new Date()]
  );

  await pool.query(
    `INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
    [workspaceId, "Demo Workspace", userId, new Date(), new Date()]
  );

  await pool.query(
    `INSERT INTO workspace_members (workspace_id, user_id, role, joined_at) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
    [workspaceId, userId, "owner", new Date()]
  );

  await pool.query(
    `INSERT INTO projects (id, workspace_id, name, description, status, created_by_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
    [projectId, workspaceId, "Demo Project", "A sample project", "active", userId, new Date(), new Date()]
  );

  await pool.query(
    `INSERT INTO tasks (id, project_id, title, description, priority, status, created_by_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
    [task1Id, projectId, "Welcome task", "Explore the platform", "medium", "todo", userId, new Date(), new Date()]
  );

  await pool.query(
    `INSERT INTO tasks (id, project_id, title, description, priority, status, created_by_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
    [task2Id, projectId, "Second task", "Try drag and drop", "high", "in_progress", userId, new Date(), new Date()]
  );

  console.log("Seed completed successfully!");
}

seed()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    pool.end();
    process.exit(1);
  });
