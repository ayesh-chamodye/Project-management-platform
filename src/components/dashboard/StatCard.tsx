import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="surface rounded-xl p-4" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
          {label}
        </p>
        <Icon className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: "var(--color-foreground)" }}>
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function SectionCard({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="surface rounded-xl" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>{title}</h2>
          {description && <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
