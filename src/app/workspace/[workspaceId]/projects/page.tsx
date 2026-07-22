"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, FolderKanban, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  workspaceId: string;
  created_at: string;
}

export default function ProjectsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [workspace, setWorkspace] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState("#6366f1");

  useEffect(() => {
    fetchWorkspace();
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  async function fetchWorkspace() {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      const data = await res.json();
      if (data.workspace) {
        setWorkspace(data.workspace);
      }
    } catch {}
  }

  async function fetchProjects() {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects`);
      const data = await res.json();
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName, description: newProjectDescription }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewProjectName("");
        setNewProjectDescription("");
        fetchProjects();
      }
    } catch {}
    finally {
      setCreating(false);
    }
  }

  async function updateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${editingProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription, color: editColor }),
      });

      if (res.ok) {
        setEditingProject(null);
        fetchProjects();
      }
    } catch {}
  }

  async function deleteProject(projectId: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProjects();
      }
    } catch {}
  }

  async function createBoard(projectId: string) {
    const name = prompt("Enter board name:");
    if (!name) return;

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        fetchProjects();
      }
    } catch {}
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {workspace?.name || "Projects"}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your projects and boards
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No projects yet</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Get started by creating your first project
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5"
                      style={{ backgroundColor: project.color || "#6366f1" }}
                    />
                    <div className="relative">
                      <button
                        onClick={() => {
                          setEditingProject(project);
                          setEditName(project.name);
                          setEditDescription(project.description || "");
                          setEditColor(project.color || "#6366f1");
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <Link href={`/workspace/${workspaceId}/projects/${project.id}`}>
                    <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                      {project.name}
                    </h3>
                  </Link>

                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {project.description || "No description"}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {project.created_at}
                      </span>
                      <button
                        onClick={() => createBoard(project.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        + Add Board
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Create New Project
            </h2>
            <form onSubmit={createProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="My Awesome Project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Describe your project..."
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Edit Project
            </h2>
            <form onSubmit={updateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    deleteProject(editingProject.id);
                  }}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
