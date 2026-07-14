"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email?: string;
  user_metadata?: { name?: string; avatar_url?: string };
}

export default function ProfileClient({ user }: { user: User }) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [name, setName] = useState(user.user_metadata?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      data: { name, avatar_url: avatarUrl },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile updated successfully");
    }
    setSaving(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <nav className="bg-white dark:bg-zinc-900 shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Dashboard</Link>
          <button onClick={handleLogout} className="text-sm border px-3 py-1 rounded">Logout</button>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
          {message && <div className="mb-4 text-sm text-indigo-600">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={user.email || ""} disabled className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
              <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            {avatarUrl && <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />}
            <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
