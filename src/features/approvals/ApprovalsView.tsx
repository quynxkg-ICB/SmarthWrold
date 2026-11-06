import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Building,
  Calendar,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Task, User } from '../../types';
import { taskService } from '../../services/taskService';

interface ApprovalsViewProps {
  tasks: Task[];
  currentUser: User;
  onOpenTaskDetails: (task: Task) => void;
  onRefresh: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  tasks,
  currentUser,
  onOpenTaskDetails,
  onRefresh,
}) => {
  const [filterTab, setFilterTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});

  const approvalTasks = tasks.filter((t) => t.requiresApproval);
  const pendingList = approvalTasks.filter((t) => t.approvalStatus === 'pending');
  const approvedList = approvalTasks.filter((t) => t.approvalStatus === 'approved');
  const rejectedList = approvalTasks.filter((t) => t.approvalStatus === 'rejected');

  const currentList =
    filterTab === 'pending' ? pendingList : filterTab === 'approved' ? approvedList : rejectedList;

  const canApprove =
    currentUser.role === 'admin' || currentUser.role === 'executive' || currentUser.role === 'manager';

  const handleApprove = (taskId: string) => {
    const note = reviewNote[taskId] || 'Đạt yêu cầu nghiệm thu chất lượng công việc.';
    taskService.approveTask(taskId, currentUser.name, note);
    onRefresh();
  };

  const handleReject = (taskId: string) => {
    const note = reviewNote[taskId];
    if (!note || !note.trim()) {
      alert('Vui lòng nhập lý do hoặc nội dung yêu cầu bổ sung vào ô ghi chú.');
      return;
    }
    taskService.rejectTask(taskId, currentUser.name, note.trim());
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#005993]" />
            Quy trình Kiểm soát & Phê duyệt Nghiệm thu
          </h2>
          <p className="text-xs text-slate-500">
            Dành cho Lãnh đạo Phòng ban và Ban Giám Đốc VietinBank Kiên Giang
          </p>
        </div>

        {/* Status Counts */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            {pendingList.length} chờ duyệt
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            {approvedList.length} đã duyệt
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'pending', label: 'Cần phê duyệt', count: pendingList.length },
          { id: 'approved', label: 'Đã nghiệm thu', count: approvedList.length },
          { id: 'rejected', label: 'Yêu cầu chỉnh sửa', count: rejectedList.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as typeof filterTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              filterTab === tab.id
                ? 'bg-[#005993] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {currentList.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-[#005993] border border-sky-200">
                  {task.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {task.departmentName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Hạn hoàn thành: {task.dueDate}</span>
                <button
                  onClick={() => onOpenTaskDetails(task)}
                  className="px-2.5 py-1 text-xs text-[#005993] bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center gap-1 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Xem hồ sơ
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">{task.title}</h3>
              {task.description && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{task.description}</p>
              )}
            </div>

            {/* People & Checklist progress */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl text-xs text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Cán bộ thực hiện</span>
                <strong>{task.assigneeName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Tiến độ báo cáo</span>
                <strong className="text-emerald-700">{task.progress}% hoàn thành</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Checklist con</span>
                <span>
                  {task.checklist?.filter((c) => c.completed).length}/{task.checklist?.length || 0} mục hoàn tất
                </span>
              </div>
            </div>

            {/* If approved/rejected, show approver details */}
            {task.approvalStatus === 'approved' && task.approvedBy && (
              <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                ✓ <strong>Đã nghiệm thu bởi {task.approvedBy}</strong> vào lúc {task.approvedAt}
                {task.approvalNote && <p className="mt-1 italic">"{task.approvalNote}"</p>}
              </div>
            )}

            {task.approvalStatus === 'rejected' && task.approvalNote && (
              <div className="text-xs text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200">
                ✕ <strong>Yêu cầu bổ sung bởi {task.approvedBy}:</strong> "{task.approvalNote}"
              </div>
            )}

            {/* If pending and user has authority: show approval actions */}
            {filterTab === 'pending' && canApprove && (
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={reviewNote[task.id] || ''}
                  onChange={(e) => setReviewNote({ ...reviewNote, [task.id]: e.target.value })}
                  placeholder="Ghi chú ý kiến đánh giá nghiệm thu..."
                  className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-[#005993]"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(task.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Phê duyệt nghiệm thu
                  </button>
                  <button
                    onClick={() => handleReject(task.id)}
                    className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Yêu cầu làm lại
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {currentList.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Không có yêu cầu nào trong danh mục này</h4>
            <p className="text-xs text-slate-400">Các nhiệm vụ cần phê duyệt sẽ tự động xuất hiện ở đây.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsView;
