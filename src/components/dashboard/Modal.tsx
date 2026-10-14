"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Loader2, X } from "lucide-react";

// Reusable native <dialog> wrapper — Esc, backdrop click, and focus trapping
// are handled by the browser.
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`${wide ? "w-full max-w-2xl" : "w-full max-w-md"} rounded-xl p-0 shadow-2xl backdrop:bg-slate-900/50`}
      style={{ backgroundColor: "var(--color-card)", color: "var(--color-card-foreground)", border: "1px solid var(--color-border)" }}
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-4 border-b px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm" style={{ color: "var(--color-muted-foreground)" }}>{description}</p>}
        </div>
        <button onClick={onClose} className="rounded p-1 hover:opacity-70" aria-label="Close dialog">
          <X className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
        </button>
      </div>
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
          {footer}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  destructive,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <button onClick={onCancel} className="btn-secondary text-sm" disabled={busy}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: destructive ? "var(--color-danger)" : "var(--color-primary)" }}
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
        {description}
      </p>
    </Modal>
  );
}
