import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  const _ = await params;

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
