import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Building,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { User, RoleId } from '../../types';
import contentData from '../../data/contentData.json';

interface PersonnelViewProps {
  currentUser: User;
  onSwitchUser: (userId: string) => void;
}

export const PersonnelView: React.FC<PersonnelViewProps> = ({
  currentUser,
  onSwitchUser,
}) => {
  const [users, setUsers] = useState<User[]>(contentData.users as unknown as User[]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [deptInput, setDeptInput] = useState(contentData.departments[0].id);
  const [roleInput, setRoleInput] = useState<RoleId>('member');

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchTitle = u.title.toLowerCase().includes(q);
      const matchDept = u.departmentName.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchTitle && !matchDept) return false;
    }
    return true;
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim()) return;
    const deptObj = contentData.departments.find((d) => d.id === deptInput);
    const newUser: User = {
      id: `USR-${Date.now()}`,
      name: nameInput.trim(),
      email: emailInput.trim(),
      role: roleInput,
      departmentId: deptInput,
      departmentName: deptObj?.name || 'Chi nhánh Kiên Giang',
      title: titleInput.trim() || 'Chuyên viên nghiệp vụ',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
      status: 'active',
    };
    setUsers([...users, newUser]);
    setShowInviteModal(false);
    setNameInput('');
    setEmailInput('');
    setTitleInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Danh bạ Cán bộ & Phân quyền Hệ thống
          </h2>
          <p className="text-xs text-slate-500">
            Cán bộ nhân viên thuộc VietinBank Chi nhánh Kiên Giang
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, chức danh..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="executive">Ban Giám đốc</option>
            <option value="manager">Trưởng phòng</option>
            <option value="member">Chuyên viên</option>
            <option value="admin">System Admin</option>
          </select>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-1.5 bg-[#005993] hover:bg-[#004777] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm cán bộ</span>
            </button>
          )}
        </div>
      </div>

      {/* User cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredUsers.map((user) => {
          const isMe = user.id === currentUser.id;
          const roleObj = contentData.roles.find((r) => r.id === user.role);

          return (
            <div
              key={user.id}
              className={`bg-white rounded-2xl p-5 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                isMe ? 'border-[#005993] ring-1 ring-[#005993]/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'executive'
                      ? 'bg-rose-100 text-[#D71249]'
                      : user.role === 'manager'
                      ? 'bg-sky-100 text-[#005993]'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {roleObj?.name || user.role}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {user.name}
                </h3>
                <p className="text-xs text-[#005993] font-semibold mt-0.5">
                  {user.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{user.departmentName}</span>
                </p>

                <div className="pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2">
                <button
                  onClick={() => onSwitchUser(user.id)}
                  className={`w-full py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    isMe
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-slate-100 hover:bg-[#005993] hover:text-white text-slate-700'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isMe ? 'Đang đăng nhập' : 'Chuyển sang cán bộ này'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Thêm hồ sơ Cán bộ mới</h3>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên cán bộ</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="VD: Nguyễn Thành Trung"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email nội bộ VietinBank</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="trung.nt@vietinbank.vn"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chức danh</label>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="VD: Chuyên viên QLRR"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò hệ thống</label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value as RoleId)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden font-bold"
                  >
                    <option value="member">Chuyên viên</option>
                    <option value="manager">Trưởng phòng</option>
                    <option value="executive">Ban Giám đốc</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phòng ban công tác</label>
                <select
                  value={deptInput}
                  onChange={(e) => setDeptInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden font-medium"
                >
                  {contentData.departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#005993] hover:bg-[#004777] rounded-lg"
                >
                  Thêm cán bộ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelView;
