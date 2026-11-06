import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  ChevronDown,
  UserCheck,
  Building,
  CheckCheck,
  AlertTriangle,
  Clock,
  Info,
  LogOut,
  RotateCcw,
} from 'lucide-react';
import { User, NotificationItem } from '../../types';
import contentData from '../../data/contentData.json';
import FlowerBand from '../brand/FlowerBand';

interface HeaderProps {
  currentView: string;
  onOpenMobileSidebar: () => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  onOpenCreateTask: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onSelectTaskFromNotification?: (taskId: string) => void;
  onResetDemoData: () => void;
}

const viewTitles: Record<string, string> = {
  overview: 'Tổng quan điều hành',
  my_tasks: 'Công việc của tôi',
  all_tasks: 'Tất cả nhiệm vụ',
  assigned_by_me: 'Nhiệm vụ tôi giao',
  kanban: 'Bảng tiến độ Kanban',
  calendar: 'Lịch công tác & hạn hoàn thành',
  projects: 'Dự án & Kế hoạch trọng điểm',
  departments: 'Cơ cấu phòng ban',
  personnel: 'Danh bạ cán bộ nhân sự',
  reports: 'Báo cáo thống kê & Xuất dữ liệu',
  ai_assistant: 'Trợ lý AI Gemini',
  approvals: 'Quy trình phê duyệt công việc',
  settings: 'Cấu hình hệ thống & Kiểm toán',
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenMobileSidebar,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenCreateTask,
  searchQuery,
  onSearchChange,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectTaskFromNotification,
  onResetDemoData,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#E2E8F0] shadow-xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumb Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5 text-[#005993]" />
          </button>

          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{contentData.appInfo.branch}</span>
              <span>/</span>
              <span className="text-[#005993] font-semibold">
                {viewTitles[currentView] || 'Quản lý công việc'}
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#172B4D] tracking-tight">
              {viewTitles[currentView] || 'Tổng quan'}
            </h1>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo mã việc, tiêu đề, phòng ban, cán bộ..."
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#005993] focus:ring-2 focus:ring-[#7ED3F7]/40 outline-hidden transition-all text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Right: Actions, Notifications & User Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Task Button */}
          <button
            onClick={onOpenCreateTask}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#005993] hover:bg-[#004777] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs hover:shadow-sm active:scale-98 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Giao việc mới</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#005993] transition-colors"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#D71249] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">Thông báo điều hành</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[11px] bg-rose-50 text-[#D71249] font-bold rounded-full border border-rose-200">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-xs text-[#005993] hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Đọc tất cả
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Không có thông báo mới nào
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onMarkNotificationRead(n.id);
                          if (n.taskId && onSelectTaskFromNotification) {
                            onSelectTaskFromNotification(n.taskId);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-2.5 ${
                          !n.read ? 'bg-sky-50/50' : ''
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {n.type === 'danger' && <AlertTriangle className="w-4 h-4 text-[#D71249]" />}
                          {n.type === 'warning' && <Clock className="w-4 h-4 text-amber-500" />}
                          {n.type === 'info' && <Info className="w-4 h-4 text-[#005993]" />}
                          {n.type === 'success' && <CheckCheck className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#005993] shrink-0 mt-1" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#005993]/20"
              />
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-medium text-slate-500 truncate max-w-[130px]">
                  {currentUser.title}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown & Fast Role Switcher */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#005993] mb-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>{currentUser.departmentName}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-sm bg-sky-100 text-[#005993] uppercase tracking-wide">
                    {currentUser.role}
                  </span>
                </div>

                {/* Instant Switch Account to test permissions */}
                <div className="p-2 border-b border-slate-100">
                  <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#005993]" />
                    Chuyển đổi cán bộ thử nghiệm
                  </p>
                  <div className="space-y-1 mt-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-sky-50 font-bold text-[#005993]'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate font-medium">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.title}</p>
                        </div>
                        {u.id === currentUser.id && (
                          <span className="w-2 h-2 rounded-full bg-[#005993] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Data Action */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      if (confirm('Khôi phục lại dữ liệu mẫu VietinBank Kiên Giang ban đầu?')) {
                        onResetDemoData();
                        setShowUserMenu(false);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    Khôi phục dữ liệu mẫu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VietinBank Blooming Floral Accent line at the bottom of header */}
      <FlowerBand height={2} />
    </header>
  );
};

export default Header;
