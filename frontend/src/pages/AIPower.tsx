import { useState, useEffect, useCallback } from "react";
import { Cpu, Database, Zap, Layers, Network, Thermometer, CircuitBoard, HardDrive, Grid3X3, BookOpen } from "lucide-react";

const TABS = [
  { key: "overview", label: "总览", icon: Grid3X3 },
  { key: "reports", label: "研报库", icon: BookOpen },
  { key: "compute-chip", label: "算力芯片", icon: Cpu },
  { key: "hbm", label: "HBM", icon: Database },
  { key: "optical-module", label: "光模块", icon: Zap },
  { key: "pcb", label: "PCB", icon: Layers },
  { key: "switch-chip", label: "交换芯片", icon: Network },
  { key: "liquid-cooling", label: "液冷散热", icon: Thermometer },
  { key: "nlcc", label: "NLCC", icon: CircuitBoard },
  { key: "glass-substrate", label: "玻璃基板", icon: HardDrive },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ── 接口 ──────────────────────────────────────────────────
interface SectorContent {
  positioning: string;
  valueShare: string;
  domestication: string;
  techBarrier: { level: number; desc: string };
  capacityBarrier: { level: number; desc: string };
  scores: { dim: string; level: number }[];
}

// ── 子页模板 ──────────────────────────────────────────────
function SubPageTemplate({ title, content }: { title: string; content: SectorContent }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">{title}</h2>

      {/* 定位 + 价值量 + 国产化 */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">📍 环节定位</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{content.positioning}</p>
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg bg-muted/30 px-3 py-2 text-center">
            <div className="text-xs text-muted-foreground">价值量占比</div>
            <div className="text-base font-bold" style={{ color: "#FF9900" }}>{content.valueShare}</div>
          </div>
          <div className="flex-1 rounded-lg bg-muted/30 px-3 py-2 text-center">
            <div className="text-xs text-muted-foreground">国产化率</div>
            <div className="text-base font-bold" style={{ color: "#FF9900" }}>{content.domestication}</div>
          </div>
        </div>
      </div>

      {/* 竞争格局（留空） */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">🌍 竞争格局</h3>
        <p className="text-sm text-muted-foreground">待补（产业级格局描述，个股层暂不展开）</p>
      </div>

      {/* 壁垒 */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">🛡 壁垒类型</h3>
        <div className="flex gap-4">
          <div className="flex-1 rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">科技壁垒</span>
              <span className="text-xs font-bold" style={{ color: "#FF9900" }}>{content.techBarrier.level}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: content.techBarrier.level + "%", backgroundColor: content.techBarrier.level >= 80 ? "#FF6B6B" : "#FF9900" }} />
            </div>
            <div className="text-xs text-muted-foreground mt-1.5">{content.techBarrier.desc}</div>
          </div>
          <div className="flex-1 rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">产能壁垒</span>
              <span className="text-xs font-bold" style={{ color: "#FF9900" }}>{content.capacityBarrier.level}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: content.capacityBarrier.level + "%", backgroundColor: content.capacityBarrier.level >= 80 ? "#FF6B6B" : "#FF9900" }} />
            </div>
            <div className="text-xs text-muted-foreground mt-1.5">{content.capacityBarrier.desc}</div>
          </div>
        </div>
      </div>

      {/* 评分 */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-4">📈 核心维度评分</h3>
        <div className="space-y-3">
          {content.scores.map((s) => (
            <div key={s.dim} className="flex items-center gap-4">
              <span className="text-xs w-24 shrink-0 text-muted-foreground">{s.dim}</span>
              <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: Math.max(0, Math.min(100, s.level)) + "%", backgroundColor: s.level >= 80 ? "#FF6B6B" : s.level >= 60 ? "#FF9900" : "#6BCB77" }} />
              </div>
              <span className="text-xs font-bold w-8 text-right tabular-nums" style={{ color: "#FF9900" }}>{s.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 核心标的（留空） */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">🎯 核心标的</h3>
        <p className="text-sm text-muted-foreground">待补（个股层暂不展开）</p>
      </div>
    </div>
  );
}

// ── 八个环节内容 ──────────────────────────────────────────
const COMPUTE_CHIP: SectorContent = {
  positioning: "算力芯片是AI数据中心的核心计算单元，GPU凭借并行计算优势占据AI训练市场90%+份额。单颗高端GPU（H200/B200）售价3-4万美元，一台8卡服务器芯片价值量超25万美元，是AI算力产业链价值量最高、技术壁垒最深的环节。英伟达CUDA生态护城河极深。",
  valueShare: "35%",
  domestication: "<10%",
  techBarrier: { level: 98, desc: "先进制程（4nm/3nm）、CoWoS先进封装、HBM集成、CUDA软件生态四重壁垒叠加，全球仅英伟达+AMD两家，华为昇腾是国内唯一全栈替代方案。" },
  capacityBarrier: { level: 95, desc: "CoWoS封装产能全球仅台积电可供应，2026年产能约40万片/年且英伟达独占70%，ABF载板/硅晶圆均受限。" },
  scores: [{ dim: "技术壁垒", level: 98 }, { dim: "价值量占比", level: 98 }, { dim: "国产化率", level: 10 }, { dim: "产业确定性", level: 98 }, { dim: "业绩弹性", level: 90 }],
};

const HBM_CONTENT: SectorContent = {
  positioning: "HBM（高带宽内存）通过3D堆叠DRAM die+硅中介层实现>1TB/s超高频宽，是AI芯片的数据高速公路。HBM3e单颗24GB，H200搭载6颗共144GB，HBM价值量占GPU模组成本约40-50%。HBM4预计2026年量产，容量和带宽再翻倍。",
  valueShare: "25%",
  domestication: "≈0%",
  techBarrier: { level: 98, desc: "TSV通孔（深宽比>10:1）、3D堆叠对准（<1μm）、散热管理、CoWoS集成。全球仅SK海力士/三星/美光掌握，均依赖台积电封装，中国为零。" },
  capacityBarrier: { level: 90, desc: "HBM晶圆消耗量是普通DRAM的3倍，良率仅50-60%。全球产能扩张受限于TSV设备（应材/泛林）和先进封装产能，中国完全被出口管制封锁。" },
  scores: [{ dim: "技术壁垒", level: 98 }, { dim: "价值量占比", level: 90 }, { dim: "国产化率", level: 0 }, { dim: "产业确定性", level: 95 }, { dim: "业绩弹性", level: 85 }],
};

const OPTICAL_MODULE: SectorContent = {
  positioning: "光模块实现数据中心内部和之间的光电信号转换，AI数据中心光模块用量是传统数据中心的5-8倍。800G/1.6T是当前主流，单台服务器配4-8个光模块。2026年全球AI光模块市场规模约120亿美元，中国厂商（中际旭创/新易盛）全球份额超50%，是国产化率最高的AI算力环节。",
  valueShare: "15%",
  domestication: ">50%",
  techBarrier: { level: 70, desc: "核心壁垒在光芯片（EML激光器/硅光调制器）和高速DSP电芯片（依赖Broadcom/Marvell）。光模块封装和测试壁垒相对较低，国产化集中在模组组装环节。" },
  capacityBarrier: { level: 45, desc: "光模块组装产能扩张周期短（3-6个月），国内厂商产能充裕。上游光芯片产能集中在Lumentum/博通/三菱，是国产化率提升的关键瓶颈。" },
  scores: [{ dim: "技术壁垒", level: 70 }, { dim: "价值量占比", level: 65 }, { dim: "国产化率", level: 55 }, { dim: "产业确定性", level: 90 }, { dim: "业绩弹性", level: 80 }],
};

const PCB_CONTENT: SectorContent = {
  positioning: "AI服务器PCB需满足高多层（>20层）、高速信号（>112Gbps）、低损耗三大要求，AI服务器PCB单价是普通服务器的5-10倍（约3000-5000美元/台）。沪电股份是国内AI服务器PCB龙头，直接供英伟达B200/H200用PCB。高端覆铜板（CCL）是PCB核心材料。",
  valueShare: "8%",
  domestication: "40-50%",
  techBarrier: { level: 65, desc: "高多层对位（>24层）、高速材料（M6/M7级覆铜板）、背钻工艺是主要壁垒。高端IC载板（ABF）技术壁垒更高，目前仍以日本Ibiden/Shinko为主。" },
  capacityBarrier: { level: 50, desc: "高端PCB产能扩张周期约12-18个月。国内沪电/深南已有大规模产能，但IC载板产能仍集中在日台韩，国产替代空间大。" },
  scores: [{ dim: "技术壁垒", level: 65 }, { dim: "价值量占比", level: 40 }, { dim: "国产化率", level: 48 }, { dim: "产业确定性", level: 80 }, { dim: "业绩弹性", level: 60 }],
};

const SWITCH_CHIP: SectorContent = {
  positioning: "交换芯片是AI数据中心网络核心，负责服务器间高速数据交换。超大规模集群（>10万卡）互联需要102.4Tbps级交换芯片。英伟达Spectrum-X平台将交换芯片与GPU深度耦合。博通全球市占率超70%。盛科通信是国内唯一商业化交换芯片公司。",
  valueShare: "5%",
  domestication: "<15%",
  techBarrier: { level: 88, desc: ">25.6Tbps SerDes设计（>112Gbps）、超低延迟（<500ns）、大规模流表管理、SDN可编程能力。芯片规模接近处理器级别，博通/英伟达双寡头。" },
  capacityBarrier: { level: 60, desc: "先进制程（5nm/7nm）依赖台积电，但交换芯片面积小良率高。国内盛科最高12.8Tbps，25.6Tbps+仍在研发，差距约2代。" },
  scores: [{ dim: "技术壁垒", level: 88 }, { dim: "价值量占比", level: 35 }, { dim: "国产化率", level: 12 }, { dim: "产业确定性", level: 85 }, { dim: "业绩弹性", level: 55 }],
};

const LIQUID_COOLING: SectorContent = {
  positioning: "液冷散热是AI数据中心应对GPU高功耗（单颗>1000W）的关键技术。冷板式液冷（间接）和浸没式液冷（直接）是两大路线。AI服务器单柜功率从5-10kW飙升至40-100kW，风冷已无法满足。液冷系统占数据中心建设成本10-15%，中国产业链最完整。",
  valueShare: "6%",
  domestication: ">70%",
  techBarrier: { level: 55, desc: "冷板微通道设计、氟化液/合成油配方、漏液检测是核心壁垒。浸没式液冷的IT设备材料兼容性是最大挑战，冷板式液冷技术已基本成熟。" },
  capacityBarrier: { level: 35, desc: "液冷系统属于精密制造+系统集成，产能扩张灵活。CDU和管路组件国内供应链成熟，英维克/高澜等厂商产能充裕。" },
  scores: [{ dim: "技术壁垒", level: 55 }, { dim: "价值量占比", level: 50 }, { dim: "国产化率", level: 75 }, { dim: "产业确定性", level: 85 }, { dim: "业绩弹性", level: 70 }],
};

const NLCC_CONTENT: SectorContent = {
  positioning: "NLCC（高端MLCC，片式多层陶瓷电容器）是电子电路的工业大米，AI服务器单台用量约2000-4000颗（普通500颗），需高频/高容/小型化（0201/01005封装）规格。日本村田全球市占率31%，在01005超小型和高端MLCC领域几乎垄断。AI服务器用高端MLCC价值量为普通品3-5倍。",
  valueShare: "3%",
  domestication: "25-30%",
  techBarrier: { level: 85, desc: "钛酸钡陶瓷粉料（纳米级粒径控制）、介质薄层化（<0.5μm）、镍内电极共烧工艺。村田在材料科学上有50年积累，01005高端品差距超10年。" },
  capacityBarrier: { level: 60, desc: "高端MLCC产线投资大（单条>5亿元），产能爬坡周期18-24个月。风华高科/三环集团加速扩产，产能规模接近村田的1/3。" },
  scores: [{ dim: "技术壁垒", level: 85 }, { dim: "价值量占比", level: 25 }, { dim: "国产化率", level: 28 }, { dim: "产业确定性", level: 75 }, { dim: "业绩弹性", level: 50 }],
};

const GLASS_SUBSTRATE: SectorContent = {
  positioning: "玻璃基板是下一代先进封装基板材料，用于替代传统有机ABF载板。具有超低热膨胀系数（接近硅）、优异平整度、高频低损耗（Df<0.001@10GHz），是Chiplet异构集成的关键材料。英特尔计划2026年率先量产玻璃基板，产业处于从0到1的爆发前夜。",
  valueShare: "3%",
  domestication: "≈0%",
  techBarrier: { level: 90, desc: "TGV（玻璃通孔，深宽比>10:1）、超薄玻璃（<100μm）加工、玻璃-金属界面结合力。全球仅英特尔有完整商用路线图，中国尚在实验室阶段。" },
  capacityBarrier: { level: 80, desc: "玻璃基板产线需全新建造，无法复用现有IC载板产线。设备和工艺均为专用定制，供应链几乎从零搭建。英特尔已投入超10亿美元。" },
  scores: [{ dim: "技术壁垒", level: 90 }, { dim: "价值量占比", level: 30 }, { dim: "国产化率", level: 0 }, { dim: "产业确定性", level: 70 }, { dim: "业绩弹性", level: 80 }],
};

// ── 总览数据 ──────────────────────────────────────────────
const ORANGE = "#FF9900";
const OVERVIEW_COMPONENTS = [
  { label: "算力芯片", pct: "35%" },
  { label: "HBM", pct: "25%" },
  { label: "光模块", pct: "15%" },
  { label: "PCB", pct: "8%" },
  { label: "交换芯片", pct: "5%" },
  { label: "液冷散热", pct: "6%" },
  { label: "NLCC", pct: "3%" },
  { label: "玻璃基板", pct: "3%" },
];

const SCORE_ROWS = [
  { label: "产业确定性", score: "95.0" },
  { label: "业绩弹性", score: "85.0" },
  { label: "估值位置", score: "75.0" },
  { label: "产业协同", score: "90.0" },
  { label: "国产替代进度", score: "40.0" },
  { label: "周期阶段", score: "——" },
];

const COST_ROWS = [
  { main: "算力芯片", mainPct: "35.0%", sub: "HBM", subPct: "25.0%" },
  { main: "光模块", mainPct: "15.0%", sub: "交换芯片", subPct: "5.0%" },
  { main: "PCB+基板", mainPct: "11.0%", sub: "液冷散热", subPct: "6.0%" },
];

const TIMELINE = [
  { time: "2024", event: "H200/HBMe量产", done: true },
  { time: "2025", event: "B200/1.6T光模块", done: true },
  { time: "2026", event: "HBM4/玻璃基板商用", done: false },
  { time: "2027+", event: "3nm芯片/102T交换", done: false },
];

// ── 研报库 ────────────────────────────────────────────────
const REPORT_KEYWORDS = "算力,GPU,HBM,光模块,PCB,交换芯片,液冷,MLCC,玻璃基板,NLCC,AI芯片";

const LINK_CATEGORIES: [string, string[]][] = [
  ["算力芯片", ["GPU", "算力芯片", "AI芯片", "昇腾", "寒武纪", "英伟达", "B200", "H200", "Rubin"]],
  ["HBM", ["HBM", "高带宽内存", "DRAM堆叠", "HBM4"]],
  ["光模块", ["光模块", "800G", "1.6T", "光引擎", "硅光"]],
  ["PCB", ["PCB", "印制电路板", "覆铜板", "CCL", "载板"]],
  ["交换芯片", ["交换芯片", "交换机", "以太网", "InfiniBand", "博通"]],
  ["液冷散热", ["液冷", "散热", "温控", "冷却"]],
  ["NLCC", ["MLCC", "NLCC", "电容", "被动元件"]],
  ["玻璃基板", ["玻璃基板", "TGV", "先进封装基板"]],
  ["通用", []],
];

function guessCategory(title: string): string {
  for (const [cat, keys] of LINK_CATEGORIES) {
    if (keys.length === 0) continue;
    for (const k of keys) if (title.includes(k)) return cat;
  }
  return "通用";
}

function ReportsTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ keywords: REPORT_KEYWORDS, pages: "5", beginTime: "", endTime: "" });
      const resp = await fetch(`/api/reports/industry?${params}`);
      const data = await resp.json();
      if (data.status === "ok") setReports(data.reports || []);
      else setError("获取研报失败");
    } catch { setError("网络错误"); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  return (
    <div className="space-y-4" style={{ maxWidth: 960, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#333" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 className="text-lg font-semibold">行业研报库</h2>
          <p className="text-sm text-muted-foreground mt-1">近三个月 · AI算力产业链 · 东财行业研报（qType=1）· 共 {reports.length} 篇</p>
        </div>
        <button onClick={fetchReports} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40">
          {loading ? "加载中…" : "刷新"}
        </button>
      </div>
      {loading && <div className="space-y-2">{[1,2,3,4,5].map((i) => (<div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />))}</div>}
      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">{error}</div>}
      {!loading && !error && reports.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground/50">暂无研报数据</div>}
      {!loading && reports.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E5E5E5", backgroundColor: "#fafafa" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#999", width: 90 }}>日期</th>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#999", width: 120 }}>机构</th>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#999" }}>标题</th>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#999", width: 100 }}>所属环节</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "10px 16px", fontSize: 12, color: "#999", whiteSpace: "nowrap" }}>{r.publishDate}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: "#555", whiteSpace: "nowrap" }}>{r.orgSName}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, lineHeight: 1.5 }}>
                    <a href={`https://data.eastmoney.com/report/zw_industry.jshtml?infocode=${r.infoCode}`} target="_blank" rel="noopener noreferrer" style={{ color: "#333", textDecoration: "none" }} className="hover:text-primary transition-colors">{r.title}</a>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, color: "#FF9900", backgroundColor: "#FFF9F0", border: "1px solid #FFE0B2", whiteSpace: "nowrap" }}>{guessCategory(r.title)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab 路由 ──────────────────────────────────────────────
function TabContent({ tab }: { tab: TabKey }) {
  switch (tab) {
    case "overview":
      return (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 0", fontFamily: "system-ui, sans-serif", color: "#333" }}>
          <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#fff", padding: 20, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: ORANGE }}>AI算力产业链全景</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ border: "1px solid #E5E5E5", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#666", backgroundColor: "#fafafa" }}>上游<br /><span style={{ fontSize: 11 }}>EDA工具 · 硅晶圆 · 封装材料</span></div>
              <span style={{ color: "#D9D9D9", fontSize: 18 }}>→</span>
              <div style={{ border: `2px solid ${ORANGE}`, borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: ORANGE, backgroundColor: "#FFF9F0" }}>八大核心环节</div>
              <span style={{ color: "#D9D9D9", fontSize: 18 }}>→</span>
              <div style={{ border: "1px solid #E5E5E5", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#666", backgroundColor: "#fafafa" }}>下游<br /><span style={{ fontSize: 11 }}>AI数据中心 · 云计算 · 大模型</span></div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {OVERVIEW_COMPONENTS.map((c, i) => (
              <div key={c.label} style={{ border: i === 0 ? `2px solid ${ORANGE}` : "1px solid #E5E5E5", borderRadius: 10, backgroundColor: i === 0 ? "#FFF9F0" : "#fff", padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚙</div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>{c.label}</div><div style={{ fontSize: 10, color: "#999" }}>价值量占比</div></div>
                <div style={{ fontSize: 16, fontWeight: 700, color: ORANGE }}>{c.pct}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#fff", padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 12 }}>📊 板块评分总览</div>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid #E5E5E5", color: "#999", fontSize: 11 }}><th style={{ textAlign: "left", padding: "6px 0", fontWeight: 500 }}>指标名称</th><th style={{ textAlign: "right", padding: "6px 0", fontWeight: 500 }}>评分</th></tr></thead>
                <tbody>
                  {SCORE_ROWS.map((r) => (<tr key={r.label} style={{ borderBottom: "1px solid #f0f0f0" }}><td style={{ padding: "8px 0", color: "#333" }}>{r.label}</td><td style={{ padding: "8px 0", textAlign: "right", color: r.score === "——" ? "#ccc" : "#666" }}>{r.score}</td></tr>))}
                  <tr><td style={{ padding: "10px 0", fontWeight: 700, color: ORANGE, fontSize: 14 }}>板块综合分</td><td style={{ padding: "10px 0", textAlign: "right", fontWeight: 700, color: ORANGE, fontSize: 18 }}>90.0</td></tr>
                </tbody>
              </table>
            </div>
            <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#fff", padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 12 }}>🎯 核心标的池</div>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid #E5E5E5", color: "#999", fontSize: 11 }}><th style={{ textAlign: "left", padding: "6px 0", fontWeight: 500 }}>核心标的</th><th style={{ textAlign: "right", padding: "6px 0", fontWeight: 500 }}>价格/市值</th></tr></thead>
                <tbody>{[1,2,3,4].map((i) => (<tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}><td style={{ padding: "8px 0", color: "#ccc" }}>核心标的 {i}</td><td style={{ padding: "8px 0", textAlign: "right", color: "#ccc" }}>待更新</td></tr>))}</tbody>
              </table>
              <div style={{ fontSize: 11, color: "#bbb", marginTop: 8 }}>个股层面暂不展开</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#fff", padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 12 }}>💰 算力服务器成本构成</div>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid #E5E5E5", color: "#999", fontSize: 11 }}><th style={{ textAlign: "left", padding: "6px 0", fontWeight: 500 }}>部件名称</th><th style={{ textAlign: "right", padding: "6px 0", fontWeight: 500 }}>占比</th></tr></thead>
                <tbody>
                  {COST_ROWS.map((r) => [
                    <tr key={r.main} style={{ borderBottom: "1px solid #f0f0f0" }}><td style={{ padding: "7px 0", color: "#333" }}>{r.main}</td><td style={{ padding: "7px 0", textAlign: "right", color: ORANGE, fontWeight: 600 }}>{r.mainPct}</td></tr>,
                    <tr key={r.main + "-sub"} style={{ borderBottom: "1px solid #f0f0f0" }}><td style={{ padding: "5px 0 7px 16px", color: "#999", fontSize: 12 }}>└ {r.sub}</td><td style={{ padding: "5px 0 7px", textAlign: "right", color: "#999", fontSize: 12 }}>{r.subPct}</td></tr>
                  ])}
                </tbody>
              </table>
            </div>
            <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#fff", padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 16 }}>⏱ 量产里程碑</div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", paddingTop: 20, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 28, left: "10%", right: "10%", height: 1, borderTop: "1px dashed #E5E5E5", pointerEvents: "none" }} />
                {TIMELINE.map((t) => (
                  <div key={t.time} style={{ textAlign: "center", flex: 1, position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>{t.time}</div>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: t.done ? ORANGE : "#E5E5E5", border: t.done ? `2px solid ${ORANGE}` : "2px solid #D9D9D9", margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 11, color: t.done ? ORANGE : "#999", fontWeight: t.done ? 600 : 400 }}>{t.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#FFF9F0", padding: "20px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 10 }}>📝 板块结论</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: ORANGE, lineHeight: 1.6 }}>
              &ldquo;AI算力未来3年CAGR超60%，国产替代从芯片→光模块→PCB→液冷全线推进&rdquo;
            </div>
          </div>
        </div>
      );
    case "compute-chip":   return <SubPageTemplate title="算力芯片" content={COMPUTE_CHIP} />;
    case "hbm":            return <SubPageTemplate title="HBM" content={HBM_CONTENT} />;
    case "optical-module": return <SubPageTemplate title="光模块" content={OPTICAL_MODULE} />;
    case "pcb":            return <SubPageTemplate title="PCB" content={PCB_CONTENT} />;
    case "switch-chip":    return <SubPageTemplate title="交换芯片" content={SWITCH_CHIP} />;
    case "liquid-cooling": return <SubPageTemplate title="液冷散热" content={LIQUID_COOLING} />;
    case "nlcc":           return <SubPageTemplate title="NLCC" content={NLCC_CONTENT} />;
    case "glass-substrate": return <SubPageTemplate title="玻璃基板" content={GLASS_SUBSTRATE} />;
    case "reports":        return <ReportsTab />;
    default:               return <p className="text-muted-foreground">未知板块</p>;
  }
}

export function AIPower() {
  const [active, setActive] = useState<TabKey>("overview");
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI算力</h1>
        <p className="text-sm text-muted-foreground mt-1">产业链分板块跟踪</p>
      </div>
      <div className="flex flex-wrap gap-1.5 border-b pb-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActive(key)} className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-[1px] ${active === key ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
      <TabContent tab={active} />
    </div>
  );
}
