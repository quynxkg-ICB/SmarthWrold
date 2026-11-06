import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MoreVertical,
  Copy,
  Trash2,
  Eye,
  FileSpreadsheet,
  RotateCcw,
  Tag,
  Briefcase,
  Building,
  UserCheck,
} from 'lucide-react';
import { Task, User, TaskStatus, TaskPriority } from '../../types';
import contentData from '../../data/contentData.json';
import { taskService } from '../../services/taskService';

interface TaskListProps {
  tasks: Task[];
  currentUser: User;
  onOpenTaskDetails: (task: Task) => void;
  onOpenCreateTask: () => void;
  filterMode?: 'all' | 'my_tasks' | 'assigned_by_me';
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  currentUser,
  onOpenTaskDetails,
  onOpenCreateTask,
  filterMode = 'all',
}) => {
  // Local filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  const [dueSoonOnly, setDueSoonOnly] = useState<boolean>(false);

  // Bulk actions selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'progress' | 'code'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered tasks calculation
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Filter mode: My tasks / Assigned by me / All
      if (filterMode === 'my_tasks') {
        const isAssignee = t.assigneeId === currentUser.id;
        const isCollaborator = t.collaborators?.includes(currentUser.id);
        if (!isAssignee && !isCollaborator) return false;
      } else if (filterMode === 'assigned_by_me') {
        if (t.creatorId !== currentUser.id) return false;
      }

      // Search term
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCode = t.code.toLowerCase().includes(q);
        const matchAssignee = t.assigneeName.toLowerCase().includes(q);
        const matchDept = t.departmentName.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchAssignee && !matchDept && !matchDesc) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;

      // Department filter
      if (deptFilter !== 'ALL' && t.departmentId !== deptFilter) return false;

      // Assignee filter
      if (assigneeFilter !== 'ALL' && t.assigneeId !== assigneeFilter) return false;

      // Overdue filter
      if (overdueOnly && !taskService.isOverdue(t)) return false;

      // Due soon filter
      if (dueSoonOnly && !taskService.isDueSoon(t)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        const da = taskService.parseDate(a.dueDate)?.getTime() || 0;
        const db = taskService.parseDate(b.dueDate)?.getTime() || 0;
        return sortOrder === 'asc' ? da - db : db - da;
      }
      if (sortBy === 'progress') {
        return sortOrder === 'asc' ? a.progress - b.progress : b.progress - a.progress;
      }
      if (sortBy === 'code') {
        return sortOrder === 'asc' ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
      }
      if (sortBy === 'priority') {
        const pOrder: Record<TaskPriority, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return sortOrder === 'asc' ? pOrder[a.priority] - pOrder[b.priority] : pOrder[b.priority] - pOrder[a.priority];
      }
      return 0;
    });
  }, [tasks, filterMode, currentUser, search, statusFilter, priorityFilter, deptFilter, assigneeFilter, overdueOnly, dueSoonOnly, sortBy, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTasks.map((t) => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = () => {
    if (!confirm(`Bạn có chắc muốn đánh dấu hoàn thành ${selectedIds.length} nhiệm vụ đã chọn?`)) return;
    selectedIds.forEach((id) => taskService.updateStatus(id, 'COMPLETED', currentUser.name));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} nhiệm vụ đã chọn? Dữ liệu sẽ lưu vết kiểm toán.`)) return;
    selectedIds.forEach((id) => taskService.deleteTask(id, currentUser.name));
    setSelectedIds([]);
  };

  const resetAllFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setDeptFilter('ALL');
    setAssigneeFilter('ALL');
    setOverdueOnly(false);
    setDueSoonOnly(false);
  };

  return (
    <div className="space-y-4">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            {filterMode === 'my_tasks'
              ? 'Nhiệm vụ phân công cho tôi'
              : filterMode === 'assigned_by_me'
              ? 'Nhiệm vụ tôi đã giao'
              : 'Tất cả nhiệm vụ VietinBank Kiên Giang'}
          </h2>
          <p className="text-xs text-slate-500">
            Tìm thấy <strong className="text-[#005993] font-bold">{filteredTasks.length}</strong> công việc phù hợp
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => taskService.exportToCSV(filteredTasks)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200"
            title="Xuất Excel định dạng tiếng Việt chuẩn UTF-8 BOM"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel (.csv)</span>
          </button>

          <button
            onClick={onOpenCreateTask}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-[#005993] hover:bg-[#004777] rounded-lg shadow-xs flex items-center gap-1.5 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo việc mới</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm công việc..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#005993] outline-hidden text-slate-800"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#005993] outline-hidden text-slate-700 font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {contentData.taskStatuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#005993] outline-hidden text-slate-700 font-medium"
            >
              <option value="ALL">Tất cả mức ưu tiên</option>
              {contentData.priorities.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Department filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#005993] outline-hidden text-slate-700 font-medium"
            >
              <option value="ALL">Tất cả phòng ban</option>
              {contentData.departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Quick toggle overdue & reset */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-bold border transition-all ${
                overdueOnly
                  ? 'bg-rose-100 text-[#D71249] border-rose-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Quá hạn
            </button>

            <button
              onClick={() => setDueSoonOnly(!dueSoonOnly)}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                dueSoonOnly
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Sắp đến hạn
            </button>

            <button
              onClick={resetAllFilters}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Action Bar if items selected */}
        {selectedIds.length > 0 && (
          <div className="p-2.5 bg-sky-50 border border-[#7ED3F7]/50 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
            <span className="font-semibold text-[#005993]">
              Đã chọn <strong>{selectedIds.length}</strong> công việc
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkComplete}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hoàn thành
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredTasks.length}
                    onChange={toggleSelectAll}
                    className="rounded text-[#005993] focus:ring-[#005993]"
                  />
                </th>
                <th className="p-3 cursor-pointer" onClick={() => { setSortBy('code'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">
                    <span>Mã hiệu</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Nhiệm vụ / Dự án</th>
                <th className="p-3">Phòng ban</th>
                <th className="p-3">Người phụ trách</th>
                <th className="p-3 cursor-pointer" onClick={() => { setSortBy('priority'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">
                    <span>Độ ưu tiên</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 cursor-pointer" onClick={() => { setSortBy('dueDate'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">
                    <span>Hạn chót</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 cursor-pointer" onClick={() => { setSortBy('progress'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">
                    <span>Tiến độ</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    Không tìm thấy công việc nào thỏa mãn tiêu chí lọc.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isOverdue = taskService.isOverdue(task);
                  const isDueSoon = taskService.isDueSoon(task);
                  const statusObj = contentData.taskStatuses.find((s) => s.id === task.status);
                  const priorityObj = contentData.priorities.find((p) => p.id === task.priority);

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isOverdue ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(task.id)}
                          onChange={() => toggleSelect(task.id)}
                          className="rounded text-[#005993] focus:ring-[#005993]"
                        />
                      </td>

                      {/* Code */}
                      <td className="p-3 font-mono font-bold text-[#005993] whitespace-nowrap">
                        <span
                          onClick={() => onOpenTaskDetails(task)}
                          className="hover:underline cursor-pointer"
                        >
                          {task.code}
                        </span>
                      </td>

                      {/* Title & tags */}
                      <td className="p-3 max-w-xs sm:max-w-md">
                        <div
                          onClick={() => onOpenTaskDetails(task)}
                          className="font-semibold text-slate-800 hover:text-[#005993] cursor-pointer line-clamp-1"
                        >
                          {task.title}
                        </div>
                        {task.projectName && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <Briefcase className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{task.projectName}</span>
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-medium">
                          {task.departmentId}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#005993] text-white font-bold text-[10px] flex items-center justify-center">
                            {task.assigneeName.charAt(0)}
                          </div>
                          <span className="text-slate-700 font-medium">{task.assigneeName}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm border ${priorityObj?.badge || ''}`}>
                          {priorityObj?.name}
                        </span>
                      </td>

                      {/* Due Date & Overdue Highlight */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-[#D71249]" />}
                          {isDueSoon && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                          <span className={`font-semibold ${isOverdue ? 'text-[#D71249]' : isDueSoon ? 'text-amber-700' : 'text-slate-600'}`}>
                            {task.dueDate}
                          </span>
                        </div>
                      </td>

                      {/* Progress bar */}
                      <td className="p-3 whitespace-nowrap w-28">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${task.progress}%` }}
                              className={`h-full rounded-full ${
                                task.progress === 100 ? 'bg-emerald-500' : 'bg-[#005993]'
                              }`}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-500">{task.progress}%</span>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusObj?.badge || ''}`}>
                          {statusObj?.name}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenTaskDetails(task)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#005993] hover:bg-slate-100"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              taskService.duplicateTask(task.id, currentUser.name);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#005993] hover:bg-slate-100"
                            title="Nhân bản công việc"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa công việc ${task.code}?`)) {
                                taskService.deleteTask(task.id, currentUser.name);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#D71249] hover:bg-rose-50"
                            title="Xóa công việc"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
