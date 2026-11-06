import React, { useState } from 'react';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  TrendingUp,
  Building2,
  Calendar,
  ArrowRight,
  Filter,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { Task, User, KPIStats } from '../../types';
import contentData from '../../data/contentData.json';

interface DashboardProps {
  tasks: Task[];
  kpis: KPIStats;
  currentUser: User;
  onOpenTaskDetails: (task: Task) => void;
  onNavigateToView: (viewId: string) => void;
  onOpenCreateTask: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  kpis,
  currentUser,
  onOpenTaskDetails,
  onNavigateToView,
  onOpenCreateTask,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'>('month');

  // Overdue and critical tasks
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    const parts = t.dueDate.split('/');
    if (parts.length !== 3) return false;
    const due = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    due.setHours(23, 59, 59);
    return new Date().getTime() > due.getTime();
  });

  const dueSoonTasks = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    const parts = t.dueDate.split('/');
    if (parts.length !== 3) return false;
    const due = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const diff = (due.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 3;
  });

  // Calculate department task distributions
  const deptStats = contentData.departments.map((dept) => {
    const deptTasks = tasks.filter((t) => t.departmentId === dept.id);
    const completed = deptTasks.filter((t) => t.status === 'COMPLETED').length;
    const count = deptTasks.length;
    const rate = count > 0 ? Math.round((completed / count) * 100) : 0;
    return {
      dept,
      count,
      completed,
      rate,
    };
  }).filter((d) => d.count > 0);

  // Status counts for visual breakdown
  const statusCounts = [
    { label: 'Chưa bắt đầu', count: kpis.todo, color: 'bg-slate-400', hex: '#64748B' },
    { label: 'Đang thực hiện', count: kpis.inProgress, color: 'bg-[#005993]', hex: '#005993' },
    { label: 'Chờ phản hồi', count: kpis.pendingReview, color: 'bg-amber-500', hex: '#F59E0B' },
    { label: 'Tạm dừng', count: kpis.onHold, color: 'bg-orange-500', hex: '#F97316' },
    { label: 'Hoàn thành', count: kpis.completed, color: 'bg-emerald-600', hex: '#16A34A' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#005993] via-[#004777] to-[#00365a] rounded-2xl p-6 text-white shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Building2 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#7ED3F7] text-xs font-semibold mb-2 backdrop-blur-xs">
              <span>{contentData.appInfo.branch}</span>
              <span>•</span>
              <span>Hệ thống chỉ đạo điều hành</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Xin chào, {currentUser.name}
            </h2>
            <p className="text-sm text-sky-100/90 mt-1 max-w-xl">
              Hôm nay có <strong className="text-white font-bold">{overdueTasks.length} nhiệm vụ quá hạn</strong> và{' '}
              <strong className="text-white font-bold">{dueSoonTasks.length} nhiệm vụ sắp đến hạn</strong> cần được theo dõi và xử lý kịp thời.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateToView('ai_assistant')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-[#7ED3F7]" />
              AI Phân tích tiến độ
            </button>
            <button
              onClick={onOpenCreateTask}
              className="px-4 py-2 rounded-xl bg-[#D71249] hover:bg-[#b80c3b] text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all active:scale-98"
            >
              <CheckSquare className="w-4 h-4" />
              Giao việc ngay
            </button>
          </div>
        </div>
      </div>

      {/* Time Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <span className="text-slate-400 text-[11px] mr-1">Kỳ báo cáo:</span>
          {[
            { id: 'today', label: 'Hôm nay' },
            { id: 'week', label: 'Tuần này' },
            { id: 'month', label: 'Tháng này' },
            { id: 'quarter', label: 'Quý này' },
            { id: 'all', label: 'Tất cả' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeFilter(item.id as typeof timeFilter)}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeFilter === item.id
                  ? 'bg-white text-[#005993] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Dữ liệu thời gian thực • Múi giờ: <strong className="text-slate-700">Asia/Ho_Chi_Minh</strong>
        </div>
      </div>

      {/* Key KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-[#005993]/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tổng nhiệm vụ</span>
            <ListTodo className="w-4 h-4 text-[#005993]" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{kpis.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Toàn chi nhánh</div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-[#005993]/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Đang thực hiện</span>
            <Clock className="w-4 h-4 text-[#005993]" />
          </div>
          <div className="text-2xl font-extrabold text-[#005993]">{kpis.inProgress}</div>
          <div className="text-[11px] text-slate-400 mt-1">Chiếm {kpis.total ? Math.round((kpis.inProgress / kpis.total) * 100) : 0}%</div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Hoàn thành</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{kpis.completed}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Tỷ lệ {kpis.completionRate}%</div>
        </div>

        {/* Overdue - Brand Accent Red */}
        <div className="bg-white rounded-xl p-4 border border-rose-200 shadow-xs hover:border-rose-400 transition-all bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold">Quá hạn</span>
            <AlertTriangle className="w-4 h-4 text-[#D71249]" />
          </div>
          <div className="text-2xl font-extrabold text-[#D71249]">{kpis.overdue}</div>
          <div className="text-[11px] text-[#D71249] font-semibold mt-1">Cần đôn đốc ngay</div>
        </div>

        {/* Due soon */}
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-medium">Sắp đến hạn (3 ngày)</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{kpis.dueSoon}</div>
          <div className="text-[11px] text-slate-400 mt-1">Cần tập trung</div>
        </div>

        {/* Urgent Priority */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-[#D71249]/40 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Ưu tiên khẩn cấp</span>
            <Flame className="w-4 h-4 text-[#D71249]" />
          </div>
          <div className="text-2xl font-extrabold text-[#D71249]">{kpis.urgent}</div>
          <div className="text-[11px] text-slate-400 mt-1">Đúng hạn {kpis.onTimeRate}%</div>
        </div>
      </div>

      {/* Progress Breakdown & Department Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Bar & Summary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#005993]" />
                Cơ cấu trạng thái nhiệm vụ
              </h3>
              <span className="text-xs font-bold text-slate-500">{kpis.total} việc</span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4">
              {statusCounts.map((s, idx) => {
                const pct = kpis.total > 0 ? (s.count / kpis.total) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={idx}
                    style={{ width: `${pct}%`, backgroundColor: s.hex }}
                    className="h-full transition-all duration-300"
                    title={`${s.label}: ${s.count} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>

            {/* Legend with percentages */}
            <div className="space-y-2.5">
              {statusCounts.map((s, idx) => {
                const pct = kpis.total > 0 ? Math.round((s.count / kpis.total) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.hex }} />
                      <span className="text-slate-600">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{s.count}</span>
                      <span className="text-slate-400 text-[11px]">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Tỷ lệ hoàn thành đúng hạn:</span>
            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {kpis.onTimeRate}%
            </span>
          </div>
        </div>

        {/* Department Execution Performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#005993]" />
                Tiến độ thực hiện theo Phòng ban
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Số lượng công việc và tỷ lệ hoàn thành theo đơn vị</p>
            </div>
            <button
              onClick={() => onNavigateToView('departments')}
              className="text-xs text-[#005993] font-semibold hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {deptStats.map(({ dept, count, completed, rate }) => (
              <div key={dept.id} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">{dept.name}</span>
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded text-[10px] font-mono">
                      {dept.code}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">{completed}/{count}</span>
                    <span className="text-slate-400 text-[11px] ml-1">({rate}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${rate}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-[#005993]' : 'bg-amber-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Tasks Needing Urgent Action */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-50 rounded-lg text-[#D71249]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                Nhiệm vụ trọng điểm cần lưu ý đặc biệt
              </h3>
              <p className="text-xs text-slate-400">Danh sách công việc khẩn cấp, quá hạn hoặc sắp đến hạn chót</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToView('all_tasks')}
            className="text-xs font-semibold text-[#005993] hover:underline flex items-center gap-1"
          >
            Mở danh sách công việc <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {[...overdueTasks, ...dueSoonTasks].slice(0, 5).map((task) => (
            <div
              key={task.id}
              onClick={() => onOpenTaskDetails(task)}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono font-bold bg-sky-50 text-[#005993] rounded border border-sky-200 mt-0.5">
                  {task.code}
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                    <span>{task.departmentName}</span>
                    <span>•</span>
                    <span>Phụ trách: <strong className="text-slate-600">{task.assigneeName}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-rose-600 block">
                    Hạn: {task.dueDate}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Tiến độ {task.progress}%
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm border ${
                  task.priority === 'URGENT' ? 'bg-rose-100 text-[#D71249] border-rose-300' : 'bg-orange-100 text-orange-700 border-orange-200'
                }`}>
                  {task.priority === 'URGENT' ? 'Khẩn cấp' : 'Cao'}
                </span>
              </div>
            </div>
          ))}

          {overdueTasks.length === 0 && dueSoonTasks.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span>Tuyệt vời! Hiện tại không có công việc nào bị quá hạn hay rủi ro tiến độ.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
