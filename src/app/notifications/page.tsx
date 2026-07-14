"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Bell, Check } from "lucide-react";

export default function NotificationsPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications || []);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id, isRead: true }),
    });
    setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>Notifications</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Stay updated with your projects</p>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-muted-foreground)" }}>Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="surface rounded-xl p-8 text-center">
            <Bell className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-muted-foreground)" }} />
            <p style={{ color: "var(--color-muted-foreground)" }}>No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="surface rounded-xl p-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>{notification.title}</h3>
                  <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>{notification.message}</p>
                  <p className="text-xs mt-2" style={{ color: "var(--color-muted-foreground)" }}>{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                {!notification.isRead && (
                  <button onClick={() => markAsRead(notification.id)} className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Check className="h-4 w-4" style={{ color: "var(--color-success)" }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
