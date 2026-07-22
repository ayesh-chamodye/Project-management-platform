import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { createSupabaseClient } from "@/lib/supabase/server";

export default async function WorkspaceSelectPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createSupabaseClient();
  const { data: members } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id);

  const workspaces = (members || []) as Array<{ workspace_id: string }>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 4a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">ProjectFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user.name}
            </span>
            {user.profile?.avatar_url && (
              <div
                className="h-8 w-8 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${user.profile.avatar_url})` }}
              />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Welcome back, {user.name}!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Select a workspace to get started
            </p>
          </div>

          {workspaces.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No workspaces yet
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Create your first workspace to start managing projects
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workspaces.map((ws) => (
                <WorkspaceCard key={ws.workspace_id} workspaceId={ws.workspace_id} userId={user.id} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <CreateWorkspaceForm />
          </div>
        </div>
      </main>
    </div>
  );
}

async function WorkspaceCard({ workspaceId, userId }: { workspaceId: string; userId: string }) {
  const supabase = await createSupabaseClient();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (!workspace) return null;

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();

  return (
    <a
      href={`/workspace/${workspace.id}/dashboard`}
      className="block bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            {workspace.name[0]}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {workspace.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              /{workspace.slug}
            </p>
          </div>
        </div>
        {member?.role === "owner" && (
          <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full">
            Owner
          </span>
        )}
      </div>
    </a>
  );
}

function CreateWorkspaceForm() {
  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (!name) return;

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const data = await res.json();
        window.location.href = `/workspace/${data.workspace.id}/dashboard`;
      }
    } catch {}
  }

  return (
    <form action={handleCreate}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          name="name"
          placeholder="Workspace name"
          required
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Workspace
        </button>
      </div>
    </form>
  );
}
