"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { BoardHeader } from "@/components/BoardHeader";
import { KanbanBoard } from "@/components/KanbanBoard";
import { useAuth } from "@/components/AuthProvider";

export default function ProjectBoardPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [board, setBoard] = useState<any>(null);

  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;

  const fetchProjectAndBoard = useCallback(async () => {
    try {
      const [projectRes, boardRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/projects/${projectId}`, { cache: "no-store" }),
        fetch(`/api/workspaces/${workspaceId}/boards?projectId=${projectId}`, { cache: "no-store" }),
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData.project);
      }

      if (boardRes.ok) {
        const boardData = await boardRes.json();
        if (boardData.boards && boardData.boards.length > 0) {
          setBoard(boardData.boards[0]);
        } else if (project) {
          const createRes = await fetch(`/api/workspaces/${workspaceId}/boards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: `${project.name || "Project"} Board`, projectId }),
          });
          if (createRes.ok) {
            const newBoard = await createRes.json();
            setBoard(newBoard.board);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch project and board:", error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, projectId, project]);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (workspaceId && projectId) {
      fetchProjectAndBoard();
    }
  }, [workspaceId, projectId, fetchProjectAndBoard]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-gray-600">The project you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BoardHeader project={project} board={board} />
      <main className="flex-1 overflow-auto">
        <KanbanBoard workspaceId={workspaceId} projectId={projectId} boardId={board.id} />
      </main>
    </div>
  );
}
