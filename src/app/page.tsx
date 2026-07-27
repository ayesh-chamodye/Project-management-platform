import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  try {
    const session = await auth.api.getSession({ headers: {} });
    
    if (session) {
      redirect("/dashboard");
    }
  } catch {
    // ignore
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 4a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="text-xl font-bold">FlowBoard</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium hover:opacity-80">
              Sign in
            </a>
            <a
              href="/register"
              className="text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:opacity-90"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Manage projects with
              <span className="text-indigo-600"> FlowBoard</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The modern project management tool for teams. Organize tasks, collaborate in real-time, and ship faster.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <a
              href="/register"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:opacity-90"
            >
              Start for free
            </a>
            <a
              href="/login"
              className="px-8 py-3 border rounded-lg font-medium hover:opacity-80"
            >
              Sign in
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 4a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Kanban Boards</h3>
              <p className="text-sm text-gray-600">Drag and drop tasks between columns with ease.</p>
            </div>

            <div className="space-y-2">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Team Collaboration</h3>
              <p className="text-sm text-gray-600">Invite team members and work together in real-time.</p>
            </div>

            <div className="space-y-2">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-gray-600">Track progress with beautiful charts and insights.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
