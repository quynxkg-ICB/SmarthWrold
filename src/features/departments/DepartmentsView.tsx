import React, { useState } from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  ListTodo,
  Plus,
  Search,
  ExternalLink,
  Shield,
  MapPin,
} from 'lucide-react';
import { Department, Task, User } from '../../types';
import contentData from '../../data/contentData.json';

interface DepartmentsViewProps {
  tasks: Task[];
  currentUser: User;
  onSelectDepartmentTasks: (deptId: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  tasks,
  currentUser,
  onSelectDepartmentTasks,
}) => {
  const [departments, setDepartments] = useState<Department[]>(
    contentData.departments as unknown as Department[]
  );
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptManager, setNewDeptManager] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.manager.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCode.trim()) return;
    const newDept: Department = {
      id: `DEPT-${Date.now()}`,
      name: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase(),
      manager: newDeptManager.trim() || 'Chưa chỉ định',
      managerTitle: 'Trưởng phòng',
      membersCount: 1,
      description: newDeptDesc.trim() || 'Phòng ban trực thuộc VietinBank Chi nhánh Kiên Giang',
    };
    setDepartments([...departments, newDept]);
    setShowAddModal(false);
    setNewDeptName('');
    setNewDeptCode('');
    setNewDeptManager('');
    setNewDeptDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Cơ cấu Tổ chức & Phòng ban Nghiệp vụ
          </h2>
          <p className="text-xs text-slate-500">
            VietinBank Chi nhánh Kiên Giang • Quản lý danh mục phòng ban và phân cấp nhiệm vụ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm phòng ban..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden"
            />
          </div>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-[#005993] hover:bg-[#004777] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm đơn vị</span>
            </button>
          )}
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => {
          const deptTasks = tasks.filter((t) => t.departmentId === dept.id);
          const completedTasks = deptTasks.filter((t) => t.status === 'COMPLETED');
          const isPGD = dept.code.startsWith('PGD');

          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isPGD ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-[#005993]'
                    }`}>
                      {isPGD ? <MapPin className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                        {dept.code}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5 line-clamp-1">
                        {dept.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {dept.description}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 py-2 border-y border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]">Lãnh đạo đơn vị:</span>
                    <strong className="text-slate-800 font-semibold">{dept.manager}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]">Quy mô nhân sự:</span>
                    <span className="font-semibold text-slate-700">{dept.membersCount} cán bộ</span>
                  </div>
                </div>
              </div>

              {/* Footer stats and view button */}
              <div className="pt-4 mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <ListTodo className="w-4 h-4 text-[#005993]" />
                  <span>{deptTasks.length} việc ({completedTasks.length} xong)</span>
                </div>

                <button
                  onClick={() => onSelectDepartmentTasks(dept.id)}
                  className="text-xs font-bold text-[#005993] hover:underline flex items-center gap-1"
                >
                  Xem nhiệm vụ <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Thêm đơn vị phòng ban mới</h3>
            <form onSubmit={handleAddDepartment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên đơn vị / Phòng ban</label>
                <input
                  type="text"
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="VD: Phòng Kiểm tra Kiểm soát Nội bộ"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã đơn vị</label>
                  <input
                    type="text"
                    required
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    placeholder="VD: KTKSNB"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lãnh đạo đơn vị</label>
                  <input
                    type="text"
                    value={newDeptManager}
                    onChange={(e) => setNewDeptManager(e.target.value)}
                    placeholder="Họ và tên..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chức năng nhiệm vụ</label>
                <textarea
                  rows={2}
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  placeholder="Mô tả chức năng chính..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#005993] hover:bg-[#004777] rounded-lg"
                >
                  Lưu đơn vị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsView;
