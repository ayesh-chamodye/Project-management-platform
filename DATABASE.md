# Database Setup

ProjectFlow uses Supabase PostgreSQL with Row Level Security (RLS).

## Prerequisites

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key from Project Settings → API

## Setup Steps

1. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

2. Run the database schema in Supabase SQL Editor:
   ```bash
   # Open supabase-schema.sql in your editor, then paste it into:
   # Supabase Dashboard → SQL Editor → New query → Run
   ```

3. Enable Email authentication (and optionally Google OAuth):
   - Supabase Dashboard → Authentication → Providers → Email
   - Enable "Confirm email" for production

4. Configure file storage (for attachments):
   ```sql
   insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false)
   on conflict (id) do nothing;
   ```
   Run the storage RLS policies from `supabase-schema.sql`.

5. Verify connection:
   ```bash
   npm run db:check
   ```

6. (Optional) Seed demo data:
   ```bash
   npm run db:seed
   ```
   This creates a demo workspace, project, board, and tasks.

## Database Schema

The schema is defined in `supabase-schema.sql` and includes:
- `profiles` - User profiles (extends auth.users)
- `workspaces` - Team workspaces
- `workspace_members` - Workspace membership with roles
- `projects` - Projects within workspaces
- `boards` - Kanban boards within projects
- `columns` - Board columns (To Do, In Progress, Done)
- `tasks` - Tasks within columns
- `comments` - Task comments
- `attachments` - Task file attachments
- `activity_logs` - Activity tracking

All tables have RLS policies ensuring users can only access data from workspaces they belong to.
