import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
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

export async function listRecentActivity(workspaceId: string, max = 30): Promise<Activity[]> {
  const q = query(
    collection(firestore, "activity"),
    where("workspaceId", "==", workspaceId),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Activity, "id">) }));
}
