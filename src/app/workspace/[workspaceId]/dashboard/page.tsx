import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth";

export default async function WorkspaceDashboard({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const { workspaceId } = await params;

  redirect(`/workspace/${workspaceId}/projects`);
}
