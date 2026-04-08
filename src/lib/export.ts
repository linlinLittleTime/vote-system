import { format } from "date-fns";
import type { ActivityOption } from "@/types/api";

// 活动数据接口
interface ActivityExportData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  ruleType: string;
  maxVotes?: number | null;
  createdAt: Date;
  options: ActivityOption[];
}

// 投票记录接口
interface VoteExportData {
  id: string;
  activityId: string;
  optionId: string;
  voterId: string;
  createdAt: Date;
}

// 生成活动CSV
export function generateActivityCSV(activities: ActivityExportData[]): string {
  const headers = ["活动ID", "标题", "描述", "状态", "投票规则", "创建时间"];
  const rows = activities.map((a) => [
    a.id,
    a.title,
    a.description || "",
    a.status,
    a.ruleType === "single" ? "单选" : `多选(最多${a.maxVotes || 0}项)`,
    format(new Date(a.createdAt), "yyyy-MM-dd HH:mm:ss"),
  ]);

  return [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
}

// 生成投票记录CSV
export function generateVoteCSV(votes: VoteExportData[], options: ActivityOption[]): string {
  const headers = ["投票ID", "选项", "投票者ID", "投票时间"];
  const rows = votes.map((v) => {
    const option = options.find((o) => o.id === v.optionId);
    return [
      v.id,
      option?.text || v.optionId,
      v.voterId,
      format(new Date(v.createdAt), "yyyy-MM-dd HH:mm:ss"),
    ];
  });

  return [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
}

// 生成Excel Buffer (使用xlsx库)
export async function generateActivityExcel(
  activities: ActivityExportData[],
  votesMap: Map<string, VoteExportData[]>
): Promise<Buffer> {
  const XLSX = await import("xlsx");

  const workbook = XLSX.utils.book_new();

  // 活动列表sheet
  const activityData = activities.map((a) => ({
    "活动ID": a.id,
    "标题": a.title,
    "描述": a.description || "",
    "状态": a.status,
    "投票规则": a.ruleType === "single" ? "单选" : `多选(最多${a.maxVotes || 0}项)`,
    "创建时间": format(new Date(a.createdAt), "yyyy-MM-dd HH:mm:ss"),
  }));

  const activitySheet = XLSX.utils.json_to_sheet(activityData);
  XLSX.utils.book_append_sheet(workbook, activitySheet, "活动列表");

  // 每个活动一个投票记录sheet
  activities.forEach((activity, index) => {
    const votes = votesMap.get(activity.id) || [];
    const voteData = votes.map((v) => {
      const option = activity.options.find((o) => o.id === v.optionId);
      return {
        "投票ID": v.id,
        "选项": option?.text || v.optionId,
        "投票者ID": v.voterId,
        "投票时间": format(new Date(v.createdAt), "yyyy-MM-dd HH:mm:ss"),
      };
    });

    if (voteData.length > 0) {
      const voteSheet = XLSX.utils.json_to_sheet(voteData);
      // sheet名称最长31字符
      const sheetName = `投票记录${index + 1}`.slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, voteSheet, sheetName);
    }
  });

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}