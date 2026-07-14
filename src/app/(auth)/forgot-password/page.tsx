"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const supabase = getSupabaseClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for the reset link.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2 mb-6" style={{ color: "var(--color-muted-foreground)" }}>
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
          <h2 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>Reset password</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted-foreground)" }}>We'll send you a reset link</p>
        </div>

        <div className="surface rounded-xl p-8 space-y-6">
          {message && <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(22, 163, 74, 0.1)", color: "var(--color-success)", border: "1px solid rgba(22, 163, 74, 0.2)" }}>{message}</div>}
          {error && <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "var(--color-danger)", border: "1px solid rgba(220, 38, 38, 0.2)" }}>{error}</div>}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "var(--color-muted-foreground)" }} />
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">Send reset link</button>
          </form>
        </div>
      </div>
    </div>
  );
}
