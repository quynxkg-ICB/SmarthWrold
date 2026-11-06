import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Building,
  UserCheck,
  Briefcase,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Task, User, TaskPriority, TaskStatus } from '../../types';
import contentData from '../../data/contentData.json';
import { taskService } from '../../services/taskService';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  prefillDate?: string;
  onTaskCreated: (newTask: Task) => void;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  prefillDate,
  onTaskCreated,
}) => {
  if (!isOpen) return null;

  // Format today's date
  const now = new Date();
  const formatD = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const defaultDueDate = new Date(now);
  defaultDueDate.setDate(defaultDueDate.getDate() + 5);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(contentData.projects[0].id);
  const [departmentId, setDepartmentId] = useState(currentUser.departmentId || contentData.departments[1].id);
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [startDate, setStartDate] = useState(prefillDate || formatD(now));
  const [dueDate, setDueDate] = useState(prefillDate || formatD(defaultDueDate));
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [checklistItems, setChecklistItems] = useState<string[]>(['Rà soát hồ sơ theo quy định', 'Lập biên bản báo cáo']);
  const [newChecklistText, setNewChecklistText] = useState('');

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklistItems([...checklistItems, newChecklistText.trim()]);
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (idx: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề công việc.');
      return;
    }

    const selectedDept = contentData.departments.find((d) => d.id === departmentId);
    const selectedAssignee = contentData.users.find((u) => u.id === assigneeId);
    const selectedProj = contentData.projects.find((p) => p.id === projectId);

    const newTask = taskService.createTask({
      title: title.trim(),
      description: description.trim(),
      projectId: projectId || undefined,
      projectName: selectedProj?.name,
      departmentId,
      departmentName: selectedDept?.name || 'Chi nhánh Kiên Giang',
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      assigneeId,
      assigneeName: selectedAssignee?.name || 'Cán bộ thụ lý',
      collaborators: [],
      startDate,
      dueDate,
      completedDate: null,
      status: 'TODO' as TaskStatus,
      priority,
      progress: 0,
      labels: ['Công việc chi nhánh', selectedDept?.code || 'VTB'],
      requiresApproval,
      approvalStatus: requiresApproval ? 'pending' : 'none',
      checklist: checklistItems.map((text, i) => ({
        id: `chk-${Date.now()}-${i}`,
        title: text,
        completed: false,
      })),
      comments: [],
      attachments: [],
    });

    onTaskCreated(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Giao việc & Khởi tạo nhiệm vụ mới
            </h2>
            <p className="text-xs text-slate-500">
              Hệ thống Quản lý Công việc VietinBank Chi nhánh Kiên Giang
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiêu đề nhiệm vụ <span className="text-[#D71249]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Thẩm định hồ sơ hạn mức tín dụng Doanh nghiệp..."
              className="w-full text-xs sm:text-sm font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#005993] outline-hidden text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nội dung mô tả & Yêu cầu chỉ đạo
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chi tiết công việc cần làm, căn cứ văn bản chỉ đạo hoặc mục tiêu nghiệm thu..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#005993] outline-hidden text-slate-800"
            />
          </div>

          {/* Department & Project row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-[#005993]" />
                Phòng ban chủ trì
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                {contentData.departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-[#005993]" />
                Thuộc Dự án / Kế hoạch
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="">-- Công việc độc lập ngoài dự án --</option>
                {contentData.projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee & Priority row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#005993]" />
                Người thực hiện chính <span className="text-[#D71249]">*</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                {contentData.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} - {u.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mức độ ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
              >
                {contentData.priorities.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày bắt đầu (DD/MM/YYYY)
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hạn chót hoàn thành (DD/MM/YYYY) <span className="text-[#D71249]">*</span>
              </label>
              <input
                type="text"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
              />
            </div>
          </div>

          {/* Approval toggle */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50 border border-sky-100">
            <input
              type="checkbox"
              id="reqApproval"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              className="w-4 h-4 rounded text-[#005993] focus:ring-[#005993]"
            />
            <label htmlFor="reqApproval" className="text-xs text-slate-700 cursor-pointer font-medium">
              <strong className="text-[#005993]">Yêu cầu phê duyệt:</strong> Sau khi hoàn thành, công việc phải được Lãnh đạo phòng/Ban Giám đốc kiểm tra và phê duyệt nghiệm thu.
            </label>
          </div>

          {/* Checklist definition */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Checklist các bước thực hiện
            </label>
            <div className="space-y-1.5">
              {checklistItems.map((chk, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-700">{idx + 1}. {chk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklist(idx)}
                    className="text-slate-400 hover:text-[#D71249] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Nhập tiêu chí công việc con..."
                className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#005993] hover:bg-[#004777] rounded-lg shadow-xs active:scale-98 transition-all"
            >
              Giao việc ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreateModal;
