import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || url.includes("your-project") || !key || key.includes("your-anon-key")) {
  console.error("\n❌ Missing Supabase credentials in .env.local\n");
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  console.log("Seeding ProjectFlow demo data...\n");

  const demoUserId = "00000000-0000-0000-0000-000000000001";
  const workspaceId = "00000000-0000-0000-0000-000000000002";
  const projectId = "00000000-0000-0000-0000-000000000003";
  const boardId = "00000000-0000-0000-0000-000000000004";
  const columnTodoId = "00000000-0000-0000-0000-000000000005";
  const columnProgressId = "00000000-0000-0000-0000-000000000006";
  const columnDoneId = "00000000-0000-0000-0000-000000000007";
  const task1Id = "00000000-0000-0000-0000-000000000008";
  const task2Id = "00000000-0000-0000-0000-000000000009";
  const comment1Id = "00000000-0000-0000-0000-000000000010";

  try {
    const { error: usersError } = await supabase.from("users").upsert({
      id: demoUserId,
      name: "Demo User",
      email: "demo@example.com",
      image: null,
      password: null,
    });

    if (usersError) {
      console.error("User seed failed:", usersError.message);
      process.exit(1);
    }

    const { error: wsError } = await supabase.from("workspaces").upsert({
      id: workspaceId,
      name: "Demo Workspace",
      slug: "demo-workspace",
      icon: null,
      owner_id: demoUserId,
    });

    if (wsError) {
      console.error("Workspace seed failed:", wsError.message);
      process.exit(1);
    }
    console.log("✅ Workspace created");

    const { error: memberError } = await supabase.from("workspace_members").upsert({
      workspace_id: workspaceId,
      user_id: demoUserId,
      role: "owner",
    });

    if (memberError) {
      console.error("Workspace member seed failed:", memberError.message);
      process.exit(1);
    }
    console.log("✅ Workspace member created");

    const { error: projectError } = await supabase.from("projects").upsert({
      id: projectId,
      name: "Demo Project",
      description: "A sample project to explore ProjectFlow.",
      color: "#6366f1",
      workspace_id: workspaceId,
      created_by_id: demoUserId,
    });

    if (projectError) {
      console.error("Project seed failed:", projectError.message);
      process.exit(1);
    }
    console.log("✅ Project created");

    const { error: boardError } = await supabase.from("boards").upsert({
      id: boardId,
      name: "Demo Board",
      description: "Demo Kanban board",
      project_id: projectId,
      created_by_id: demoUserId,
    });

    if (boardError) {
      console.error("Board seed failed:", boardError.message);
      process.exit(1);
    }
    console.log("✅ Board created");

    const columns = [
      { id: columnTodoId, name: "To Do", position: 0, board_id: boardId },
      { id: columnProgressId, name: "In Progress", position: 1, board_id: boardId },
      { id: columnDoneId, name: "Done", position: 2, board_id: boardId },
    ];

    for (const col of columns) {
      const { error } = await supabase.from("columns").upsert(col);
      if (error) {
        console.error("Column seed failed:", error.message);
        process.exit(1);
      }
    }
    console.log("✅ Columns created");

    const tasks = [
      { id: task1Id, title: "Welcome to ProjectFlow", description: "This is a demo task.", priority: "medium", status: "todo", position: 0, column_id: columnTodoId, created_by_id: demoUserId },
      { id: task2Id, title: "Try drag and drop", description: "Move me to In Progress!", priority: "high", status: "in_progress", position: 0, column_id: columnProgressId, created_by_id: demoUserId },
    ];

    for (const task of tasks) {
      const { error } = await supabase.from("tasks").upsert(task);
      if (error) {
        console.error("Task seed failed:", error.message);
        process.exit(1);
      }
    }
    console.log("✅ Tasks created");

    const { error: commentError } = await supabase.from("comments").upsert({
      id: comment1Id,
      content: "This is a demo comment. Try adding more!",
      task_id: task1Id,
      author_id: demoUserId,
    });

    if (commentError) {
      console.error("Comment seed failed:", commentError.message);
      process.exit(1);
    }
    console.log("✅ Comment created");

    console.log("\n🎉 Seeding completed successfully!");
    console.log("   Workspace: Demo Workspace");
    console.log("   Project: Demo Project");
    console.log("   Board: Demo Board");
    console.log("   Tasks: 2 demo tasks");
    console.log("   Comment: 1 demo comment\n");
  } catch (e) {
    console.error("Unexpected error:", e);
    process.exit(1);
  }
}

seed();
