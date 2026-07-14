"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsClient({ user }: any) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <nav className="bg-white dark:bg-zinc-900 shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Settings</h1>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Dashboard</Link>
          <Link href="/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Profile</Link>
          <button onClick={handleLogout} className="text-sm border px-3 py-1 rounded">Logout</button>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Workspace Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Workspace Name</label>
              <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invite Member</label>
              <div className="flex gap-2">
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="colleague@example.com" />
                <button className="bg-indigo-600 text-white px-4 py-2 rounded">Invite</button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Members</h3>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{member.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
