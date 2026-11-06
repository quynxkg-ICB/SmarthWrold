import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  UserCheck,
  Building,
  CheckSquare,
  MessageSquare,
  FileText,
  History,
  ShieldCheck,
  Send,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Share2,
} from 'lucide-react';
import { Task, User, TaskStatus, TaskPriority } from '../../types';
import contentData from '../../data/contentData.json';
import { taskService } from '../../services/taskService';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  currentUser: User;
  onTaskUpdated?: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  currentUser,
  onTaskUpdated,
}) => {
  if (!task) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'checklist' | 'comments' | 'history'>('info');
  const [commentInput, setCommentInput] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editDueDate, setEditDueDate] = useState(task.dueDate);
  const [editProgress, setEditProgress] = useState(task.progress);

  const isOverdue = taskService.isOverdue(task);
  const isDueSoon = taskService.isDueSoon(task);

  const canApprove =
    (currentUser.role === 'admin' || currentUser.role === 'executive' || currentUser.role === 'manager') &&
    task.requiresApproval &&
    task.approvalStatus === 'pending';

  const handleStatusChange = (newStatus: TaskStatus) => {
    taskService.updateStatus(task.id, newStatus, currentUser.name);
    onTaskUpdated?.();
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    taskService.updateTask(task.id, { priority: newPriority }, currentUser.name);
    onTaskUpdated?.();
  };

  const handleToggleChecklist = (chkId: string) => {
    taskService.toggleChecklist(task.id, chkId, currentUser.name);
    onTaskUpdated?.();
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    const newItem = {
      id: `chk-${Date.now()}`,
      title: newChecklistTitle.trim(),
      completed: false,
    };
    taskService.updateTask(
      task.id,
      { checklist: [...(task.checklist || []), newItem] },
      currentUser.name
    );
    setNewChecklistTitle('');
    onTaskUpdated?.();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    taskService.addComment(task.id, commentInput.trim(), {
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
    });
    setCommentInput('');
    onTaskUpdated?.();
  };

  const handleApprove = () => {
    taskService.approveTask(task.id, currentUser.name, approvalNote);
    onTaskUpdated?.();
  };

  const handleReject = () => {
    if (!approvalNote.trim()) {
      alert('Vui lòng nhập lý do hoặc nội dung yêu cầu bổ sung.');
      return;
    }
    taskService.rejectTask(task.id, currentUser.name, approvalNote);
    onTaskUpdated?.();
  };

  const handleSaveEdit = () => {
    taskService.updateTask(
      task.id,
      {
        title: editTitle,
        description: editDesc,
        dueDate: editDueDate,
        progress: editProgress,
        status: editProgress === 100 ? 'COMPLETED' : task.status,
      },
      currentUser.name
    );
    setIsEditing(false);
    onTaskUpdated?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-[#005993] text-white rounded-lg shadow-2xs">
              {task.code}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {task.departmentName}
              </span>
              {task.projectName && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-[#005993] font-medium truncate max-w-[200px]">
                    {task.projectName}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Status Controls */}
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-base sm:text-lg font-bold text-slate-900 border border-slate-300 rounded-lg p-2.5 focus:border-[#005993] outline-hidden"
                />
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-700 border border-slate-300 rounded-lg p-2.5 focus:border-[#005993] outline-hidden"
                  placeholder="Mô tả chi tiết công việc..."
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#005993] hover:bg-[#004777] rounded-lg"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {task.title}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-[#005993] font-semibold hover:underline shrink-0"
                >
                  Chỉnh sửa
                </button>
              </div>
            )}

            {!isEditing && task.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {task.description}
              </p>
            )}

            {/* Quick Status and Priority Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Trạng thái
                </label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800"
                >
                  {contentData.taskStatuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Mức ưu tiên
                </label>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                  className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800"
                >
                  {contentData.priorities.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Hạn hoàn thành
                </label>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg p-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className={isOverdue ? 'text-[#D71249]' : ''}>{task.dueDate}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Tiến độ ({task.progress}%)
                </label>
                <div className="pt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={task.progress}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      taskService.updateTask(
                        task.id,
                        { progress: val, status: val === 100 ? 'COMPLETED' : task.status },
                        currentUser.name
                      );
                      onTaskUpdated?.();
                    }}
                    className="w-full accent-[#005993]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* People & Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#005993] text-white font-bold flex items-center justify-center">
                {task.assigneeName.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Người thực hiện chính</p>
                <p className="text-xs font-bold text-slate-800">{task.assigneeName}</p>
                <p className="text-[10px] text-slate-500">{task.departmentName}</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center">
                {task.creatorName.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Người giao việc</p>
                <p className="text-xs font-bold text-slate-800">{task.creatorName}</p>
                <p className="text-[10px] text-slate-500">Khởi tạo ngày: {task.createdDate}</p>
              </div>
            </div>
          </div>

          {/* Approval Section */}
          {task.requiresApproval && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-xs text-amber-900">
                    Quy trình kiểm soát & Phê duyệt nghiệm thu
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase ${
                  task.approvalStatus === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : task.approvalStatus === 'rejected'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {task.approvalStatus === 'approved'
                    ? 'Đã nghiệm thu'
                    : task.approvalStatus === 'rejected'
                    ? 'Yêu cầu làm lại'
                    : 'Chờ lãnh đạo duyệt'}
                </span>
              </div>

              {task.approvalStatus === 'approved' && task.approvedBy && (
                <div className="text-xs text-emerald-800 font-medium">
                  Đã được phê duyệt bởi: <strong>{task.approvedBy}</strong> vào lúc {task.approvedAt}
                  {task.approvalNote && <p className="italic text-slate-600 mt-1">"{task.approvalNote}"</p>}
                </div>
              )}

              {canApprove && (
                <div className="space-y-2 pt-2 border-t border-amber-200">
                  <input
                    type="text"
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    placeholder="Ghi chú ý kiến thẩm định / phê duyệt..."
                    className="w-full text-xs p-2 bg-white border border-amber-200 rounded-lg outline-hidden focus:ring-1 focus:ring-[#005993]"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleApprove}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Phê duyệt nghiệm thu
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 rounded-lg flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Yêu cầu bổ sung
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex items-center gap-6 text-xs font-bold">
              {[
                { id: 'info', label: 'Checklist công việc', count: task.checklist?.length },
                { id: 'comments', label: 'Thảo luận & Bình luận', count: task.comments?.length },
                { id: 'history', label: 'Nhật ký kiểm toán', count: task.activityLogs?.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-[#005993] text-[#005993]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content: Checklist */}
          {activeTab === 'info' && (
            <div className="space-y-3">
              <div className="space-y-2">
                {task.checklist?.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="rounded text-[#005993] focus:ring-[#005993] w-4 h-4 cursor-pointer"
                    />
                    <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add checklist item */}
              <form onSubmit={handleAddChecklist} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder="Thêm mục kiểm tra công việc mới..."
                  className="flex-1 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#005993] outline-hidden text-slate-800"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Thêm mục
                </button>
              </form>
            </div>
          )}

          {/* Tab Content: Comments */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {task.comments?.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Chưa có ý kiến thảo luận nào. Hãy để lại trao đổi bên dưới.
                  </div>
                ) : (
                  task.comments?.map((cmt) => (
                    <div key={cmt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{cmt.userName}</span>
                        <span className="text-slate-400 text-[10px]">{cmt.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{cmt.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Post comment */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Nhập ý kiến trao đổi hoặc chỉ đạo công việc..."
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#005993] outline-hidden text-slate-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005993] hover:bg-[#004777] text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Gửi
                </button>
              </form>
            </div>
          )}

          {/* Tab Content: History Audit Log */}
          {activeTab === 'history' && (
            <div className="space-y-2.5">
              {task.activityLogs?.map((log) => (
                <div key={log.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{log.user}: </span>
                    <span className="text-slate-600">{log.action}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap ml-4">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                taskService.duplicateTask(task.id, currentUser.name);
                onClose();
                onTaskUpdated?.();
              }}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 font-medium"
            >
              <Copy className="w-3.5 h-3.5" />
              Nhân bản việc
            </button>
            <button
              onClick={() => {
                if (confirm(`Bạn có chắc muốn xóa công việc ${task.code}?`)) {
                  taskService.deleteTask(task.id, currentUser.name);
                  onClose();
                  onTaskUpdated?.();
                }
              }}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa mềm
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
