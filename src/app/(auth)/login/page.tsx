import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { Layers } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
      </div>

      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FlowBoard</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="mt-2 text-gray-400">Sign in to your FlowBoard account</p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
