import { DashboardClient } from "@/components/DashboardClient";

export default function DashboardPage() {
  return <DashboardClient user={{ uid: "", email: "", displayName: "", photoURL: "" }} />;
}
