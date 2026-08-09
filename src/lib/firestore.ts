import { adminDb } from "./firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function getUser(userId: string) {
  const doc = await adminDb.collection("users").doc(userId).get();
  return doc.exists ? doc.data() : null;
}

export async function createUser(userId: string, data: Record<string, unknown>) {
  await adminDb.collection("users").doc(userId).set({
    ...data,
    uid: userId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function updateUser(userId: string, data: Record<string, unknown>) {
  await adminDb.collection("users").doc(userId).set(data, { merge: true });
}

export async function getWorkspaces(userId: string) {
  const snapshot = await adminDb.collection("workspaces").get();
  const workspaces: any[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const memberSnap = await adminDb.collection("workspace_members").where("workspaceId", "==", doc.id).where("userId", "==", userId).get();
    if (!memberSnap.empty || data.ownerId === userId) {
      workspaces.push({ id: doc.id, ...data });
    }
  }
  return workspaces;
}

export async function getWorkspace(workspaceId: string) {
  const doc = await adminDb.collection("workspaces").doc(workspaceId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createWorkspace(data: Record<string, unknown>) {
  const docRef = await adminDb.collection("workspaces").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function updateWorkspace(workspaceId: string, data: Record<string, unknown>) {
  await adminDb.collection("workspaces").doc(workspaceId).set(data, { merge: true });
}

export async function deleteWorkspace(workspaceId: string) {
  await adminDb.collection("workspaces").doc(workspaceId).delete();
}

export async function getProjects(workspaceId: string) {
  const snapshot = await adminDb.collection("projects").where("workspaceId", "==", workspaceId).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function getProject(projectId: string) {
  const doc = await adminDb.collection("projects").doc(projectId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createProject(data: Record<string, unknown>) {
  const docRef = await adminDb.collection("projects").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProject(projectId: string, data: Record<string, unknown>) {
  await adminDb.collection("projects").doc(projectId).set(data, { merge: true });
}

export async function deleteProject(projectId: string) {
  await adminDb.collection("projects").doc(projectId).delete();
}

export async function getTasks(columnId: string) {
  const snapshot = await adminDb.collection("columns").doc(columnId).collection("tasks").orderBy("position", "asc").get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function getTask(taskId: string) {
  const doc = await adminDb.collection("tasks").doc(taskId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createTask(data: Record<string, unknown>) {
  const docRef = await adminDb.collection("tasks").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTask(taskId: string, data: Record<string, unknown>) {
  await adminDb.collection("tasks").doc(taskId).set(data, { merge: true });
}

export async function deleteTask(taskId: string) {
  await adminDb.collection("tasks").doc(taskId).delete();
}

export async function getComments(taskId: string) {
  const snapshot = await adminDb.collection("tasks").doc(taskId).collection("comments").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function createComment(taskId: string, data: Record<string, unknown>) {
  const docRef = await adminDb.collection("tasks").doc(taskId).collection("comments").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function getAttachments(taskId: string) {
  const snapshot = await adminDb.collection("tasks").doc(taskId).collection("attachments").get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function createAttachment(taskId: string, data: Record<string, unknown>) {
  const docRef = await adminDb.collection("tasks").doc(taskId).collection("attachments").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteAttachment(taskId: string, attachmentId: string) {
  await adminDb.collection("tasks").doc(taskId).collection("attachments").doc(attachmentId).delete();
}

export async function getBoardColumns(boardId: string) {
  const snapshot = await adminDb.collection("boards").doc(boardId).collection("columns").orderBy("position", "asc").get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function createBoardColumn(boardId: string, data: Record<string, unknown>) {
  const docRef = await adminDb.collection("boards").doc(boardId).collection("columns").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function updateBoardColumn(boardId: string, columnId: string, data: Record<string, unknown>) {
  await adminDb.collection("boards").doc(boardId).collection("columns").doc(columnId).set(data, { merge: true });
}

export async function deleteBoardColumn(boardId: string, columnId: string) {
  await adminDb.collection("boards").doc(boardId).collection("columns").doc(columnId).delete();
}

export async function getWorkspaceMembers(workspaceId: string) {
  const snapshot = await adminDb.collection("workspace_members").where("workspaceId", "==", workspaceId).get();
  const members: any[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data() as Record<string, unknown>;
    const user = await getUser(data.userId as string);
    members.push({ id: doc.id, ...data, user });
  }
  return members;
}

export async function addWorkspaceMember(workspaceId: string, userId: string, role: string = "member") {
  await adminDb.collection("workspace_members").add({
    workspaceId,
    userId,
    role,
    joinedAt: FieldValue.serverTimestamp(),
  });
}

export async function removeWorkspaceMember(workspaceId: string, memberId: string) {
  await adminDb.collection("workspace_members").doc(memberId).delete();
}
