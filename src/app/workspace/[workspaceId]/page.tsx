import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export default async function WorkspacePage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) redirect("/login");

  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>Workspace</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          Select a section from the sidebar to get started.
        </p>
      </div>
    );
  } catch {
    redirect("/login");
  }
}
