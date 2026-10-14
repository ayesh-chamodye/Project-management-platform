"use client";

import { PageHeader } from "@/components/dashboard/ui";
import { MyTasksList } from "@/components/dashboard/MyTasksList";
import { CreateTaskDialog } from "@/components/dashboard/CreateTaskDialog";
import { useState } from "react";
import { Plus } from "lucide-react";

export default function MyTasksPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Tasks"
        description="Everything assigned to you, filterable by due date and status."
        actions={
          <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm">
            <Plus className="h-4 w-4" />
            New task
          </button>
        }
      />
      <MyTasksList />
      <CreateTaskDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
