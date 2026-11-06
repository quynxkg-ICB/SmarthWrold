export type RoleId = 'admin' | 'executive' | 'manager' | 'member';

export type TaskStatus = 
  | 'TODO'
  | 'IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  content: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface TaskActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  departmentId: string;
  departmentName: string;
  creatorId: string;
  creatorName: string;
  assigneeId: string;
  assigneeName: string;
  collaborators: string[];
  createdDate: string;
  startDate: string;
  dueDate: string;
  completedDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  labels: string[];
  requiresApproval: boolean;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  approvalNote?: string;
  checklist: ChecklistItem[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  activityLogs: TaskActivityLog[];
  isDeleted?: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  manager: string;
  managerTitle: string;
  membersCount: number;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  departmentId: string;
  departmentName: string;
  title: string;
  avatar: string;
  status: 'active' | 'inactive';
}

export interface Project {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  managerId: string;
  managerName: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  description: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  taskId?: string;
  timestamp: string;
  read: boolean;
}

export interface FilterState {
  searchQuery: string;
  status: string;
  priority: string;
  departmentId: string;
  assigneeId: string;
  projectId: string;
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'this_quarter' | 'this_year';
  overdueOnly: boolean;
  dueSoonOnly: boolean;
}

export interface KPIStats {
  total: number;
  todo: number;
  inProgress: number;
  pendingReview: number;
  onHold: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  urgent: number;
  completionRate: number;
  onTimeRate: number;
}
