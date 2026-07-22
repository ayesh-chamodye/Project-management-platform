-- Supabase SQL migration for ProjectFlow
-- Run this in your Supabase project SQL Editor

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) primary key,
  name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Workspaces
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  owner_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.workspaces enable row level security;

create policy "Members can view workspaces"
  on public.workspaces for select
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = id and user_id = auth.uid()
  ));

create policy "Owners can update workspaces"
  on public.workspaces for update
  using (owner_id = auth.uid());

create policy "Owners can delete workspaces"
  on public.workspaces for delete
  using (owner_id = auth.uid());

-- Workspace Members
create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member',
  joined_at timestamp with time zone default now(),
  unique(workspace_id, user_id)
);

alter table public.workspace_members enable row level security;

create policy "Members can view workspace members"
  on public.workspace_members for select
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = workspace_members.workspace_id and user_id = auth.uid()
  ));

create policy "Owners and admins can manage members"
  on public.workspace_members for all
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = workspace_members.workspace_id and user_id = auth.uid() and role in ('owner', 'admin')
  ));

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text default '#6366f1',
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  created_by_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.projects enable row level security;

create policy "Members can view projects"
  on public.projects for select
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = projects.workspace_id and user_id = auth.uid()
  ));

create policy "Members can create projects"
  on public.projects for insert
  with check (exists (
    select 1 from public.workspace_members
    where workspace_id = projects.workspace_id and user_id = auth.uid()
  ));

create policy "Owners and admins can update projects"
  on public.projects for update
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = projects.workspace_id and user_id = auth.uid() and role in ('owner', 'admin')
  ));

create policy "Owners and admins can delete projects"
  on public.projects for delete
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = projects.workspace_id and user_id = auth.uid() and role in ('owner', 'admin')
  ));

-- Boards
create table public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  project_id uuid references public.projects(id) on delete cascade not null,
  created_by_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.boards enable row level security;

create policy "Members can view boards"
  on public.boards for select
  using (exists (
    select 1 from public.projects p
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where p.id = boards.project_id and wm.user_id = auth.uid()
  ));

create policy "Members can create boards"
  on public.boards for insert
  with check (exists (
    select 1 from public.projects p
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where p.id = boards.project_id and wm.user_id = auth.uid()
  ));

create policy "Members can update boards"
  on public.boards for update
  using (exists (
    select 1 from public.projects p
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where p.id = boards.project_id and wm.user_id = auth.uid()
  ));

create policy "Members can delete boards"
  on public.boards for delete
  using (exists (
    select 1 from public.projects p
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where p.id = boards.project_id and wm.user_id = auth.uid() and wm.role in ('owner', 'admin')
  ));

