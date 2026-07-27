import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  try {
    const session = await auth.api.getSession({ headers: {} });
    
    if (!session) {
      redirect("/login");
    }

    return <DashboardClient user={{ ...session.user, image: session.user.image ?? undefined }} />;
  } catch {
    redirect("/login");
  }
}
