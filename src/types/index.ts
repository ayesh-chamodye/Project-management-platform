export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  icon?: string;
  role?: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  workspaceId: string;
  createdById: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  createdById: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Column {
  id: string;
  name: string;
  color?: string;
  position: string;
  boardId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status?: string;
  position: string;
  dueDate?: string;
  assigneeId?: string;
  columnId: string;
  createdById: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  fileType?: string;
  fileSize?: string;
  taskId: string;
  uploadedById: string;
  createdAt?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
}
