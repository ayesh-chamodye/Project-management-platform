import Link from "next/link";
import { ArrowRight, Zap, Users, BarChart3, Shield, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
        <div className="absolute -bottom-20 right-1/4 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
      </div>

      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FlowBoard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium px-5 py-2.5 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Now with Firebase & Vercel Blob</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
              Manage projects with{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                FlowBoard
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              The modern project management platform for teams. Organize tasks, collaborate in real-time, and ship faster with Firebase-powered infrastructure.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold hover:bg-gray-100 transition-all shadow-xl shadow-white/10 flex items-center gap-2"
              >
                Start for free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/10 text-white rounded-2xl font-semibold hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm"
              >
                Sign in
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8">
              <div className="flex -space-x-3">
                {["bg-indigo-500", "bg-purple-500", "bg-cyan-500", "bg-pink-500"].map((color, i) => (
                  <div key={i} className={`h-10 w-10 rounded-full ${color} border-2 border-gray-900 flex items-center justify-center text-white text-xs font-medium`}>
                    {["JD", "SM", "AK", "MR"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                <span className="text-white font-semibold">2,000+</span> teams already using FlowBoard
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Kanban Boards",
                desc: "Drag and drop tasks between columns with smooth animations and real-time sync.",
                color: "from-indigo-500 to-blue-500",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                desc: "Invite team members, assign tasks, and collaborate in real-time with Firebase.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Shield,
                title: "Secure by Default",
                desc: "Google authentication with Firebase Auth. Enterprise-grade security out of the box.",
                color: "from-cyan-500 to-teal-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all duration-300"
              >
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for modern teams</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Everything you need to manage projects, track tasks, and hit deadlines.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Workspaces", value: "Unlimited" },
              { label: "Projects", value: "Unlimited" },
              { label: "Tasks", value: "Unlimited" },
              { label: "Storage", value: "Vercel Blob" },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="relative p-12 rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)" }}>
            <div className="absolute inset-0 border border-white/10 rounded-3xl" />
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                Join thousands of teams already using FlowBoard to manage their projects.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold hover:bg-gray-100 transition-all shadow-xl shadow-white/10"
              >
                Start for free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <p className="text-sm text-gray-500"> FlowBoard. Built with Next.js, Firebase & Vercel Blob.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
