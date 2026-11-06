import { GoogleGenAI } from '@google/genai';
import { Task, KPIStats } from '../types';
import contentData from '../data/contentData.json';

export interface GeneratedPlanItem {
  title: string;
  description: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  daysToComplete: number;
  departmentId: string;
  departmentName: string;
  labels: string[];
}

export interface GeneratedPlan {
  campaignName: string;
  objective: string;
  tasks: GeneratedPlanItem[];
}

class AIService {
  private aiEnabled = true;

  public isAIEnabled(): boolean {
    const saved = localStorage.getItem('vtb_ai_enabled');
    return saved !== null ? saved === 'true' : true;
  }

  public setAIEnabled(enabled: boolean): void {
    this.aiEnabled = enabled;
    localStorage.setItem('vtb_ai_enabled', String(enabled));
  }

  public async generatePlan(promptText: string): Promise<GeneratedPlan> {
    const apiKey = typeof process !== 'undefined' && process.env?.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : '';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `${contentData.aiPrompts.systemRole}
Nhiệm vụ: Bạn hãy phân rã mục tiêu công việc ngân hàng sau đây thành một kế hoạch chi tiết gồm 4-5 nhiệm vụ cụ thể cho các phòng ban tại VietinBank Kiên Giang.
Trả về định dạng JSON thuần túy (không markdown bao quanh) với cấu trúc:
{
  "campaignName": "Tên kế hoạch ngắn gọn",
  "objective": "Mục tiêu tóm tắt",
  "tasks": [
    {
      "title": "Tiêu đề công việc",
      "description": "Chi tiết công việc và yêu cầu nghiệm thu",
      "priority": "URGENT" | "HIGH" | "MEDIUM" | "LOW",
      "daysToComplete": 3,
      "departmentId": "KHDN" | "KHBL" | "QLRR" | "KTDV" | "TH",
      "departmentName": "Tên phòng ban",
      "labels": ["nhãn 1", "nhãn 2"]
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nMục tiêu công việc: "${promptText}"`,
        });

        const text = response.text || '';
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return parsed;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to smart banking template planner:', err);
      }
    }

    // High quality intelligent banking fallback planner based on prompt keywords
    return this.fallbackPlanGenerator(promptText);
  }

  public async analyzeRisks(tasks: Task[], kpis: KPIStats): Promise<string> {
    const apiKey = typeof process !== 'undefined' && process.env?.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : '';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const taskSummary = tasks.slice(0, 10).map((t) => ({
          code: t.code,
          title: t.title,
          dept: t.departmentName,
          status: t.status,
          priority: t.priority,
          progress: t.progress,
          due: t.dueDate,
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${contentData.aiPrompts.systemRole}
Phân tích tình hình tiến độ và cảnh báo rủi ro thực thi cho Ban Giám Đốc VietinBank Kiên Giang.
Số liệu hiện tại:
- Tổng công việc: ${kpis.total}
- Đang thực hiện: ${kpis.inProgress}
- Quá hạn: ${kpis.overdue}
- Sắp đến hạn: ${kpis.dueSoon}
- Tỷ lệ hoàn thành: ${kpis.completionRate}%
- Tỷ lệ đúng hạn: ${kpis.onTimeRate}%

Danh sách công việc tiêu biểu:
${JSON.stringify(taskSummary, null, 2)}

Hãy đưa ra nhận định ngắn gọn (3-4 điểm chính) gồm:
1. Đánh giá tổng quan tiến độ
2. Cảnh báo các đầu việc có rủi ro trễ hạn
3. Kiến nghị biện pháp chỉ đạo điều hành cho Ban Giám đốc.`,
        });

        return response.text || '';
      } catch (e) {
        console.warn('AI analysis fallback:', e);
      }
    }

    return this.fallbackRiskAnalysis(tasks, kpis);
  }

  public async draftExecutiveReport(tasks: Task[], kpis: KPIStats, periodName = 'Tuần 1 Tháng 11/2026'): Promise<string> {
    const overdueTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');

    return `BÁO CÁO TỔNG HỢP ĐIỀU HÀNH CÔNG VIỆC
VIETINBANK CHI NHÁNH KIÊN GIANG
Kỳ báo cáo: ${periodName}
Thời điểm trích xuất: ${new Date().toLocaleDateString('vi-VN')}

I. TỔNG QUAN HIỆU SUẤT VẬN HÀNH
- Tổng số nhiệm vụ phân công trong kỳ: ${kpis.total} nhiệm vụ.
- Tỷ lệ hoàn thành công việc: ${kpis.completionRate}% (Đạt ${kpis.completed}/${kpis.total} nhiệm vụ).
- Tỷ lệ hoàn thành đúng hạn: ${kpis.onTimeRate}%.
- Công việc đang triển khai: ${kpis.inProgress} nhiệm vụ.
- Công việc quá hạn cần xử lý ngay: ${kpis.overdue} nhiệm vụ.
- Nhiệm vụ khẩn cấp trong tầm kiểm soát: ${kpis.urgent} nhiệm vụ.

II. TIẾN ĐỘ THEO CÁC PHÒNG BAN TRỌNG ĐIỂM
1. Phòng Khách hàng Doanh nghiệp: Tập trung hoàn tất thẩm định gói tín dụng thủy sản và tiếp cận doanh nghiệp KCN Thạnh Lộc.
2. Phòng Khách hàng Bán lẻ: Tích cực đẩy mạnh triển khai thiết bị POS và thẻ quốc tế tại TP. Phú Quốc.
3. Phòng Quản lý Rủi ro: Đã hoàn thành 100% đợt kiểm tra an toàn kho quỹ đột xuất, đảm bảo an toàn tuyệt đối.
4. Phòng Kế toán & DVKH: Đảm bảo vận hành giao dịch thông suốt, hoàn thành đối soát quyết toán lãi đúng hạn.

III. KIẾN NGHỊ CHỈ ĐẠO CỦA BAN GIÁM ĐỐC
1. Yêu cầu Phòng TH & CNTT phối hợp cùng các đơn vị giải quyết dứt điểm các đầu việc kỹ thuật đang trễ hạn.
2. Các Trưởng phòng chủ động rà soát checklist công việc hàng ngày, đôn đốc cán bộ cập nhật tiến độ trước 17h00.
3. Tăng cường phối hợp liên phòng ban nhằm bảo đảm an toàn thanh khoản và hoàn thành chỉ tiêu kinh doanh Quý IV/2026.`;
  }

  private fallbackPlanGenerator(promptText: string): GeneratedPlan {
    const p = promptText.toLowerCase();

    if (p.includes('tín dụng') || p.includes('cho vay') || p.includes('doanh nghiệp')) {
      return {
        campaignName: 'Kế hoạch Đẩy mạnh Tín dụng Doanh nghiệp VietinBank Kiên Giang',
        objective: 'Thúc đẩy tăng trưởng dư nợ an toàn, bền vững cho nhóm KHDN chủ lực',
        tasks: [
          {
            title: 'Khảo sát nhu cầu vốn lưu động các doanh nghiệp chế biến thủy sản tại Rạch Giá & Châu Thành',
            description: 'Tiếp cận tối thiểu 15 doanh nghiệp xuất khẩu cá tra, tôm đông lạnh để nắm bắt nhu cầu tài trợ đơn hàng Quý IV.',
            priority: 'HIGH',
            daysToComplete: 5,
            departmentId: 'KHDN',
            departmentName: 'Phòng Khách hàng Doanh nghiệp',
            labels: ['Tín dụng', 'KHDN', 'Thủy sản'],
          },
          {
            title: 'Rà soát hạn mức tín dụng và phương án tài sản bảo đảm quý cuối năm',
            description: 'Đánh giá lại giá trị kho hàng, quyền sử dụng đất và phương tiện vận tải bảo đảm nợ vay.',
            priority: 'URGENT',
            daysToComplete: 4,
            departmentId: 'QLRR',
            departmentName: 'Phòng Quản lý Rủi ro',
            labels: ['Thẩm định', 'Tài sản bảo đảm'],
          },
          {
            title: 'Xây dựng gói ưu đãi lãi suất cạnh tranh cho chuỗi cung ứng thủy hải sản Kiên Giang',
            description: 'Phối hợp Phòng Tổng hợp tính toán biên lãi ròng (NIM) và trình Ban Giám đốc phê duyệt cơ chế giảm lãi suất 0.5%.',
            priority: 'MEDIUM',
            daysToComplete: 3,
            departmentId: 'TH',
            departmentName: 'Phòng Tổng hợp & CNTT',
            labels: ['Lãi suất', 'Sản phẩm'],
          },
          {
            title: 'Ký kết hợp đồng tín dụng và giải ngân các hồ sơ đủ điều kiện pháp lý',
            description: 'Kiểm soát chứng từ giải ngân, giám sát dòng tiền qua tài khoản thanh toán tại VietinBank Kiên Giang.',
            priority: 'HIGH',
            daysToComplete: 7,
            departmentId: 'KTDV',
            departmentName: 'Phòng Kế toán & Dịch vụ Khách hàng',
            labels: ['Giải ngân', 'Kế toán'],
          },
        ],
      };
    }

    if (p.includes('huy động') || p.includes('tiền gửi') || p.includes('bán lẻ') || p.includes('phú quốc')) {
      return {
        campaignName: 'Chiến dịch Gia tăng Tiền gửi Dân cư & Dịch vụ Số Bán lẻ',
        objective: 'Thu hút nguồn vốn nhàn rỗi và mở rộng thị phần dịch vụ thanh toán tại Kiên Giang & Phú Quốc',
        tasks: [
          {
            title: 'Phát động chương trình tiết kiệm dự thưởng "Gửi tiền VietinBank - Đón lộc vàng"',
            description: 'Triển khai ấn phẩm truyền thông tại tất cả các điểm giao dịch, quầy dịch vụ và fanpage Chi nhánh.',
            priority: 'HIGH',
            daysToComplete: 3,
            departmentId: 'KHBL',
            departmentName: 'Phòng Khách hàng Bán lẻ',
            labels: ['Huy động vốn', 'Truyền thông'],
          },
          {
            title: 'Mở rộng liên kết với các chủ khách sạn, resort Phú Quốc mở tài khoản số đẹp VietinBank',
            description: 'Tư vấn mở tài khoản thanh toán Alias theo tên thương hiệu cho 50 đối tác du lịch nghỉ dưỡng.',
            priority: 'HIGH',
            daysToComplete: 6,
            departmentId: 'KHBL',
            departmentName: 'Phòng Khách hàng Bán lẻ',
            labels: ['Phú Quốc', 'Khách hàng VIP'],
          },
          {
            title: 'Kiểm tra chất lượng dịch vụ quầy và thời gian chờ giao dịch của khách hàng',
            description: 'Đo lường chỉ số hài lòng khách hàng (CSAT) tại trụ sở Rạch Giá và các PGD vệ tinh.',
            priority: 'MEDIUM',
            daysToComplete: 4,
            departmentId: 'KTDV',
            departmentName: 'Phòng Kế toán & Dịch vụ Khách hàng',
            labels: ['Dịch vụ khách hàng', 'Chất lượng quầy'],
          },
        ],
      };
    }

    // General banking plan
    return {
      campaignName: `Kế hoạch Công tác: ${promptText}`,
      objective: 'Tổ chức phân công nhiệm vụ đồng bộ, bảo đảm chất lượng và đúng quy trình VietinBank',
      tasks: [
        {
          title: `Xây dựng khung đề án và phân công đầu mối triển khai: ${promptText}`,
          description: 'Soạn thảo văn bản phân công nhiệm vụ cụ thể cho từng cá nhân, xác định thời hạn và tiêu chí nghiệm thu.',
          priority: 'HIGH',
          daysToComplete: 3,
          departmentId: 'TCHCH',
          departmentName: 'Phòng Tổ chức Cán bộ & Hành chính',
          labels: ['Kế hoạch', 'Điều hành'],
        },
        {
          title: 'Thu thập số liệu thực tế và rà soát tính khả thi theo quy định nội bộ',
          description: 'Đối chiếu với các quy chế, hướng dẫn nghiệp vụ hiện hành của VietinBank và NHNN.',
          priority: 'MEDIUM',
          daysToComplete: 5,
          departmentId: 'QLRR',
          departmentName: 'Phòng Quản lý Rủi ro',
          labels: ['Tuân thủ', 'Rà soát'],
        },
        {
          title: 'Tổ chức họp giao ban đánh giá tiến độ giai đoạn 1',
          description: 'Báo cáo trực tiếp Ban Giám đốc Chi nhánh, tháo gỡ vướng mắc phát sinh trong thực tế.',
          priority: 'MEDIUM',
          daysToComplete: 7,
          departmentId: 'BGD',
          departmentName: 'Ban Giám Đốc',
          labels: ['Giao ban', 'Báo cáo'],
        },
      ],
    };
  }

  private fallbackRiskAnalysis(tasks: Task[], kpis: KPIStats): string {
    const overdueList = tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    return `ĐÁNH GIÁ TIẾN ĐỘ & RỦI RO ĐIỀU HÀNH:
1. Đánh giá chung: Tiến độ đạt ${kpis.completionRate}%, tỷ lệ đúng hạn ${kpis.onTimeRate}%. Hoạt động vận hành duy trì ổn định.
2. Cảnh báo quá hạn: Có ${kpis.overdue} nhiệm vụ đã quá hạn và ${kpis.dueSoon} nhiệm vụ sắp đến hạn trong vòng 3 ngày tới. Cần lưu ý đặc biệt đối với các công việc liên quan đến hạ tầng kỹ thuật và báo cáo pháp lý NHNN.
3. Khuyến nghị điều phối:
- Đề nghị Trưởng phòng KHDN và KHBL đốc thúc hoàn tất hồ sơ thẩm định tín dụng trước ngày thứ Sáu.
- Phê duyệt kịp thời các tờ trình đang ở trạng thái 'Chờ phản hồi' để tránh đình trệ quy trình.
- Duy trì nguyên tắc kiểm soát 3 phòng tuyến, tuyệt đối không vì áp lực tiến độ mà cắt giảm bước thẩm định an toàn.`;
  }
}

export const aiService = new AIService();
