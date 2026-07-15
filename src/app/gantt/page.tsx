"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import { Calendar, ChevronRight } from "lucide-react";

export default function GanttPage() {
  const supabase = getSupabaseClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [projectsRes, tasksRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/dashboard/tasks?limit=100"),
      ]);

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
      }
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
      }
      setLoading(false);
    };
    loadData();
  }, [supabase]);

  const tasksByProject = projects.map((project) => ({
    ...project,
    tasks: tasks.filter((t: any) => t.project_id === project.id),
  }));

  const allDates = tasks.filter((t: any) => t.due_date).map((t: any) => new Date(t.due_date).getTime());
  const minDate = allDates.length ? Math.min(...allDates) - 7 * 24 * 60 * 60 * 1000 : Date.now();
  const maxDate = allDates.length ? Math.max(...allDates) + 7 * 24 * 60 * 60 * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000;

  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr).getTime();
    return ((date - minDate) / (maxDate - minDate)) * 100;
  };

  const days = Math.ceil((maxDate - minDate) / (24 * 60 * 60 * 1000));
  const ticks = [];
  for (let i = 0; i <= Math.min(days, 30); i += Math.max(1, Math.floor(days / 10))) {
    const date = new Date(minDate + i * 24 * 60 * 60 * 1000);
    ticks.push({ date, position: (i / days) * 100 });
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>Gantt Chart</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Project timeline overview</p>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-muted-foreground)" }}>Loading...</p>
        ) : (
          <div className="surface rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <div style={{ minWidth: `${Math.max(800, days * 20)}px` }}>
                <div className="flex border-b" style={{ borderColor: "var(--color-border)" }}>
                  <div className="w-64 p-4 font-semibold text-sm sticky left-0 z-10" style={{ backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}>
                    Task / Project
                  </div>
                  <div className="flex-1 relative h-12">
                    {ticks.map((tick, i) => (
                      <div key={i} className="absolute top-0 h-full border-l" style={{ left: `${tick.position}%`, borderColor: "var(--color-border)" }}>
                        <span className="text-xs mt-2 ml-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                          {tick.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {tasksByProject.map((project) => (
                  <div key={project.id}>
                    <div className="flex border-b" style={{ borderColor: "var(--color-border)" }}>
                      <div className="w-64 p-3 font-medium text-sm sticky left-0 flex items-center gap-2" style={{ backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}>
                        <ChevronRight className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
                        <Calendar className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                        {project.name}
                      </div>
                      <div className="flex-1 h-8 relative">
                        {project.tasks.filter((t: any) => t.due_date).map((task: any) => {
                          const left = getPosition(task.due_date);
                          return (
                            <div
                              key={task.id}
                              className="absolute top-1 h-6 rounded-md text-xs px-2 flex items-center truncate"
                              style={{
                                left: `${left}%`,
                                width: "60px",
                                backgroundColor: task.status === "done" ? "var(--color-success)" : "var(--color-primary)",
                                color: "white",
                              }}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {project.tasks.map((task: any) => (
                      <div key={task.id} className="flex border-b" style={{ borderColor: "var(--color-border)" }}>
                        <div className="w-64 p-3 text-sm sticky left-0 pl-10" style={{ backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}>
                          <a href={`/task/${task.id}`} className="hover:underline" style={{ color: "var(--color-primary)" }}>
                            {task.title}
                          </a>
                        </div>
                        <div className="flex-1 h-8 relative">
                          {task.due_date && (
                            <div
                              className="absolute top-1 h-6 rounded-md"
                              style={{
                                left: `${getPosition(task.due_date)}%`,
                                width: "12px",
                                backgroundColor: task.status === "done" ? "var(--color-success)" : task.status === "in_progress" ? "var(--color-warning)" : "var(--color-primary)",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {tasksByProject.length === 0 && (
                  <div className="p-8 text-center">
                    <Calendar className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-muted-foreground)" }} />
                    <p style={{ color: "var(--color-muted-foreground)" }}>No projects or tasks with due dates yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
