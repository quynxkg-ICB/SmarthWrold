import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Calendar,
  Building,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { Project, Task, User } from '../../types';
import contentData from '../../data/contentData.json';

interface ProjectsViewProps {
  tasks: Task[];
  currentUser: User;
  onOpenTaskDetails: (task: Task) => void;
  onSelectProjectFilter: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  tasks,
  currentUser,
  onOpenTaskDetails,
  onSelectProjectFilter,
}) => {
  const [projects, setProjects] = useState<Project[]>(
    contentData.projects as unknown as Project[]
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0].id);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === selectedProject.id);
  const completedCount = projectTasks.filter((t) => t.status === 'COMPLETED').length;
  const projectProgress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : selectedProject.progress;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Dự án & Kế hoạch Trọng điểm
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi tiến độ các chiến dịch kinh doanh, tín dụng và chuyển đổi số tại Kiên Giang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Tổng số: <strong className="text-[#005993]">{projects.length} dự án</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Projects List Column */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 px-1">
            Danh sách đề án & kế hoạch
          </h3>

          {projects.map((proj) => {
            const isSelected = proj.id === selectedProjectId;
            const pTasks = tasks.filter((t) => t.projectId === proj.id);
            const pDone = pTasks.filter((t) => t.status === 'COMPLETED').length;
            const pct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : proj.progress;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/70 border-[#005993] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#005993] border border-sky-200">
                    {proj.code}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{pct}%</span>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                  {proj.name}
                </h4>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3 mb-2">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-[#005993]'}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{proj.managerName}</span>
                  <span>{pTasks.length} nhiệm vụ</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Project Details Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-[#005993] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {selectedProject.code}
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Đang triển khai
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {selectedProject.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {selectedProject.description}
            </p>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Trưởng dự án</span>
              <strong className="text-slate-800 font-semibold">{selectedProject.managerName}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Thời gian thực hiện</span>
              <span className="text-slate-700 font-semibold">{selectedProject.startDate} - {selectedProject.endDate}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tiến độ tổng thể</span>
              <strong className="text-[#005993] font-bold">{projectProgress}% ({completedCount}/{projectTasks.length} việc)</strong>
            </div>
          </div>

          {/* Tasks in this project */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-[#005993]" />
                Các nhiệm vụ trực thuộc ({projectTasks.length})
              </h4>

              <button
                onClick={() => onSelectProjectFilter(selectedProject.id)}
                className="text-xs font-bold text-[#005993] hover:underline"
              >
                Mở trong bảng công việc
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {projectTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onOpenTaskDetails(t)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#005993] bg-sky-50 px-1.5 py-0.5 rounded">
                      {t.code}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{t.title}</p>
                      <p className="text-[10px] text-slate-400">{t.departmentName} • {t.assigneeName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Hạn: {t.dueDate}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}

              {projectTasks.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Dự án này chưa có công việc con nào được gán.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsView;
