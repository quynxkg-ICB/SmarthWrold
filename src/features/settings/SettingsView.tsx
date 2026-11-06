import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  History,
  Sparkles,
  FileText,
  RotateCcw,
  Download,
  AlertTriangle,
  Building,
  Key,
} from 'lucide-react';
import { Task, User } from '../../types';
import contentData from '../../data/contentData.json';
import { aiService } from '../../services/aiService';
import BrandLogo from '../../components/brand/BrandLogo';
import FlowerBand from '../../components/brand/FlowerBand';

interface SettingsViewProps {
  tasks: Task[];
  currentUser: User;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  tasks,
  currentUser,
  onResetDemoData,
}) => {
  const [aiEnabled, setAiEnabled] = useState(aiService.isAIEnabled());

  // Aggregate all activity logs
  const allLogs = tasks.flatMap((t) =>
    (t.activityLogs || []).map((log) => ({
      ...log,
      taskCode: t.code,
      taskTitle: t.title,
    }))
  ).sort((a, b) => b.id.localeCompare(a.id));

  const handleToggleAI = (val: boolean) => {
    aiService.setAIEnabled(val);
    setAiEnabled(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#005993]" />
            Cấu hình Hệ thống & Nhật ký Kiểm toán
          </h2>
          <p className="text-xs text-slate-500">
            Quản trị tham số kỹ thuật, an toàn thông tin và truy vết thay đổi
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Khôi phục dữ liệu mẫu ban đầu của VietinBank Kiên Giang?')) {
              onResetDemoData();
            }
          }}
          className="px-3.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1.5 border border-amber-200 shadow-2xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Khôi phục dữ liệu demo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Security & Guidelines */}
        <div className="space-y-6">
          {/* Brand Identity Guidelines */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#005993]" />
              Bộ Nhận diện Thương hiệu VietinBank
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
              <BrandLogo size="md" />
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Font chuẩn:</span>
                <strong className="text-slate-800">SVN-Gilroy / Be Vietnam Pro</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Màu chính (Primary):</span>
                <span className="font-mono font-bold text-[#005993]">#005993</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Màu điểm nhấn (Accent):</span>
                <span className="font-mono font-bold text-[#D71249]">#D71249</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Màu phụ (Secondary):</span>
                <span className="font-mono font-bold text-[#7ED3F7]">#7ED3F7</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <a
                href="/assets/aistudio/Logo_v__T_n_CN_Kien_Giang_0c3d3903.pdf"
                target="_blank"
                rel="noreferrer"
                className="w-full text-xs font-bold text-[#005993] hover:underline flex items-center gap-1.5 py-1"
              >
                <Download className="w-3.5 h-3.5" />
                Tải PDF Logo & Tên CN Kiên Giang
              </a>
              <a
                href="/assets/aistudio/Quy_chuan_thiet_ke_v1.0___1__d7367478.pdf"
                target="_blank"
                rel="noreferrer"
                className="w-full text-xs font-bold text-[#005993] hover:underline flex items-center gap-1.5 py-1"
              >
                <Download className="w-3.5 h-3.5" />
                Tải PDF Quy chuẩn thiết kế v1.0
              </a>
            </div>
          </div>

          {/* AI Controls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#005993]" />
                Quản lý Trợ lý Gemini AI
              </h3>
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => handleToggleAI(e.target.checked)}
                className="w-4 h-4 rounded text-[#005993] focus:ring-[#005993]"
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bật/tắt tính năng trợ lý AI phân rã kế hoạch và phân tích rủi ro trên toàn bộ hệ thống VietinBank Kiên Giang.
            </p>
          </div>
        </div>

        {/* Right Column: System Audit Log */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-[#005993]" />
                Nhật ký Kiểm toán & Truy vết Thao tác (Audit Trail)
              </h3>
              <p className="text-xs text-slate-400">
                Ghi lại lịch sử khởi tạo, cập nhật trạng thái, giao việc và phê duyệt
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              {allLogs.length} sự kiện
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto custom-scrollbar">
            {allLogs.map((log) => (
              <div key={log.id} className="py-3 text-xs flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#005993] bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                      {log.taskCode}
                    </span>
                    <strong className="text-slate-800">{log.user}</strong>
                  </div>
                  <p className="text-slate-600 pl-0.5">{log.action}</p>
                  <p className="text-[11px] text-slate-400 pl-0.5 italic truncate max-w-md">
                    Nhiệm vụ: {log.taskTitle}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {log.timestamp}
                </span>
              </div>
            ))}

            {allLogs.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                Chưa có sự kiện kiểm toán nào được ghi nhận.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