-- Columns
create table public.columns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text,
  position integer not null default 0,
  board_id uuid references public.boards(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.columns enable row level security;

create policy "Members can view columns"
  on public.columns for select
  using (exists (
    select 1 from public.boards b
    join public.projects p on b.project_id = p.id
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where b.id = columns.board_id and wm.user_id = auth.uid()
  ));

create policy "Members can manage columns"
  on public.columns for all
  using (exists (
    select 1 from public.boards b
    join public.projects p on b.project_id = p.id
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where b.id = columns.board_id and wm.user_id = auth.uid()
  ));

-- Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority text not null default 'medium',
  status text not null default 'todo',
  position integer not null default 0,
  due_date timestamp with time zone,
  assignee_id uuid references auth.users(id),
  column_id uuid references public.columns(id) on delete cascade not null,
  created_by_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.tasks enable row level security;

create policy "Members can view tasks"
  on public.tasks for select
  using (exists (
    select 1 from public.columns c
    join public.boards b on c.board_id = b.id
    join public.projects p on b.project_id = p.id
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where c.id = tasks.column_id and wm.user_id = auth.uid()
  ));

create policy "Members can create tasks"
  on public.tasks for insert
  with check (exists (
    select 1 from public.columns c
    join public.boards b on c.board_id = b.id
    join public.projects p on b.project_id = p.id
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where c.id = tasks.column_id and wm.user_id = auth.uid()
  ));

create policy "Members can update tasks"
  on public.tasks for update
  using (exists (
    select 1 from public.columns c
    join public.boards b on c.board_id = b.id
    join public.projects p on b.project_id = p.id
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where c.id = tasks.column_id and wm.user_id = auth.uid()
  ));

create policy "Members can delete tasks"
  on public.tasks for delete
  using (exists (
    select 1 from public.columns c
    join public.boards b on c.board_id = b.id
    join public.projects p on b.project_id = p.id
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where c.id = tasks.column_id and wm.user_id = auth.uid() and wm.role in ('owner', 'admin')
  ));

-- Comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  task_id uuid references public.tasks(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.comments enable row level security;

create policy "Members can view comments"
  on public.comments for select
  using (exists (
    select 1 from public.tasks t
    join public.columns c on t.column_id = c.id
    join public.boards b on c.board_id = b.id
    join public.projects p on b.project_id = p.id
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where t.id = comments.task_id and wm.user_id = auth.uid()
  ));

create policy "Members can create comments"
  on public.comments for insert
  with check (exists (
    select 1 from public.tasks t
    join public.columns c on t.column_id = c.id
    join public.boards b on c.board_id = b.id
    join public.projects p on b.project_id = p.id
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where t.id = comments.task_id and wm.user_id = auth.uid()
  ));

create policy "Members can update own comments"
  on public.comments for update
  using (author_id = auth.uid());

create policy "Members can delete own comments"
  on public.comments for delete
  using (author_id = auth.uid() or exists (
    select 1 from public.workspace_members
    where workspace_id in (select p.workspace_id from public.projects p join public.boards b on p.id = b.project_id join public.columns c on b.id = c.board_id join public.tasks t on c.id = t.column_id where t.id = comments.task_id)
    and user_id = auth.uid() and role in ('owner', 'admin')
  ));

-- Attachments
create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  file_type text,
  file_size integer,
  task_id uuid references public.tasks(id) on delete cascade not null,
  uploaded_by_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now()
);

alter table public.attachments enable row level security;

create policy "Members can view attachments"
  on public.attachments for select
  using (exists (
    select 1 from public.tasks t
    join public.columns c on t.column_id = c.id
    join public.boards b on c.board_id = b.id
    join public.projects p on b.project_id = p.id
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where t.id = attachments.task_id and wm.user_id = auth.uid()
  ));

create policy "Members can create attachments"
  on public.attachments for insert
  with check (exists (
    select 1 from public.tasks t
    join public.columns c on t.column_id = c.id
    join public.boards b on c.board_id = b.id
    join public.projects p on b.project_id = p.id
    join public.workspace_members wm on p.workspace_id = wm.workspace_id
    where t.id = attachments.task_id and wm.user_id = auth.uid()
  ));

create policy "Members can delete attachments"
  on public.attachments for delete
  using (uploaded_by_id = auth.uid() or exists (
    select 1 from public.workspace_members
    where workspace_id in (select p.workspace_id from public.projects p join public.boards b on p.id = b.project_id join public.columns c on b.id = c.board_id join public.tasks t on c.id = t.column_id where t.id = attachments.task_id)
    and user_id = auth.uid() and role in ('owner', 'admin')
  ));

-- Activity Logs
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb,
  user_id uuid references auth.users(id) not null,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  created_at timestamp with time zone default now()
);

alter table public.activity_logs enable row level security;

create policy "Members can view activity logs"
  on public.activity_logs for select
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = activity_logs.workspace_id and user_id = auth.uid()
  ));

create policy "System can create activity logs"
  on public.activity_logs for insert
  with check (user_id = auth.uid());

-- Storage bucket for attachments
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "Authenticated users can upload attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'attachments' and auth.role() = 'authenticated'
  );

create policy "Members can view attachments"
  on storage.objects for select
  using (
    bucket_id = 'attachments' and
    exists (
      select 1 from public.attachments a
      join public.tasks t on a.task_id = t.id
      join public.columns c on t.column_id = c.id
      join public.boards b on c.board_id = b.id
      join public.projects p on b.project_id = p.id
      join public.workspace_members wm on p.workspace_id = wm.workspace_id
      where a.url = storage.objects.name and wm.user_id = auth.uid()
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
