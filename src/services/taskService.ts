import { Task, KPIStats, TaskStatus, TaskPriority } from '../types';
import contentData from '../data/contentData.json';

const STORAGE_KEY = 'vtb_tasks_v2';
const NOTIFS_KEY = 'vtb_notifications_v2';

type Listener = () => void;

class TaskService {
  private tasks: Task[] = [];
  private listeners: Set<Listener> = new Set();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.tasks = JSON.parse(stored);
      } else {
        this.tasks = (contentData.initialTasks as unknown as Task[]);
        this.save();
      }
    } catch {
      this.tasks = (contentData.initialTasks as unknown as Task[]);
    }
    this.initialized = true;
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    this.notify();
  }

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getTasks(): Task[] {
    return this.tasks.filter((t) => !t.isDeleted);
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id && !t.isDeleted);
  }

  public createTask(data: Omit<Task, 'id' | 'code' | 'activityLogs' | 'createdDate'>): Task {
    const nextNum = this.tasks.length + 1;
    const code = `VTB-KG-26-${String(nextNum).padStart(3, '0')}`;
    const id = `TSK-${Date.now()}`;
    const nowStr = this.formatDateTime(new Date());

    const newTask: Task = {
      ...data,
      id,
      code,
      createdDate: this.formatDate(new Date()),
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          timestamp: nowStr,
          user: data.creatorName || 'Cán bộ giao việc',
          action: `Khởi tạo công việc mã ${code}`,
        },
      ],
      comments: data.comments || [],
      attachments: data.attachments || [],
      checklist: data.checklist || [],
      collaborators: data.collaborators || [],
    };

    this.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>, actorName = 'Người dùng'): Task | null {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const old = this.tasks[idx];
    const logItem = {
      id: `act-${Date.now()}`,
      timestamp: this.formatDateTime(new Date()),
      user: actorName,
      action: 'Cập nhật thông tin công việc',
    };

    const updated: Task = {
      ...old,
      ...updates,
      activityLogs: [logItem, ...(old.activityLogs || [])],
    };

    // If completed status changed to COMPLETED, record completion date
    if (updates.status === 'COMPLETED' && old.status !== 'COMPLETED') {
      updated.completedDate = this.formatDate(new Date());
      updated.progress = 100;
    }

    this.tasks[idx] = updated;
    this.save();
    return updated;
  }

  public updateStatus(id: string, newStatus: TaskStatus, actorName = 'Cán bộ phụ trách'): Task | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    const statusNames: Record<TaskStatus, string> = {
      TODO: 'Chưa bắt đầu',
      IN_PROGRESS: 'Đang thực hiện',
      PENDING_REVIEW: 'Chờ phản hồi',
      ON_HOLD: 'Tạm dừng',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };

    const isCompleting = newStatus === 'COMPLETED';
    const updates: Partial<Task> = {
      status: newStatus,
      completedDate: isCompleting ? this.formatDate(new Date()) : task.completedDate,
      progress: isCompleting ? 100 : task.progress,
    };

    const logAction = `Chuyển trạng thái sang "${statusNames[newStatus]}"`;
    const updated = this.updateTask(id, updates, actorName);
    if (updated && updated.activityLogs) {
      updated.activityLogs[0].action = logAction;
      this.save();
    }
    return updated;
  }

  public toggleChecklist(taskId: string, checklistId: string, actorName = 'Cán bộ phụ trách'): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    const updatedChecklist = task.checklist.map((item) => {
      if (item.id === checklistId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    const total = updatedChecklist.length;
    const done = updatedChecklist.filter((c) => c.completed).length;
    const newProgress = total > 0 ? Math.round((done / total) * 100) : task.progress;

    return this.updateTask(
      taskId,
      {
        checklist: updatedChecklist,
        progress: newProgress,
        status: newProgress === 100 ? 'COMPLETED' : task.status === 'COMPLETED' ? 'IN_PROGRESS' : task.status,
      },
      actorName
    );
  }

  public addComment(taskId: string, content: string, user: { id: string; name: string; avatar?: string }): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    const newComment = {
      id: `cmt-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      createdAt: this.formatDateTime(new Date()),
      content,
    };

    const updatedComments = [...(task.comments || []), newComment];
    return this.updateTask(taskId, { comments: updatedComments }, user.name);
  }

  public approveTask(taskId: string, approverName: string, note?: string): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    const updates: Partial<Task> = {
      approvalStatus: 'approved',
      approvedBy: approverName,
      approvedAt: this.formatDateTime(new Date()),
      approvalNote: note || 'Đạt yêu cầu chất lượng công việc.',
      status: 'COMPLETED',
      completedDate: this.formatDate(new Date()),
      progress: 100,
    };

    const updated = this.updateTask(taskId, updates, approverName);
    if (updated && updated.activityLogs) {
      updated.activityLogs[0].action = `Phê duyệt nghiệm thu công việc: "${note || 'Đạt yêu cầu'}"`;
      this.save();
    }
    return updated;
  }

  public rejectTask(taskId: string, approverName: string, note: string): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    const updates: Partial<Task> = {
      approvalStatus: 'rejected',
      approvedBy: approverName,
      approvedAt: this.formatDateTime(new Date()),
      approvalNote: note,
      status: 'IN_PROGRESS',
    };

    const updated = this.updateTask(taskId, updates, approverName);
    if (updated && updated.activityLogs) {
      updated.activityLogs[0].action = `Yêu cầu chỉnh sửa/bổ sung hồ sơ: "${note}"`;
      this.save();
    }
    return updated;
  }

  public duplicateTask(taskId: string, actorName = 'Người dùng'): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    return this.createTask({
      ...task,
      title: `${task.title} (Bản sao)`,
      status: 'TODO',
      progress: 0,
      completedDate: null,
      approvalStatus: task.requiresApproval ? 'pending' : 'none',
      approvedBy: undefined,
      approvedAt: undefined,
      comments: [],
      creatorName: actorName,
    });
  }

  public deleteTask(taskId: string, actorName = 'Người dùng'): boolean {
    const idx = this.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return false;

    // Soft delete for audit trail
    this.tasks[idx].isDeleted = true;
    this.tasks[idx].activityLogs.unshift({
      id: `act-${Date.now()}`,
      timestamp: this.formatDateTime(new Date()),
      user: actorName,
      action: 'Xóa mềm công việc (Lưu vết kiểm toán)',
    });
    this.save();
    return true;
  }

  public resetToDemo(): void {
    this.tasks = JSON.parse(JSON.stringify(contentData.initialTasks));
    this.save();
  }

  // --- Rule Calculations ---
  public isOverdue(task: Task): boolean {
    if (task.status === 'COMPLETED' || task.status === 'CANCELLED') return false;
    const due = this.parseDate(task.dueDate);
    if (!due) return false;
    const now = new Date();
    // Due date considered overdue if end of due date (23:59:59) is before now
    due.setHours(23, 59, 59, 999);
    return now.getTime() > due.getTime();
  }

  public isDueSoon(task: Task, days = 3): boolean {
    if (task.status === 'COMPLETED' || task.status === 'CANCELLED') return false;
    if (this.isOverdue(task)) return false;
    const due = this.parseDate(task.dueDate);
    if (!due) return false;
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= days;
  }

  public calculateKPIs(taskList?: Task[]): KPIStats {
    const list = taskList || this.getTasks();
    const total = list.length;
    const validTasks = list.filter((t) => t.status !== 'CANCELLED');
    const validCount = validTasks.length;

    let todo = 0;
    let inProgress = 0;
    let pendingReview = 0;
    let onHold = 0;
    let completed = 0;
    let overdue = 0;
    let dueSoon = 0;
    let urgent = 0;
    let onTimeCompleted = 0;

    for (const t of list) {
      if (t.status === 'TODO') todo++;
      if (t.status === 'IN_PROGRESS') inProgress++;
      if (t.status === 'PENDING_REVIEW') pendingReview++;
      if (t.status === 'ON_HOLD') onHold++;
      if (t.status === 'COMPLETED') {
        completed++;
        // Check if completed on time
        if (t.completedDate) {
          const comp = this.parseDate(t.completedDate);
          const due = this.parseDate(t.dueDate);
          if (comp && due) {
            due.setHours(23, 59, 59, 999);
            if (comp.getTime() <= due.getTime()) {
              onTimeCompleted++;
            }
          } else {
            onTimeCompleted++;
          }
        } else {
          onTimeCompleted++;
        }
      }

      if (this.isOverdue(t)) overdue++;
      if (this.isDueSoon(t)) dueSoon++;
      if (t.priority === 'URGENT') urgent++;
    }

    const completionRate = validCount > 0 ? Math.round((completed / validCount) * 100) : 0;
    const onTimeRate = completed > 0 ? Math.round((onTimeCompleted / completed) * 100) : 100;

    return {
      total,
      todo,
      inProgress,
      pendingReview,
      onHold,
      completed,
      overdue,
      dueSoon,
      urgent,
      completionRate,
      onTimeRate,
    };
  }

  // --- Export Utilities ---
  public exportToCSV(taskList: Task[]): void {
    const headers = [
      'Mã công việc',
      'Tiêu đề',
      'Dự án',
      'Phòng ban',
      'Người giao',
      'Người thực hiện',
      'Mức ưu tiên',
      'Trạng thái',
      'Tiến độ (%)',
      'Ngày bắt đầu',
      'Hạn hoàn thành',
      'Ngày hoàn thành',
      'Tình trạng hạn',
    ];

    const rows = taskList.map((t) => {
      let deadlineStatus = 'Đúng hạn';
      if (this.isOverdue(t)) deadlineStatus = 'Quá hạn';
      else if (this.isDueSoon(t)) deadlineStatus = 'Sắp đến hạn';
      else if (t.status === 'COMPLETED') deadlineStatus = 'Đã hoàn thành';

      return [
        `"${t.code}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.projectName || ''}"`,
        `"${t.departmentName}"`,
        `"${t.creatorName}"`,
        `"${t.assigneeName}"`,
        `"${t.priority}"`,
        `"${t.status}"`,
        t.progress,
        `"${t.startDate}"`,
        `"${t.dueDate}"`,
        `"${t.completedDate || ''}"`,
        `"${deadlineStatus}"`,
      ].join(',');
    });

    // UTF-8 BOM (\uFEFF) ensures Excel renders Vietnamese accent characters correctly!
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bao_Cao_Cong_Viec_VTB_KG_${this.formatDate(new Date()).replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Helper date methods (DD/MM/YYYY)
  private formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private formatDateTime(d: Date): string {
    const date = this.formatDate(d);
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${date} ${hh}:${min}`;
  }

  public parseDate(str: string): Date | null {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }
}

export const taskService = new TaskService();
