import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { logActivity } from "./activity";
import type { Workspace, WorkspaceMember } from "./types";

const firestore = db!;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
}

export async function listMyWorkspaces(userId: string): Promise<Workspace[]> {
  const q = query(
    collection(firestore, "workspaces"),
    where("memberIds", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Workspace, "id">) }));
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const snap = await getDoc(doc(firestore, "workspaces", workspaceId));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Workspace, "id">) } : null;
}

export async function createWorkspace(userId: string, name: string): Promise<string> {
  const ref = await addDoc(collection(firestore, "workspaces"), {
    name,
    slug: slugify(name),
    ownerId: userId,
    memberIds: [userId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(firestore, "workspace_members"), {
    workspaceId: ref.id,
    userId,
    role: "owner",
    joinedAt: serverTimestamp(),
  });

  await logActivity(ref.id, userId, "created_workspace", "project", ref.id, name);
  return ref.id;
}

export async function updateWorkspace(workspaceId: string, data: Partial<Pick<Workspace, "name">>) {
  await updateDoc(doc(firestore, "workspaces", workspaceId), {
    ...data,
    ...(data.name ? { slug: slugify(data.name) } : {}),
    updatedAt: serverTimestamp(),
  });
}

// Every signed-in user gets a workspace on first dashboard visit.
export async function ensureWorkspace(userId: string): Promise<Workspace> {
  const workspaces = await listMyWorkspaces(userId);
  if (workspaces.length > 0) return workspaces[0];

  const id = await createWorkspace(userId, "My Workspace");
  const workspace = await getWorkspace(id);
  if (!workspace) throw new Error("Failed to create workspace");
  return workspace;
}

export async function listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const q = query(
    collection(firestore, "workspace_members"),
    where("workspaceId", "==", workspaceId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkspaceMember, "id">) }));
}

export async function findUserByEmail(email: string): Promise<string | null> {
  const q = query(collection(firestore, "users"), where("email", "==", email), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
}

export async function addWorkspaceMember(workspaceId: string, userId: string, actorId: string, role: WorkspaceMember["role"] = "member") {
  const existing = await listWorkspaceMembers(workspaceId);
  if (existing.some((m) => m.userId === userId)) return;

  await addDoc(collection(firestore, "workspace_members"), {
    workspaceId,
    userId,
    role,
    joinedAt: serverTimestamp(),
  });

  await updateDoc(doc(firestore, "workspaces", workspaceId), {
    memberIds: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });

  await logActivity(workspaceId, actorId, "added_member", "member", userId, userId);
}

export async function removeWorkspaceMember(workspaceId: string, memberId: string, userId: string, actorId: string) {
  await deleteDoc(doc(firestore, "workspace_members", memberId));
  await updateDoc(doc(firestore, "workspaces", workspaceId), {
    memberIds: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  });
  await logActivity(workspaceId, actorId, "removed_member", "member", userId, userId);
}
