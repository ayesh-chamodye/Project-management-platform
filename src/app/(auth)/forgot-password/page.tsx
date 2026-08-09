import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
      </div>

      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 4a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FlowBoard</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-white">Forgot password?</h1>
            <p className="mt-2 text-gray-400">Enter your email and we&apos;ll send you a reset link.</p>
          </div>

          <div className="surface rounded-xl p-8 space-y-6">
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "var(--color-muted-foreground)" }} />
                  <input
                    id="email"
                    type="email"
                    required
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Send Reset Link</button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400">
            Remember your password?{" "}
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
