import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  ListTodo,
  Send,
  Kanban,
  Calendar,
  Briefcase,
  Building2,
  Users,
  BarChart3,
  Sparkles,
  FileCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import BrandLogo from '../brand/BrandLogo';
import FlowerBand from '../brand/FlowerBand';
import contentData from '../../data/contentData.json';
import { User, Task } from '../../types';

interface SidebarProps {
  currentView: string;
  onSelectView: (viewId: string) => void;
  currentUser: User;
  tasks: Task[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  CheckSquare,
  ListTodo,
  Send,
  Kanban,
  Calendar,
  Briefcase,
  Building2,
  Users,
  BarChart3,
  Sparkles,
  FileCheck,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  tasks,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  // Counts for sidebar badges
  const myTasksCount = tasks.filter((t) => t.assigneeId === currentUser.id && t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
  const pendingApprovalsCount = tasks.filter((t) => t.requiresApproval && t.approvalStatus === 'pending').length;
  const overdueCount = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    const parts = t.dueDate.split('/');
    if (parts.length !== 3) return false;
    const due = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    due.setHours(23, 59, 59);
    return new Date().getTime() > due.getTime();
  }).length;

  const navItems = contentData.navigation.filter((item) => {
    return item.roles.includes(currentUser.role);
  });

  const getBadge = (id: string) => {
    if (id === 'my_tasks' && myTasksCount > 0) {
      return (
        <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-[#7ED3F7] text-[#005993]">
          {myTasksCount}
        </span>
      );
    }
    if (id === 'approvals' && pendingApprovalsCount > 0) {
      return (
        <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-[#D71249] text-white animate-pulse">
          {pendingApprovalsCount}
        </span>
      );
    }
    if (id === 'all_tasks' && overdueCount > 0) {
      return (
        <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold rounded-sm bg-rose-600/80 text-white">
          {overdueCount} trễ
        </span>
      );
    }
    return null;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#005993] text-white select-none">
      {/* Top Header Logo */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 relative">
        <div className="flex items-center justify-center overflow-hidden py-0.5">
          <BrandLogo
            variant={collapsed ? 'icon-only' : 'white'}
            size={collapsed ? 'sm' : 'md'}
          />
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-white/80 hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* VietinBank Blooming Floral Accent Ribbon */}
      <FlowerBand height={3} />

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || ListTodo;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectView(item.id);
                onCloseMobile();
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-[#005993] shadow-md font-semibold'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-[#005993]' : 'text-white/90'
                }`}
              />

              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {getBadge(item.id)}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Security & Organization Badge */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-white/10 border border-white/10 text-xs text-white/80">
          <div className="flex items-center gap-2 mb-1 text-white font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#7ED3F7]" />
            <span>Môi trường Nội bộ VTB</span>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            Hệ thống quản lý công việc và tuân thủ an toàn thông tin VietinBank.
          </p>
        </div>
      )}

      {/* Bottom Collapse Toggle (Desktop) */}
      <div className="hidden lg:flex items-center justify-between p-3 border-t border-white/10 text-xs text-white/70">
        {!collapsed && <span>{contentData.appInfo.version}</span>}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 ml-auto transition-colors"
          title={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 transition-all duration-300 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 h-full bg-[#005993] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
