import React, { useState } from 'react';
import {
  Plus,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Filter,
  UserCheck,
  Building,
} from 'lucide-react';
import { Task, User, TaskStatus } from '../../types';
import contentData from '../../data/contentData.json';
import { taskService } from '../../services/taskService';

interface KanbanBoardProps {
  tasks: Task[];
  currentUser: User;
  onOpenTaskDetails: (task: Task) => void;
  onOpenCreateTask: () => void;
}

const COLUMNS: { id: TaskStatus; name: string; color: string; borderTop: string }[] = [
  { id: 'TODO', name: 'Chưa bắt đầu', color: 'bg-slate-500', borderTop: 'border-slate-400' },
  { id: 'IN_PROGRESS', name: 'Đang thực hiện', color: 'bg-[#005993]', borderTop: 'border-[#005993]' },
  { id: 'PENDING_REVIEW', name: 'Chờ phản hồi', color: 'bg-amber-500', borderTop: 'border-amber-500' },
  { id: 'ON_HOLD', name: 'Tạm dừng', color: 'bg-orange-500', borderTop: 'border-orange-500' },
  { id: 'COMPLETED', name: 'Hoàn thành', color: 'bg-emerald-600', borderTop: 'border-emerald-600' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  currentUser,
  onOpenTaskDetails,
  onOpenCreateTask,
}) => {
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterDept !== 'ALL' && t.departmentId !== filterDept) return false;
    if (filterAssignee !== 'ALL' && t.assigneeId !== filterAssignee) return false;
    return true;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (taskId) {
      taskService.updateStatus(taskId, targetStatus, currentUser.name);
    }
    setDraggingTaskId(null);
  };

  // Move task to adjacent column
  const handleMoveColumn = (taskId: string, currentStatus: TaskStatus, direction: 'prev' | 'next') => {
    const currentIndex = COLUMNS.findIndex((c) => c.id === currentStatus);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < COLUMNS.length) {
      taskService.updateStatus(taskId, COLUMNS[targetIndex].id, currentUser.name);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Bảng điều phối công việc Kanban
          </h2>
          <p className="text-xs text-slate-500">
            Kéo thả hoặc chuyển cột để cập nhật trạng thái thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">Tất cả phòng ban</option>
            {contentData.departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">Tất cả cán bộ</option>
            {contentData.users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          <button
            onClick={onOpenCreateTask}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#005993] hover:bg-[#004777] rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm việc</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
        {COLUMNS.map((column) => {
          const colTasks = filteredTasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col min-h-[580px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                  <span className="font-bold text-xs text-slate-800 tracking-tight">
                    {column.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-600 border border-slate-200 shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colTasks.map((task) => {
                  const isOverdue = taskService.isOverdue(task);
                  const isDueSoon = taskService.isDueSoon(task);
                  const priorityObj = contentData.priorities.find((p) => p.id === task.priority);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className={`bg-white rounded-xl p-3.5 border shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                        isOverdue ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                      }`}
                    >
                      {/* Top tags and priority */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="font-mono text-[10px] font-bold text-[#005993] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                          {task.code}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm border ${priorityObj?.badge || ''}`}>
                          {priorityObj?.name}
                        </span>
                      </div>

                      {/* Title */}
                      <h4
                        onClick={() => onOpenTaskDetails(task)}
                        className="font-bold text-xs text-slate-800 hover:text-[#005993] cursor-pointer line-clamp-2 leading-snug mb-2"
                      >
                        {task.title}
                      </h4>

                      {/* Department and Due Date */}
                      <div className="space-y-1 mb-2.5 text-[11px] text-slate-500">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                            {task.departmentId}
                          </span>
                          <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                            isOverdue ? 'text-[#D71249]' : isDueSoon ? 'text-amber-600' : 'text-slate-400'
                          }`}>
                            {isOverdue && <AlertTriangle className="w-3 h-3 text-[#D71249]" />}
                            {task.dueDate}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            style={{ width: `${task.progress}%` }}
                            className={`h-full rounded-full ${
                              task.progress === 100 ? 'bg-emerald-500' : 'bg-[#005993]'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Card Footer: Assignee & Column Move Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5" title={`Phụ trách: ${task.assigneeName}`}>
                          <div className="w-5 h-5 rounded-full bg-[#005993] text-white text-[9px] font-bold flex items-center justify-center">
                            {task.assigneeName.charAt(0)}
                          </div>
                          <span className="text-[10px] text-slate-600 font-medium truncate max-w-[80px]">
                            {task.assigneeName}
                          </span>
                        </div>

                        {/* Fast Move Buttons */}
                        <div className="flex items-center gap-1">
                          {column.id !== 'TODO' && (
                            <button
                              onClick={() => handleMoveColumn(task.id, task.status, 'prev')}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                              title="Chuyển về cột trước"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {column.id !== 'COMPLETED' && (
                            <button
                              onClick={() => handleMoveColumn(task.id, task.status, 'next')}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-[#005993]"
                              title="Chuyển sang cột tiếp theo"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                    Kéo thả việc vào đây
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
