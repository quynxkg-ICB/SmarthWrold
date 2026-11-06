/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './features/dashboard/Dashboard';
import { TaskList } from './features/tasks/TaskList';
import { KanbanBoard } from './features/kanban/KanbanBoard';
import { CalendarView } from './features/calendar/CalendarView';
import { ProjectsView } from './features/projects/ProjectsView';
import { DepartmentsView } from './features/departments/DepartmentsView';
import { PersonnelView } from './features/users/PersonnelView';
import { ReportsView } from './features/reports/ReportsView';
import { AIAssistant } from './features/ai/AIAssistant';
import { ApprovalsView } from './features/approvals/ApprovalsView';
import { SettingsView } from './features/settings/SettingsView';
import { TaskDetailModal } from './features/tasks/TaskDetailModal';
import { TaskCreateModal } from './features/tasks/TaskCreateModal';

import { Task, User, NotificationItem } from './types';
import contentData from './data/contentData.json';
import { taskService } from './services/taskService';
import { authService } from './services/authService';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [tasks, setTasks] = useState<Task[]>(() => taskService.getTasks());
  const [currentUser, setCurrentUser] = useState<User>(() => authService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => authService.getAllUsers());
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    contentData.notifications as unknown as NotificationItem[]
  );

  // Modals & UI States
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mainContentRef = useRef<HTMLDivElement>(null);

  // Subscribe to reactive task service updates
  useEffect(() => {
    const unsubscribe = taskService.subscribe(() => {
      const updatedList = taskService.getTasks();
      setTasks(updatedList);
      // Keep selected task refreshed if open
      if (selectedTask) {
        const refreshed = updatedList.find((t) => t.id === selectedTask.id);
        setSelectedTask(refreshed || null);
      }
    });
    return () => unsubscribe();
  }, [selectedTask]);

  // GSAP transition when changing views
  useEffect(() => {
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
  }, [currentView]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSwitchUser = (userId: string) => {
    const user = authService.switchUser(userId);
    setCurrentUser({ ...user });
    showToast(`Đã chuyển sang tài khoản: ${user.name} (${user.title})`);
  };

  const handleOpenTaskDetails = (task: Task) => {
    setSelectedTask(task);
  };

  const handleOpenCreateTask = (date?: string) => {
    setPrefillDate(date);
    setIsCreateModalOpen(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    showToast(`Đã khởi tạo công việc mã ${newTask.code}`);
    // Add in-app notification
    const newNotif: NotificationItem = {
      id: `NTF-${Date.now()}`,
      title: 'Công việc mới được giao',
      message: `Nhiệm vụ "${newTask.title}" đã được giao cho ${newTask.assigneeName}.`,
      type: 'info',
      taskId: newTask.id,
      timestamp: 'Vừa xong',
      read: false,
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    showToast('Đã đánh dấu đã đọc tất cả thông báo');
  };

  const handleResetDemoData = () => {
    taskService.resetToDemo();
    setTasks(taskService.getTasks());
    showToast('Đã khôi phục dữ liệu mẫu VietinBank Kiên Giang');
  };

  // KPIs calculation
  const kpis = taskService.calculateKPIs(tasks);

  return (
    <div className="flex h-screen w-full bg-[#F7F9FC] text-[#172B4D] overflow-hidden">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-60 bg-[#005993] text-white px-4 py-2.5 rounded-xl shadow-xl border border-sky-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#7ED3F7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          setSearchQuery('');
        }}
        currentUser={currentUser}
        tasks={tasks}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          currentView={currentView}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          currentUser={currentUser}
          allUsers={allUsers}
          onSwitchUser={handleSwitchUser}
          onOpenCreateTask={() => handleOpenCreateTask()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onSelectTaskFromNotification={(taskId) => {
            const t = taskService.getTaskById(taskId);
            if (t) handleOpenTaskDetails(t);
          }}
          onResetDemoData={handleResetDemoData}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div ref={mainContentRef} className="max-w-7xl mx-auto pb-12">
            {currentView === 'overview' && (
              <Dashboard
                tasks={tasks}
                kpis={kpis}
                currentUser={currentUser}
                onOpenTaskDetails={handleOpenTaskDetails}
                onNavigateToView={setCurrentView}
                onOpenCreateTask={() => handleOpenCreateTask()}
              />
            )}

            {currentView === 'my_tasks' && (
              <TaskList
                tasks={tasks}
                currentUser={currentUser}
                onOpenTaskDetails={handleOpenTaskDetails}
                onOpenCreateTask={() => handleOpenCreateTask()}
                filterMode="my_tasks"
              />
            )}

            {currentView === 'all_tasks' && (
              <TaskList
                tasks={tasks}
                currentUser={currentUser}
                onOpenTaskDetails={handleOpenTaskDetails}
                onOpenCreateTask={() => handleOpenCreateTask()}
                filterMode="all"
              />
            )}

            {currentView === 'assigned_by_me' && (
              <TaskList
                tasks={tasks}
                currentUser={currentUser}
                onOpenTaskDetails={handleOpenTaskDetails}
                onOpenCreateTask={() => handleOpenCreateTask()}
                filterMode="assigned_by_me"
              />
            )}

            {currentView === 'kanban' && (
              <KanbanBoard
                tasks={tasks}
                currentUser={currentUser}
                onOpenTaskDetails={handleOpenTaskDetails}
                onOpenCreateTask={() => handleOpenCreateTask()}
              />
            )}

            {currentView === 'calendar' && (
              <CalendarView
                tasks={tasks}
                currentUser={currentUser}
                onOpenTaskDetails={handleOpenTaskDetails}
                onOpenCreateTask={handleOpenCreateTask}
              />
            )}

            {currentView === 'projects' && (
              <ProjectsView
                tasks={tasks}
                currentUser={currentUser}
                onOpenTaskDetails={handleOpenTaskDetails}
                onSelectProjectFilter={(projId) => {
                  setCurrentView('all_tasks');
                }}
              />
            )}

            {currentView === 'departments' && (
              <DepartmentsView
                tasks={tasks}
                currentUser={currentUser}
                onSelectDepartmentTasks={(deptId) => {
                  setCurrentView('all_tasks');
                }}
              />
            )}

            {currentView === 'personnel' && (
              <PersonnelView
                currentUser={currentUser}
                onSwitchUser={handleSwitchUser}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView
                tasks={tasks}
                kpis={kpis}
                currentUser={currentUser}
              />
            )}

            {currentView === 'ai_assistant' && (
              <AIAssistant
                tasks={tasks}
                kpis={kpis}
                currentUser={currentUser}
                onTasksGenerated={() => {
                  showToast('Đã nhập các nhiệm vụ AI vào hệ thống thành công');
                }}
              />
            )}

            {currentView === 'approvals' && (
              <ApprovalsView
                tasks={tasks}
                currentUser={currentUser}
                onOpenTaskDetails={handleOpenTaskDetails}
                onRefresh={() => setTasks(taskService.getTasks())}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                tasks={tasks}
                currentUser={currentUser}
                onResetDemoData={handleResetDemoData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Task Details & Audit Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        currentUser={currentUser}
        onTaskUpdated={() => {
          setTasks(taskService.getTasks());
        }}
      />

      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        prefillDate={prefillDate}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
