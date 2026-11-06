import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ListPlus,
  RefreshCw,
  TrendingUp,
  Building,
  Info,
} from 'lucide-react';
import { Task, KPIStats, User } from '../../types';
import contentData from '../../data/contentData.json';
import { aiService, GeneratedPlan } from '../../services/aiService';
import { taskService } from '../../services/taskService';
import FlowerBand from '../../components/brand/FlowerBand';

interface AIAssistantProps {
  tasks: Task[];
  kpis: KPIStats;
  currentUser: User;
  onTasksGenerated: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  tasks,
  kpis,
  currentUser,
  onTasksGenerated,
}) => {
  const [activeTab, setActiveTab] = useState<'planner' | 'risk' | 'report'>('planner');
  const [plannerInput, setPlannerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState<GeneratedPlan | null>(null);
  const [imported, setImported] = useState(false);
  const [riskAnalysisText, setRiskAnalysisText] = useState('');
  const [reportText, setReportText] = useState('');
  const [aiEnabled, setAiEnabled] = useState(aiService.isAIEnabled());

  const handleToggleAI = (enabled: boolean) => {
    aiService.setAIEnabled(enabled);
    setAiEnabled(enabled);
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannerInput.trim()) return;
    setLoading(true);
    setImported(false);
    try {
      const plan = await aiService.generatePlan(plannerInput.trim());
      setPlanResult(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportTasks = () => {
    if (!planResult) return;
    const now = new Date();
    const formatD = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    planResult.tasks.forEach((item, index) => {
      const due = new Date(now);
      due.setDate(due.getDate() + (item.daysToComplete || 5) + index);

      // Find an assignee from that department
      const deptUsers = contentData.users.filter((u) => u.departmentId === item.departmentId);
      const assignee = deptUsers.length > 0 ? deptUsers[0] : currentUser;

      taskService.createTask({
        title: item.title,
        description: `${item.description}\n\n[Kế hoạch AI: ${planResult.campaignName}]`,
        departmentId: item.departmentId,
        departmentName: item.departmentName,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        collaborators: [],
        startDate: formatD(now),
        dueDate: formatD(due),
        completedDate: null,
        status: 'TODO',
        priority: item.priority || 'MEDIUM',
        progress: 0,
        labels: ['AI Generated', ...(item.labels || [])],
        requiresApproval: true,
        approvalStatus: 'pending',
        checklist: [
          { id: `chk-ai-${Date.now()}-1`, title: 'Nghiên cứu văn bản chỉ đạo & kế hoạch', completed: false },
          { id: `chk-ai-${Date.now()}-2`, title: 'Thực hiện và nghiệm thu công việc', completed: false },
        ],
        comments: [],
        attachments: [],
      });
    });

    setImported(true);
    onTasksGenerated();
  };

  const handleRunRiskAnalysis = async () => {
    setLoading(true);
    try {
      const analysis = await aiService.analyzeRisks(tasks, kpis);
      setRiskAnalysisText(analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const report = await aiService.draftExecutiveReport(tasks, kpis);
      setReportText(report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-[#005993] to-[#00365a] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#7ED3F7] backdrop-blur-xs border border-white/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[#7ED3F7] text-xs font-semibold mb-1">
                <span>Trợ lý điều hành thông minh</span>
                <span>•</span>
                <span>VietinBank Kiên Giang</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Trợ lý AI Gemini – Quản trị Kế hoạch & Rủi ro
              </h2>
            </div>
          </div>

          {/* AI Security Controls */}
          {currentUser.role === 'admin' && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#7ED3F7]" />
              <span>Chế độ AI:</span>
              <button
                onClick={() => handleToggleAI(!aiEnabled)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                  aiEnabled ? 'bg-emerald-400 text-slate-900' : 'bg-slate-500 text-white'
                }`}
              >
                {aiEnabled ? 'Đang bật' : 'Đã tắt'}
              </button>
            </div>
          )}
        </div>

        <FlowerBand height={3} />

        {/* Banking Data Privacy Disclaimer */}
        <div className="p-4 bg-sky-50/70 border-b border-sky-100 flex items-start gap-2.5 text-xs text-slate-700">
          <Info className="w-4 h-4 text-[#005993] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#005993] font-bold">Tuân thủ an toàn thông tin Ngân hàng:</strong> Hệ thống áp dụng quy tắc phòng ngừa rò rỉ dữ liệu (DLP). Trợ lý AI chỉ xử lý mục tiêu và tiến độ công việc tổng thể. Nghiêm cấm đưa dữ liệu khách hàng, số tài khoản, số dư tiền gửi hoặc bí mật tín dụng lên các mô hình AI.
          </p>
        </div>

        {/* AI Mode Tabs */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'planner'
                ? 'bg-[#005993] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ListPlus className="w-4 h-4" />
            Lập kế hoạch phân rã công việc
          </button>

          <button
            onClick={() => {
              setActiveTab('risk');
              if (!riskAnalysisText) handleRunRiskAnalysis();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'risk'
                ? 'bg-[#005993] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Phân tích rủi ro & Nút thắt
          </button>

          <button
            onClick={() => {
              setActiveTab('report');
              if (!reportText) handleGenerateReport();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'report'
                ? 'bg-[#005993] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Soạn thảo báo cáo điều hành
          </button>
        </div>
      </div>

      {/* Tab 1: AI Work Breakdown Planner */}
      {activeTab === 'planner' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#005993]" />
              Tạo kế hoạch công việc tự động từ mục tiêu chiến lược
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Nhập mục tiêu công tác (VD: "Chiến dịch tín dụng thủy sản Q4", "Mở rộng dịch vụ POS tại Phú Quốc", "Tự kiểm tra an toàn kho quỹ"), AI sẽ đề xuất phân rã thành các đầu việc cụ thể cho từng phòng ban.
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-semibold">Gợi ý nhanh:</span>
            {[
              'Đẩy mạnh tín dụng xuất khẩu thủy sản Rạch Giá',
              'Gia tăng huy động vốn tiền gửi dân cư cuối năm 2026',
              'Mở rộng mạng lưới POS và thẻ tại Phú Quốc',
              'Rà soát an toàn thông tin và an toàn kho quỹ chi nhánh',
            ].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPlannerInput(prompt)}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-[#005993] text-slate-600 rounded-lg border border-slate-200 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleGeneratePlan} className="flex gap-3">
            <input
              type="text"
              value={plannerInput}
              onChange={(e) => setPlannerInput(e.target.value)}
              placeholder="Mô tả mục tiêu kế hoạch hoặc nhiệm vụ cần phân rã..."
              className="flex-1 text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#005993] outline-hidden text-slate-800"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#005993] hover:bg-[#004777] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all shadow-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Phân rã kế hoạch</span>
            </button>
          </form>

          {/* Generated Plan Preview */}
          {planResult && (
            <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-200 pb-3">
                <div>
                  <h4 className="font-extrabold text-base text-[#005993]">
                    {planResult.campaignName}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mục tiêu: {planResult.objective}
                  </p>
                </div>

                {!imported ? (
                  <button
                    onClick={handleImportTasks}
                    className="px-4 py-2 bg-[#D71249] hover:bg-[#b80c3b] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-98 shrink-0"
                  >
                    <ListPlus className="w-4 h-4" />
                    <span>Duyệt & Tạo việc vào hệ thống</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã nhập toàn bộ công việc thành công!
                  </div>
                )}
              </div>

              {/* Task Items Preview */}
              <div className="space-y-3">
                {planResult.tasks.map((task, idx) => (
                  <div key={idx} className="p-3.5 bg-white rounded-xl border border-sky-100 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#005993] text-white text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-xs text-slate-900">{task.title}</h5>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-sm border ${
                        task.priority === 'URGENT' ? 'bg-rose-100 text-[#D71249] border-rose-300' : 'bg-sky-50 text-[#005993] border-sky-200'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 pl-7">{task.description}</p>

                    <div className="flex items-center gap-3 pl-7 text-[11px] text-slate-400">
                      <span>Phòng ban: <strong className="text-slate-700">{task.departmentName}</strong></span>
                      <span>•</span>
                      <span>Thời gian dự kiến: <strong className="text-slate-700">{task.daysToComplete} ngày</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: AI Risk Analysis */}
      {activeTab === 'risk' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Phân tích rủi ro tiến độ & Nút thắt vận hành
              </h3>
              <p className="text-xs text-slate-500">
                Mô hình AI quét toàn bộ nhiệm vụ thực tế của Chi nhánh để đưa ra cảnh báo sớm
              </p>
            </div>
            <button
              onClick={handleRunRiskAnalysis}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#005993] bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center gap-1.5 border border-sky-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Quét lại dữ liệu
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-8 h-8 text-[#005993] animate-spin" />
              <span>Đang tính toán rủi ro và tổng hợp số liệu...</span>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
              {riskAnalysisText}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Executive Report Generator */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Bản thảo Báo cáo Giao ban Điều hành
              </h3>
              <p className="text-xs text-slate-500">
                Tự động tổng hợp số liệu thực tế thành bản báo cáo trình Ban Giám Đốc Chi nhánh
              </p>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#005993] bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center gap-1.5 border border-sky-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Tạo lại báo cáo
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-8 h-8 text-[#005993] animate-spin" />
              <span>Đang soạn thảo văn bản báo cáo...</span>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap shadow-inner">
              {reportText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
