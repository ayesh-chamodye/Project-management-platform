import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  try {
    const session = await auth.api.getSession({ headers: {} });
    
    if (!session) {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  const { workspaceId } = await params;
  redirect(`/workspace/${workspaceId}/dashboard`);
}
