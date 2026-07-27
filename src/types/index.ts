export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
  isOwner: boolean;
  projectCount?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  name: string;
  color?: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: string;
  position: number;
  dueDate?: string;
  assigneeId?: string;
  columnId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  fileType?: string;
  fileSize?: string;
  taskId: string;
  uploadedById: string;
  createdAt: string;
  uploadedBy?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export interface Label {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  userId: string;
  workspaceId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
