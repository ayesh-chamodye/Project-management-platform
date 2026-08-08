import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import WorkspaceLayoutClient from "./layout-client";

export default async function WorkspaceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ workspaceId: string }> }) {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) redirect("/login");

  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
    const { workspaceId } = await params;
    const workspace = { id: workspaceId, name: "Workspace", slug: "workspace" };
    return <WorkspaceLayoutClient workspace={workspace}>{children}</WorkspaceLayoutClient>;
  } catch {
    redirect("/login");
  }
}
