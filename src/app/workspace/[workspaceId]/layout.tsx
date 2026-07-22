import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";
import { createSupabaseClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const { workspaceId } = await params;
  const supabase = await createSupabaseClient();

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    redirect("/workspace/dashboard");
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    redirect("/workspace/dashboard");
  }

  const workspaceWithOwner = {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    icon: workspace.icon,
    ownerId: workspace.owner_id,
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar workspace={workspaceWithOwner} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
