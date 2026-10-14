import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";
import { logActivity } from "./activity";
import type { Task, TaskPriority, TaskStatus } from "./types";

const firestore = db!;

export async function listWorkspaceTasks(workspaceId: string, max = 500): Promise<Task[]> {
  const q = query(
    collection(firestore, "tasks"),
    where("workspaceId", "==", workspaceId),
    orderBy("updatedAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, "id">) }));
}

export async function listProjectTasks(projectId: string): Promise<Task[]> {
  const q = query(
    collection(firestore, "tasks"),
    where("projectId", "==", projectId),
    orderBy("position", "asc"),
    limit(200)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, "id">) }));
}

export interface CreateTaskInput {
  workspaceId: string;
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: Date | null;
  position?: number;
}

export async function createTask(input: CreateTaskInput): Promise<string> {
  const ref = await addDoc(collection(firestore, "tasks"), {
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    title: input.title,
    description: input.description ?? "",
    status: input.status ?? "todo",
    priority: input.priority ?? "medium",
    assigneeId: input.assigneeId ?? null,
    dueDate: input.dueDate ?? null,
    position: input.position ?? 0,
    createdBy: input.userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
  });

  await logActivity(input.workspaceId, input.userId, "created_task", "task", ref.id, input.title);
  return ref.id;
}

export async function updateTask(
  taskId: string,
  workspaceId: string,
  userId: string,
  data: Partial<Pick<Task, "title" | "description" | "status" | "priority" | "assigneeId" | "position">> & { dueDate?: Date | null },
  taskName: string
) {
  const completedAt = data.status === "done" ? serverTimestamp() : data.status ? null : undefined;
  await updateDoc(doc(firestore, "tasks", taskId), {
    ...data,
    ...(completedAt !== undefined ? { completedAt } : {}),
    updatedAt: serverTimestamp(),
  });
  await logActivity(
    workspaceId,
    userId,
    data.status === "done" ? "completed_task" : "updated_task",
    "task",
    taskId,
    data.title ?? taskName
  );
}

export async function deleteTask(taskId: string, workspaceId: string, userId: string, taskName: string) {
  await deleteDoc(doc(firestore, "tasks", taskId));
  await logActivity(workspaceId, userId, "deleted_task", "task", taskId, taskName);
}

// Moves a task to a status column and places it at the end of that column.
export async function moveTask(taskId: string, workspaceId: string, userId: string, status: TaskStatus, position: number, taskName: string) {
  await updateDoc(doc(firestore, "tasks", taskId), {
    status,
    position,
    ...(status === "done" ? { completedAt: serverTimestamp() } : { completedAt: null }),
    updatedAt: serverTimestamp(),
  });
  await logActivity(workspaceId, userId, status === "done" ? "completed_task" : "updated_task", "task", taskId, taskName);
}

// Persists the full column order after a drag-and-drop reorder in one batch.
export async function persistTaskOrder(updates: { id: string; status: TaskStatus; position: number }[]) {
  const batch = writeBatch(firestore);
  updates.forEach((u) => {
    batch.update(doc(firestore, "tasks", u.id), {
      status: u.status,
      position: u.position,
      ...(u.status === "done" ? { completedAt: serverTimestamp() } : { completedAt: null }),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}
