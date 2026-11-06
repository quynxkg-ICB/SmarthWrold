import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Building,
  UserCheck,
} from 'lucide-react';
import { Task, User } from '../../types';
import contentData from '../../data/contentData.json';
import { taskService } from '../../services/taskService';

interface CalendarViewProps {
  tasks: Task[];
  currentUser: User;
  onOpenTaskDetails: (task: Task) => void;
  onOpenCreateTask: (prefillDate?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  currentUser,
  onOpenTaskDetails,
  onOpenCreateTask,
}) => {
  // Calendar current view date (Defaulting to Nov 2026 based on mock data & prompt metadata)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 10, 1)); // November 2026
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 10, 5));
  };

  // Month grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  // Let's make Monday first day of week (standard for Vietnamese enterprise banking calendars)
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // 0 for Mon, 6 for Sun

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterDept !== 'ALL' && t.departmentId !== filterDept) return false;
    if (filterAssignee !== 'ALL' && t.assigneeId !== filterAssignee) return false;
    return true;
  });

  // Days array
  const calendarCells = [];
  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }
  // Next month padding to fill complete 35 or 42 grid
  const remaining = 35 - calendarCells.length > 0 ? 35 - calendarCells.length : 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const dayHeaders = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  // Helper to match tasks on day
  const getTasksForDay = (d: number, m: number, y: number) => {
    const dateStr = `${String(d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/${y}`;
    return filteredTasks.filter((t) => t.dueDate === dateStr || t.startDate === dateStr);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={prevMonth}
              className="p-1 rounded hover:bg-white text-slate-700"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-0.5 text-xs font-bold text-[#005993] hover:bg-white rounded"
            >
              Hôm nay
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded hover:bg-white text-slate-700"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Tháng {month + 1} / {year}
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
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
            onClick={() => onOpenCreateTask()}
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#005993] hover:bg-[#004777] rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm việc</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-xs font-bold text-slate-600">
          {dayHeaders.map((header, idx) => (
            <div key={idx} className={idx >= 5 ? 'text-rose-600' : ''}>
              {header}
            </div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[620px]">
          {calendarCells.map((cell, idx) => {
            const dayTasks = getTasksForDay(cell.day, cell.month, cell.year);
            const isToday = cell.day === 5 && cell.month === 10 && cell.year === 2026;
            const dateStr = `${String(cell.day).padStart(2, '0')}/${String(cell.month + 1).padStart(2, '0')}/${cell.year}`;

            return (
              <div
                key={idx}
                className={`p-2 min-h-[110px] flex flex-col justify-between transition-colors group relative ${
                  cell.isCurrentMonth ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/50 text-slate-300'
                }`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday
                        ? 'bg-[#005993] text-white shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {cell.isCurrentMonth && (
                    <button
                      onClick={() => onOpenCreateTask(dateStr)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#005993] rounded hover:bg-sky-50 transition-all"
                      title={`Tạo công việc ngày ${dateStr}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Day Tasks Pill List */}
                <div className="space-y-1 my-1 overflow-y-auto max-h-24 custom-scrollbar">
                  {dayTasks.map((task) => {
                    const isOverdue = taskService.isOverdue(task);
                    const isCompleted = task.status === 'COMPLETED';

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTaskDetails(task);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer transition-all border ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 line-through opacity-75'
                            : isOverdue
                            ? 'bg-rose-100 text-[#D71249] border-rose-300 font-bold'
                            : 'bg-sky-50 text-[#005993] border-sky-200 hover:bg-sky-100'
                        }`}
                        title={`${task.code}: ${task.title} (Hạn: ${task.dueDate})`}
                      >
                        <span className="font-mono mr-1 font-bold">{task.code.split('-').slice(-1)}</span>
                        {task.title}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-right text-slate-300">
                  {dayTasks.length > 0 && `${dayTasks.length} việc`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
