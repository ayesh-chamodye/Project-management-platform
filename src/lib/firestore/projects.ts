import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { logActivity } from "./activity";
import type { Project, ProjectStatus } from "./types";

const firestore = db!;

// Sorted client-side: a where + orderBy on different fields needs a composite index.
export async function listProjects(workspaceId: string, max = 100): Promise<Project[]> {
  const q = query(collection(firestore, "projects"), where("workspaceId", "==", workspaceId), limit(max));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Project, "id">) }))
    .sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0));
}

export async function getProject(projectId: string): Promise<Project | null> {
  const snap = await getDoc(doc(firestore, "projects", projectId));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Project, "id">) } : null;
}

export async function createProject(
  workspaceId: string,
  userId: string,
  data: { name: string; description: string; status?: ProjectStatus; startDate?: Date | null; dueDate?: Date | null }
): Promise<string> {
  const ref = await addDoc(collection(firestore, "projects"), {
    workspaceId,
    name: data.name,
    description: data.description,
    status: data.status ?? "active",
    startDate: data.startDate ?? null,
    dueDate: data.dueDate ?? null,
    ownerId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await logActivity(workspaceId, userId, "created_project", "project", ref.id, data.name);
  return ref.id;
}

export async function updateProject(
  projectId: string,
  workspaceId: string,
  userId: string,
  data: Partial<Pick<Project, "name" | "description" | "status" | "ownerId">> & { startDate?: Date | null; dueDate?: Date | null }
) {
  await updateDoc(doc(firestore, "projects", projectId), { ...data, updatedAt: serverTimestamp() });
  await logActivity(workspaceId, userId, "updated_project", "project", projectId, data.name ?? projectId);
}

export async function archiveProject(projectId: string, workspaceId: string, userId: string, name: string) {
  await updateDoc(doc(firestore, "projects", projectId), { status: "archived", updatedAt: serverTimestamp() });
  await logActivity(workspaceId, userId, "archived_project", "project", projectId, name);
}

export async function deleteProject(projectId: string, workspaceId: string, userId: string, name: string) {
  await deleteDoc(doc(firestore, "projects", projectId));

  const tasks = query(collection(firestore, "tasks"), where("projectId", "==", projectId), limit(200));
  const snap = await getDocs(tasks);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));

  await logActivity(workspaceId, userId, "deleted_project", "project", projectId, name);
}
