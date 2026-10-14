"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
}

interface ToastContextValue {
  toast: (message: string, tone?: Toast["tone"]) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="surface flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg min-w-64 max-w-sm"
            style={{ borderColor: "var(--color-border)" }}
          >
            {t.tone === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--color-success)" }} />}
            {t.tone === "error" && <XCircle className="h-4 w-4 shrink-0" style={{ color: "var(--color-danger)" }} />}
            {t.tone === "info" && <Info className="h-4 w-4 shrink-0" style={{ color: "var(--color-primary)" }} />}
            <p className="text-sm flex-1" style={{ color: "var(--color-foreground)" }}>{t.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="shrink-0 rounded p-0.5 hover:opacity-70"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" style={{ color: "var(--color-muted-foreground)" }} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
