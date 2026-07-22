#!/usr/bin/env node
/**
 * Database setup helper for ProjectFlow.
 *
 * This does NOT run the SQL automatically. It prints the exact steps to:
 * 1) Create/configure a Supabase project
 * 2) Run the schema SQL
 * 3) (Optional) Seed a demo workspace/project
 *
 * Why no auto-migrate:
 * - The app uses Supabase Postgres + RLS. Applying schema is a one-time setup action
 *   that should be done in the Supabase dashboard or via Supabase CLI.
 */

import { createClient } from "@supabase/supabase-js";

function checkEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url.includes("your-project") || !key || key.includes("your-anon-key")) {
    console.error("\n❌ Missing Supabase credentials.");
    console.error("   Update .env.local with real values from https://supabase.com/dashboard/project/_/settings/api\n");
    process.exit(1);
  }

  return { url, key };
}

async function testConnection(url: string, key: string) {
  console.log("\n🔌 Testing Supabase connection...");
  try {
    const supabase = createClient(url, key);
    const { error } = await supabase.from("workspaces").select("count", { count: "exact", head: true });
    if (error) {
      console.error("   ❌ Connection failed:", error.message);
      console.error("   Hint: Have you run supabase-schema.sql in the SQL Editor?\n");
      process.exit(1);
    }
    console.log("   ✅ Connected successfully\n");
  } catch (e) {
    console.error("   ❌ Connection error:", e);
    process.exit(1);
  }
}

async function main() {
  const { url, key } = checkEnv();
  await testConnection(url, key);

  console.log("✅ Database connection looks good!");
  console.log("\nNext steps:");
  console.log("  1. Open Supabase Dashboard → SQL Editor");
  console.log("  2. Paste the contents of supabase-schema.sql");
  console.log("  3. Run it to create tables, RLS policies, and the storage bucket");
  console.log("  4. Enable Email auth (+ Google OAuth if needed) in Authentication → Providers");
  console.log('  5. Then run: npm run dev\n');
}

main();
