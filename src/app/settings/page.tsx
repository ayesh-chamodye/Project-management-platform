import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  try {
    const session = await auth.api.getSession({ headers: {} });
    
    if (!session) {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p style={{ color: "var(--color-muted-foreground)" }}>
          Settings page coming soon
        </p>
      </div>
    </div>
  );
}
