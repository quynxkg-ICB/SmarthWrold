import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Calendar,
  Building,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { Task, KPIStats, User } from '../../types';
import contentData from '../../data/contentData.json';
import { taskService } from '../../services/taskService';
import BrandLogo from '../../components/brand/BrandLogo';
import FlowerBand from '../../components/brand/FlowerBand';

interface ReportsViewProps {
  tasks: Task[];
  kpis: KPIStats;
  currentUser: User;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  tasks,
  kpis,
  currentUser,
}) => {
  const [reportType, setReportType] = useState<'department' | 'assignee' | 'project' | 'overdue'>('department');
  const [period, setPeriod] = useState('Tháng 11/2026');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    taskService.exportToCSV(tasks);
  };

  // Stats by department
  const deptData = contentData.departments.map((dept) => {
    const deptTasks = tasks.filter((t) => t.departmentId === dept.id);
    const completed = deptTasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgress = deptTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const overdue = deptTasks.filter((t) => taskService.isOverdue(t)).length;
    const total = deptTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { dept, total, completed, inProgress, overdue, rate };
  });

  // Stats by staff
  const userData = contentData.users.map((user) => {
    const userTasks = tasks.filter((t) => t.assigneeId === user.id);
    const completed = userTasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgress = userTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const overdue = userTasks.filter((t) => taskService.isOverdue(t)).length;
    const total = userTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { user, total, completed, inProgress, overdue, rate };
  });

  return (
    <div className="space-y-6">
      {/* Top Controls (Hidden on Print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Trung tâm Báo cáo Thống kê Điều hành
          </h2>
          <p className="text-xs text-slate-500">
            Xuất dữ liệu quản trị công việc định dạng Excel (.csv UTF-8) và bản in chuẩn ngân hàng
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel (.csv)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-[#005993] hover:bg-[#004777] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>In / Lưu PDF báo cáo</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'department', label: 'Báo cáo theo Phòng ban' },
          { id: 'assignee', label: 'Báo cáo theo Cán bộ' },
          { id: 'project', label: 'Tiến độ theo Dự án' },
          { id: 'overdue', label: 'Danh sách công việc trễ hạn' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as typeof reportType)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              reportType === tab.id
                ? 'bg-[#005993] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Official Bank Report Document Container (Printable) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm card-print space-y-6">
        {/* Official Header conforming to VietinBank Brand Guidelines */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <BrandLogo size="md" />
            <p className="text-[11px] text-slate-500 font-medium pt-1">
              {contentData.appInfo.address}
            </p>
            <p className="text-[11px] text-slate-500">
              Điện thoại: {contentData.appInfo.hotline} • Email: {contentData.appInfo.email}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#005993] block">
              MÃ BÁO CÁO: VTB-KG/BC-2026
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Ngày lập: {new Date().toLocaleDateString('vi-VN')}
            </span>
            <span className="text-[11px] text-slate-400 block">
              Người lập: {currentUser.name} ({currentUser.title})
            </span>
          </div>
        </div>

        <FlowerBand height={3} />

        {/* Title */}
        <div className="text-center py-2 space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#005993] tracking-tight uppercase">
            BÁO CÁO TÌNH HÌNH THỰC HIỆN CÔNG VIỆC VÀ TIẾN ĐỘ CHỈ ĐẠO
          </h2>
          <p className="text-xs font-semibold text-slate-600">
            Kỳ đánh giá: <strong className="text-slate-800">{period}</strong> • Phạm vi: Toàn bộ các phòng ban nghiệp vụ
          </p>
        </div>

        {/* Summary Executive KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng khối lượng việc</span>
            <span className="text-xl font-extrabold text-slate-800">{kpis.total} việc</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Tỷ lệ hoàn thành</span>
            <span className="text-xl font-extrabold text-emerald-600">{kpis.completionRate}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Hoàn thành đúng hạn</span>
            <span className="text-xl font-extrabold text-[#005993]">{kpis.onTimeRate}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Số việc đang quá hạn</span>
            <span className="text-xl font-extrabold text-[#D71249]">{kpis.overdue} việc</span>
          </div>
        </div>

        {/* Report Table based on active tab */}
        {reportType === 'department' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-[#005993] text-white font-bold text-[11px]">
                <tr>
                  <th className="p-2.5 border-r border-white/20">STT</th>
                  <th className="p-2.5 border-r border-white/20">Phòng ban</th>
                  <th className="p-2.5 border-r border-white/20">Mã đơn vị</th>
                  <th className="p-2.5 border-r border-white/20 text-center">Tổng việc</th>
                  <th className="p-2.5 border-r border-white/20 text-center">Hoàn thành</th>
                  <th className="p-2.5 border-r border-white/20 text-center">Đang làm</th>
                  <th className="p-2.5 border-r border-white/20 text-center">Quá hạn</th>
                  <th className="p-2.5 text-right">Tỷ lệ (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {deptData.map((d, idx) => (
                  <tr key={d.dept.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-slate-800 border-r border-slate-200">{d.dept.name}</td>
                    <td className="p-2.5 font-mono text-slate-600 border-r border-slate-200">{d.dept.code}</td>
                    <td className="p-2.5 text-center font-bold text-slate-700 border-r border-slate-200">{d.total}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600 border-r border-slate-200">{d.completed}</td>
                    <td className="p-2.5 text-center font-bold text-[#005993] border-r border-slate-200">{d.inProgress}</td>
                    <td className="p-2.5 text-center font-bold text-[#D71249] border-r border-slate-200">{d.overdue}</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">{d.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'assignee' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-[#005993] text-white font-bold text-[11px]">
                <tr>
                  <th className="p-2.5 border-r border-white/20">STT</th>
                  <th className="p-2.5 border-r border-white/20">Họ và tên cán bộ</th>
                  <th className="p-2.5 border-r border-white/20">Chức vụ / Phòng ban</th>
                  <th className="p-2.5 border-r border-white/20 text-center">Giao phụ trách</th>
                  <th className="p-2.5 border-r border-white/20 text-center">Đã hoàn thành</th>
                  <th className="p-2.5 border-r border-white/20 text-center">Đang xử lý</th>
                  <th className="p-2.5 border-r border-white/20 text-center">Quá hạn</th>
                  <th className="p-2.5 text-right">Hiệu suất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {userData.map((u, idx) => (
                  <tr key={u.user.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-slate-800 border-r border-slate-200">{u.user.name}</td>
                    <td className="p-2.5 text-slate-600 border-r border-slate-200">{u.user.title} ({u.user.departmentName})</td>
                    <td className="p-2.5 text-center font-bold text-slate-700 border-r border-slate-200">{u.total}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600 border-r border-slate-200">{u.completed}</td>
                    <td className="p-2.5 text-center font-bold text-[#005993] border-r border-slate-200">{u.inProgress}</td>
                    <td className="p-2.5 text-center font-bold text-[#D71249] border-r border-slate-200">{u.overdue}</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">{u.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'overdue' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-[#D71249] text-white font-bold text-[11px]">
                <tr>
                  <th className="p-2.5 border-r border-white/20">Mã việc</th>
                  <th className="p-2.5 border-r border-white/20">Tiêu đề nhiệm vụ</th>
                  <th className="p-2.5 border-r border-white/20">Phòng ban</th>
                  <th className="p-2.5 border-r border-white/20">Cán bộ thụ lý</th>
                  <th className="p-2.5 border-r border-white/20">Hạn hoàn thành</th>
                  <th className="p-2.5 border-r border-white/20">Tiến độ</th>
                  <th className="p-2.5 text-right">Độ ưu tiên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tasks.filter((t) => taskService.isOverdue(t)).map((task) => (
                  <tr key={task.id} className="hover:bg-rose-50/50">
                    <td className="p-2.5 font-mono font-bold text-[#D71249] border-r border-slate-200">{task.code}</td>
                    <td className="p-2.5 font-semibold text-slate-800 border-r border-slate-200">{task.title}</td>
                    <td className="p-2.5 text-slate-600 border-r border-slate-200">{task.departmentName}</td>
                    <td className="p-2.5 font-medium text-slate-800 border-r border-slate-200">{task.assigneeName}</td>
                    <td className="p-2.5 font-bold text-[#D71249] border-r border-slate-200">{task.dueDate}</td>
                    <td className="p-2.5 font-bold text-slate-700 border-r border-slate-200">{task.progress}%</td>
                    <td className="p-2.5 text-right font-bold text-[#D71249]">{task.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'project' && (
          <div className="space-y-4">
            {contentData.projects.map((proj) => {
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const completedCount = projTasks.filter((t) => t.status === 'COMPLETED').length;
              const rate = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : proj.progress;

              return (
                <div key={proj.id} className="p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#005993] mr-2">{proj.code}</span>
                      <strong className="text-sm text-slate-800">{proj.name}</strong>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{rate}% hoàn thành</span>
                  </div>
                  <p className="text-xs text-slate-500">{proj.description}</p>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${rate}%` }} className="h-full bg-[#005993] rounded-full" />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Trưởng dự án: {proj.managerName}</span>
                    <span>Thời hạn: {proj.startDate} - {proj.endDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Official Signatures Section for formal banking documents */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
          <div className="space-y-16">
            <p className="font-bold text-slate-700 uppercase">NGƯỜI LẬP BÁO CÁO</p>
            <p className="font-bold text-slate-800">{currentUser.name}</p>
          </div>
          <div className="space-y-16">
            <p className="font-bold text-slate-700 uppercase">GIÁM ĐỐC CHI NHÁNH PHÊ DUYỆT</p>
            <p className="font-bold text-slate-800">Nguyễn Văn Thắng</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
