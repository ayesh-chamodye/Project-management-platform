import { addDoc, collection, getDocs, limit, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Activity } from "./types";

const firestore = db!;

export type ActivityAction =
  | "created_workspace"
  | "updated_workspace"
  | "created_project"
  | "updated_project"
  | "deleted_project"
  | "archived_project"
  | "created_task"
  | "updated_task"
  | "completed_task"
  | "deleted_task"
  | "added_member"
  | "removed_member"
  | "joined_workspace";

export async function logActivity(
  workspaceId: string,
  actorId: string,
  action: ActivityAction,
  entityType: Activity["entityType"],
  entityId: string,
  entityName: string
) {
  await addDoc(collection(firestore, "activity"), {
    workspaceId,
    actorId,
    action,
    entityType,
    entityId,
    entityName,
    createdAt: serverTimestamp(),
  });
}

// Sorted client-side: where + orderBy on different fields requires a composite
// index. A larger window is fetched first so the sort keeps the newest items.
export async function listRecentActivity(workspaceId: string, max = 30): Promise<Activity[]> {
  const q = query(collection(firestore, "activity"), where("workspaceId", "==", workspaceId), limit(Math.max(max, 100)));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Activity, "id">) }))
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
    .slice(0, max);
}
