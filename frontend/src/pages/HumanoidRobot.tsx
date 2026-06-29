import { useState, useEffect, useCallback } from "react";
import { Cpu, Cog, Gauge, CircleDot, HandMetal, Wrench, Grid3X3, BookOpen } from "lucide-react";

const TABS = [
  { key: "overview", label: "总览", icon: Grid3X3 },
  { key: "reports", label: "研报库", icon: BookOpen },
  { key: "harmonic", label: "谐波减速器", icon: Cog },
  { key: "roller-screw", label: "行星滚柱丝杠", icon: Gauge },
  { key: "frameless-motor", label: "无框力矩电机", icon: Cpu },
  { key: "force-sensor", label: "六维力传感器", icon: CircleDot },
  { key: "dexterous-hand", label: "灵巧手", icon: HandMetal },
  { key: "ball-screw", label: "滚珠丝杠", icon: Wrench },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ── 子页统一样板 ──────────────────────────────────────────
// ── 子页统一样板（接受内容 props）────────────────────────────
interface SectorContent {
  positioning: string;
  intlLandscape: string;
  cnLandscape: string;
  techBarrier: { level: number; desc: string };
  capacityBarrier: { level: number; desc: string };
  scores: { dim: string; level: number }[];
}

function SubPageTemplate({ title, content }: { title: string; content: SectorContent }) {
  const barrierBar = (level: number) => {
    const pct = Math.max(0, Math.min(100, level));
    const color = pct >= 80 ? "#FF6B6B" : pct >= 60 ? "#FF9900" : pct >= 40 ? "#FFD93D" : "#6BCB77";
    return (
      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">{title}</h2>

      {/* 环节定位 */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">📍 环节定位</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{content.positioning}</p>
      </div>

      {/* 竞争格局 双列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold mb-2">🌍 国际竞争格局</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.intlLandscape}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold mb-2">🇨🇳 国内竞争格局</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.cnLandscape}</p>
        </div>
      </div>

      {/* 壁垒类型 */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">🛡 壁垒类型</h3>
        <div className="flex gap-4">
          <div className="flex-1 rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">科技壁垒</span>
              <span className="text-xs text-muted-foreground">{content.techBarrier.level}%</span>
            </div>
            {barrierBar(content.techBarrier.level)}
            <div className="text-xs text-muted-foreground mt-1.5">{content.techBarrier.desc}</div>
          </div>
          <div className="flex-1 rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">产能壁垒</span>
              <span className="text-xs text-muted-foreground">{content.capacityBarrier.level}%</span>
            </div>
            {barrierBar(content.capacityBarrier.level)}
            <div className="text-xs text-muted-foreground mt-1.5">{content.capacityBarrier.desc}</div>
          </div>
        </div>
      </div>

      {/* 评分维度 */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-4">📈 评分维度</h3>
        <div className="space-y-3">
          {content.scores.map((s) => (
            <div key={s.dim} className="flex items-center gap-4">
              <span className="text-xs w-28 shrink-0 text-muted-foreground">{s.dim}</span>
              <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, s.level))}%`, backgroundColor: s.level >= 80 ? "#FF6B6B" : s.level >= 60 ? "#FF9900" : "#6BCB77" }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{s.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 核心标的表格（留空） */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">🎯 核心标的</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-semibold text-muted-foreground">
                <th className="py-2 pr-4">公司</th>
                <th className="py-2 pr-4">不可替代性</th>
                <th className="py-2 pr-4">评分</th>
                <th className="py-2">备注</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2.5 pr-4 text-muted-foreground/40">待补</td>
                  <td className="py-2.5 pr-4 text-muted-foreground/40">待补</td>
                  <td className="py-2.5 pr-4 text-muted-foreground/40">待补</td>
                  <td className="py-2.5 text-muted-foreground/40">待补</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 六大环节内容数据（基于研报+产业链研究） ──────────────────
const HARMONIC: SectorContent = {
  positioning: "谐波减速器是机器人旋转关节的核心精密传动部件，利用柔轮弹性变形实现高减速比传动。具有零背隙、高精度、高扭矩密度三大特性，是人形机器人单机用量最大（约14-16台/台）的价值量环节。一台人形机器人谐波减速器成本占比约35%。",
  intlLandscape: "全球市场由日本哈默纳科（Harmonic Drive）一家独大，全球份额超60%，产品精度寿命行业标杆，但售价高、交期长达6个月。日本电产（Nidec）旗下Shimpo也占有一定份额。欧美市场几乎被哈默纳科覆盖，特斯拉Optimus当前仍采用哈默纳科方案。",
  cnLandscape: "绿的谐波（688017）是国内唯一实现谐波减速器规模化量产的企业，产品覆盖14/17/20/25四大规格，已进入ABB、发那科、库卡供应链。来福谐波、中技克美处于追赶阶段。2026年绿的谐波产能突破80万台/年，正加速进入特斯拉Optimus供应链验证。整体国产化率从2023年的不足15%提升至2026年的约30%。",
  techBarrier: { level: 90, desc: "柔轮材料（特种合金钢）、齿形设计（双圆弧齿廓）、热处理工艺构成三重壁垒。哈默纳科积累50年工艺know-how难以逆向。" },
  capacityBarrier: { level: 70, desc: "高精度磨齿机产能受限（日本Kapp、瑞士Reishauer交期18个月+），国产磨床精度尚不足以加工谐波齿形。" },
  scores: [
    { dim: "技术壁垒", level: 90 },
    { dim: "国产替代进度", level: 35 },
    { dim: "单机价值量", level: 95 },
    { dim: "竞争格局", level: 85 },
    { dim: "业绩弹性", level: 75 },
  ],
};

const ROLLER_SCREW: SectorContent = {
  positioning: "行星滚柱丝杠将旋转运动转化为直线运动，是人形机器人线性关节（膝关节、肘关节、踝关节）的核心执行元件。相比滚珠丝杠，承载能力高3-5倍、寿命长10倍以上。Optimus Gen3确认采用行星滚柱丝杠方案替代部分旋转关节，单台用量约8-12根。",
  intlLandscape: "全球仅瑞士GSA（Rollvis）、日本THK、瑞典SKF三家掌握行星滚柱丝杠核心技术。GSA是行业鼻祖，产品精度等级G1-G3，单根售价约3000-5000欧元。THK和SKF主要供工业机床，人形机器人专用规格尚未批量。整体而言，海外巨头产能有限且不以人形机器人为战略方向。",
  cnLandscape: "中国行星滚柱丝杠产业几乎从零起步。恒立液压（601100）借助液压件精密加工基础切入，已建成试产线。鼎智科技（688255）依托微型传动技术储备布局小规格丝杠。贝斯特（300580）、秦川机床（000837）分别在精密磨削和设备端布局。目前国产产品尚处于样机验证阶段，距离特斯拉送样有1-2年差距。",
  techBarrier: { level: 95, desc: "螺纹滚道磨削精度（微米级）、行星滚柱同步啮合设计、材料疲劳寿命（>10000小时）是三大技术难题，全球仅3家企业完全掌握。" },
  capacityBarrier: { level: 85, desc: "高精度螺纹磨床全球仅瑞士Reishauer、德国Klingelnberg可供应，单台价格超2000万元，交期24个月+，构成严重产能瓶颈。" },
  scores: [
    { dim: "技术壁垒", level: 95 },
    { dim: "国产替代进度", level: 15 },
    { dim: "单机价值量", level: 85 },
    { dim: "竞争格局", level: 95 },
    { dim: "业绩弹性", level: 90 },
  ],
};

const FRAMELESS_MOTOR: SectorContent = {
  positioning: "无框力矩电机是机器人旋转关节的动力源，由定子铁芯、绕组和永磁转子组成，无外壳/轴承/编码器，直接集成到关节结构中。省去外壳后扭矩密度提升30-50%，结构紧凑，是Optimus旋转关节的核心驱动元件，单台用量约28-40个。",
  intlLandscape: "全球无框力矩电机市场由美国科尔摩根（Kollmorgen）、Parker Hannifin、Aerotech主导，产品转矩密度和动态响应行业领先。日本安川、三菱在工业伺服电机领域积累深厚，正积极切入人形机器人赛道。特斯拉部分关节电机仍采用科尔摩根定制方案。",
  cnLandscape: "鸣志电器（603728）是国内步进电机龙头，已推出机器人专用无框力矩电机系列，转矩密度接近科尔摩根同类产品的80%。步科股份（688160）低压伺服电机技术领先，正扩建机器人电机产线。伟创电气、禾川科技在伺服系统有布局但尚未推出机器人专用规格。整体与海外差距约2-3年。",
  techBarrier: { level: 75, desc: "高转矩密度设计（Nm/kg）、低齿槽转矩、高效散热是核心难点。国内电机本体设计已接近，差距主要在精密绕线和磁钢一致性。" },
  capacityBarrier: { level: 50, desc: "绕线设备和磁钢供应相对成熟，产能扩张周期约6-12个月。鸣志电器现有产能可支撑约5万台人形机器人需求。" },
  scores: [
    { dim: "技术壁垒", level: 75 },
    { dim: "国产替代进度", level: 55 },
    { dim: "单机价值量", level: 80 },
    { dim: "竞争格局", level: 55 },
    { dim: "业绩弹性", level: 70 },
  ],
};

const FORCE_SENSOR: SectorContent = {
  positioning: "六维力/力矩传感器同时测量三个力分量（Fx/Fy/Fz）和三个力矩分量（Mx/My/Mz），是机器人实现力控操作（柔顺装配、精密打磨、力反馈抓取）的核心感知器件。单台人形机器人通常配置2-4个（手腕、脚踝），单颗售价5-20万元，是边际利润最高的关节部件。",
  intlLandscape: "全球六维力传感器市场由美国ATI Industrial Automation、德国ME-Systeme、日本Nitta三家主导。ATI市占率约40%，产品精度和可靠性行业标杆，供特斯拉Optimus和波士顿动力。Cyberdyne、Wacoh-Tech在小型化传感器上有技术优势。海外产品单价高（>10万元/颗）且交期长。",
  cnLandscape: "柯力传感（603662）是国内力传感器龙头，已推出六维力传感器样机并送样测试。东华测试（300354）在力学测量仪器领域有积累，开发了机器人专用六维力传感器。安培龙（301413）、昊志机电（300503）亦有布局但尚未批量供货。国产六维力传感器单价约3-8万元，交叉串扰精度约为海外产品的60-70%。",
  techBarrier: { level: 85, desc: "多维解耦算法（交叉串扰<1%）、应变片贴片工艺、温度补偿是核心壁垒。ATI通过ASIC芯片实现片上解耦，国内尚在FPGA阶段。" },
  capacityBarrier: { level: 35, desc: "应变片和弹性体加工设备相对成熟，资本投入不大。主要瓶颈在标定设备（六维力标定台）和工艺经验积累。" },
  scores: [
    { dim: "技术壁垒", level: 85 },
    { dim: "国产替代进度", level: 40 },
    { dim: "单机价值量", level: 70 },
    { dim: "竞争格局", level: 75 },
    { dim: "业绩弹性", level: 65 },
  ],
};

const DEXTEROUS_HAND: SectorContent = {
  positioning: "灵巧手是人形机器人的末端执行器，从工业夹爪向仿人多指灵巧手演进是确定趋势。Optimus Gen3采用五指灵巧手方案，单只手指自由度11个，集成微型电机、腱绳/齿轮传动、触觉传感器三大子系统。灵巧手占整机成本约10%，是决定机器人操作能力上限的环节。",
  intlLandscape: "全球灵巧手技术领先方包括Shadow Robot（英国）、Schunk（德国）、Robotiq（加拿大）。Shadow Hand是行业标杆（24个自由度、129个传感器），但售价超100万美元，不适用于量产。特斯拉Optimus自研灵巧手方案采用空心杯电机+腱绳传动+指尖触觉传感器。",
  cnLandscape: "汇川技术（300124）伺服系统龙头，正布局机器人关节模组包括灵巧手驱动。拓斯达（300607）工业机器人经验丰富，开发了多指灵巧手原型。兆威机电（003021）微型传动系统全球领先，是灵巧手微型齿轮箱的核心供应商。伟创电气（688698）提供空心杯电机方案。国内整体处于实验室/样机阶段。",
  techBarrier: { level: 88, desc: "微型电机（直径<8mm）、腱绳材料（UHMWPE纤维）、触觉传感器阵列、多指协同控制算法四大技术难点。集成难度高、子系统多。" },
  capacityBarrier: { level: 45, desc: "微型电机和传感器产线可复用现有电子制造产能，规模化后产能壁垒较低。主要瓶颈在精密装配工艺。" },
  scores: [
    { dim: "技术壁垒", level: 88 },
    { dim: "国产替代进度", level: 30 },
    { dim: "单机价值量", level: 65 },
    { dim: "竞争格局", level: 70 },
    { dim: "业绩弹性", level: 75 },
  ],
};

const BALL_SCREW: SectorContent = {
  positioning: "滚珠丝杠是成熟的直线传动部件，通过滚珠在螺纹滚道中滚动实现旋转→直线运动转换。精度和承载能力低于行星滚柱丝杠，但成本仅为后者的1/5-1/3。在人形机器人中适用于负载较小的关节（如腕部、颈部），也是工业机器人、机床的通用部件，国产化率较高。",
  intlLandscape: "全球滚珠丝杠市场由日本NSK、THK和德国Bosch Rexroth三强主导，合计份额超55%。NSK和THK在精密级（C3-C5）滚珠丝杠领域积累超过60年，产品稳定性和寿命全球领先。但日德企业近年产能扩张保守，交期普遍延长至4-6个月。",
  cnLandscape: "中国滚珠丝杠产业相对成熟，国内厂商如南京工艺、汉江机床已在C3-C5精密级产品形成规模供货。上市公司中长盛轴承（300718）在丝杠配套轴承领域有竞争力，思进智能（003025）具备精密冷成形装备能力。整体国产化率约50-60%，中低端市场基本国产主导，高端C1-C3级仍依赖进口。",
  techBarrier: { level: 55, desc: "精密级（C3以上）螺纹磨削和滚珠选配是主要壁垒。C1-C3级精密滚珠丝杠仍高度依赖进口，但技术差距在收窄。" },
  capacityBarrier: { level: 30, desc: "国产螺纹磨床已有秦川机床、上海机床等供应商，产能扩张周期较短。中低端产品几乎无产能瓶颈。" },
  scores: [
    { dim: "技术壁垒", level: 55 },
    { dim: "国产替代进度", level: 55 },
    { dim: "单机价值量", level: 35 },
    { dim: "竞争格局", level: 30 },
    { dim: "业绩弹性", level: 40 },
  ],
};

// ── 总览页专用样式常量 ────────────────────────────────────
const ORANGE = "#FF9900";

const OVERVIEW_COMPONENTS = [
  { label: "谐波减速器", pct: "35%", sub: "价值量占比" },
  { label: "行星滚柱丝杠", pct: "25%", sub: "价值量占比" },
  { label: "无框力矩电机", pct: "20%", sub: "价值量占比" },
  { label: "六维力传感器", pct: "15%", sub: "价值量占比" },
  { label: "灵巧手", pct: "10%", sub: "价值量占比" },
  { label: "滚珠丝杠", pct: "8%", sub: "价值量占比" },
];

const SCORE_ROWS = [
  { label: "产业确定性", score: "90.0" },
  { label: "镇基弹性", score: "80.0" },
  { label: "估值位置", score: "85.0" },
  { label: "产业协同", score: "88.0" },
  { label: "量化推理进度", score: "85.0" },
  { label: "周期阶段", score: "——" },
];

const COST_ROWS = [
  { main: "谐波减速器", mainPct: "35.0%", sub: "六维力传感器", subPct: "15.0%" },
  { main: "行星滚柱丝杠", mainPct: "25.0%", sub: "灵巧手", subPct: "10.0%" },
  { main: "无框力矩电机", mainPct: "20.0%", sub: "滚珠丝杠", subPct: "8.0%" },
];

const TIMELINE = [
  { time: "Q1", event: "样机验证", done: true },
  { time: "Q2", event: "小批量", done: false },
  { time: "Q3", event: "量产预投", done: false },
  { time: "Q4", event: "规模出货", done: false },
];

// ── 研报库组件 ──────────────────────────────────────────────
const REPORT_KEYWORDS = "机器人,减速器,丝杠,执行器,灵巧手";
const LINK_CATEGORIES: [string, string[]][] = [
  ["谐波减速器", ["谐波", "减速器", "绿的"]],
  ["行星滚柱丝杠", ["滚柱丝杠", "行星丝杠", "滚珠丝杠", "丝杠"]],
  ["无框力矩电机", ["无框力矩", "力矩电机", "电机", "伺服"]],
  ["六维力传感器", ["六维力", "力传感器", "力矩传感器", "触觉"]],
  ["灵巧手", ["灵巧手", "末端执行", "夹爪", "手指"]],
  ["滚珠丝杠", ["滚珠丝杠"]],
  ["通用", []],
];

function guessCategory(title: string): string {
  for (const [cat, keys] of LINK_CATEGORIES) {
    if (keys.length === 0) continue;
    for (const k of keys) {
      if (title.includes(k)) return cat;
    }
  }
  return "通用";
}

function ReportsTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        keywords: REPORT_KEYWORDS,
        pages: "5",
        beginTime: "",
        endTime: "",
      });
      const resp = await fetch(`/api/reports/industry?${params}`);
      const data = await resp.json();
      if (data.status === "ok") {
        setReports(data.reports || []);
      } else {
        setError("获取研报失败");
      }
    } catch {
      setError("网络错误");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  return (
    <div className="space-y-4" style={{ maxWidth: 960, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#333" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 className="text-lg font-semibold">行业研报库</h2>
          <p className="text-sm text-muted-foreground mt-1">
            近三个月 · 机器人产业链 · 东财行业研报（qType=1）· 共 {reports.length} 篇
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
        >
          {loading ? "加载中…" : "刷新"}
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground/50">
          暂无研报数据
        </div>
      )}

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
                    <a
                      href={`https://data.eastmoney.com/report/zw_industry.jshtml?infocode=${r.infoCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#333", textDecoration: "none" }}
                      className="hover:text-primary transition-colors"
                    >
                      {r.title}
                    </a>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      color: "#FF9900",
                      backgroundColor: "#FFF9F0",
                      border: "1px solid #FFE0B2",
                      whiteSpace: "nowrap",
                    }}>
                      {guessCategory(r.title)}
                    </span>
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

function TabContent({ tab }: { tab: TabKey }) {
  switch (tab) {
    case "overview":
      return (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 0", fontFamily: "system-ui, sans-serif", color: "#333" }}>
          {/* ── 顶部：产业链结构图 ── */}
          <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#fff", padding: 20, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: ORANGE }}>产业链全景</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ border: "1px solid #E5E5E5", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#666", backgroundColor: "#fafafa" }}>上游材料<br /><span style={{ fontSize: 11 }}>稀土永磁 · 精密陶瓷 · 特种材料</span></div>
              <span style={{ color: "#D9D9D9", fontSize: 18 }}>→</span>
              <div style={{ border: `2px solid ${ORANGE}`, borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: ORANGE, backgroundColor: "#FFF9F0" }}>六大核心环节</div>
              <span style={{ color: "#D9D9D9", fontSize: 18 }}>→</span>
              <div style={{ border: "1px solid #E5E5E5", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#666", backgroundColor: "#fafafa" }}>下游整机<br /><span style={{ fontSize: 11 }}>Tesla Optimus · 小米 · 优必选</span></div>
            </div>
          </div>

          {/* ── 六大核心环节卡片 3x2 ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            {OVERVIEW_COMPONENTS.map((c, i) => (
              <div key={c.label} style={{ border: i === 3 ? `2px solid ${ORANGE}` : "1px solid #E5E5E5", borderRadius: 10, backgroundColor: i === 3 ? "#FFF9F0" : "#fff", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚙</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: "#999" }}>{c.sub}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: ORANGE }}>{c.pct}</div>
              </div>
            ))}
          </div>

          {/* ── 中排双列：板块评分 + 核心标的池 ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* 板块评分总览 */}
            <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#fff", padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span>📊</span> 板块评分总览
              </div>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E5E5E5", color: "#999", fontSize: 11 }}>
                    <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 500 }}>指标名称</th>
                    <th style={{ textAlign: "right", padding: "6px 0", fontWeight: 500 }}>评分</th>
                  </tr>
                </thead>
                <tbody>
                  {SCORE_ROWS.map((r) => (
                    <tr key={r.label} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 0", color: "#333" }}>{r.label}</td>
                      <td style={{ padding: "8px 0", textAlign: "right", color: r.score === "——" ? "#ccc" : "#666" }}>{r.score}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding: "10px 0", fontWeight: 700, color: ORANGE, fontSize: 14 }}>板块综合分</td>
                    <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 700, color: ORANGE, fontSize: 18 }}>88.0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 核心标的池 */}
            <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#fff", padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span>🎯</span> 核心标的池
              </div>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E5E5E5", color: "#999", fontSize: 11 }}>
                    <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 500 }}>核心标的</th>
                    <th style={{ textAlign: "right", padding: "6px 0", fontWeight: 500 }}>价格/市值</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 0", color: "#ccc" }}>核心标的 {i}</td>
                      <td style={{ padding: "8px 0", textAlign: "right", color: "#ccc" }}>待更新</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 11, color: "#bbb", marginTop: 8 }}>只列前四，不包含部分个股</div>
            </div>
          </div>

          {/* ── 整机成本构成 + 量产时间轴 ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* 整机成本构成 */}
            <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#fff", padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span>💰</span> 整机成本构成
              </div>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E5E5E5", color: "#999", fontSize: 11 }}>
                    <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 500 }}>部件名称</th>
                    <th style={{ textAlign: "right", padding: "6px 0", fontWeight: 500 }}>占比</th>
                  </tr>
                </thead>
                <tbody>
                  {COST_ROWS.map((r) => [
                    <tr key={r.main} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "7px 0", color: "#333" }}>{r.main}</td>
                      <td style={{ padding: "7px 0", textAlign: "right", color: ORANGE, fontWeight: 600 }}>{r.mainPct}</td>
                    </tr>,
                    <tr key={r.main + "-sub"} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "5px 0 7px 16px", color: "#999", fontSize: 12 }}>└ {r.sub}</td>
                      <td style={{ padding: "5px 0 7px", textAlign: "right", color: "#999", fontSize: 12 }}>{r.subPct}</td>
                    </tr>
                  ])}
                </tbody>
              </table>
            </div>

            {/* 量产时间轴 */}
            <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#fff", padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                <span>⏱</span> 量产进度
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", paddingTop: 20, overflow: "hidden" }}>
                {/* 连接线 */}
                <div style={{ position: "absolute", top: 28, left: "10%", right: "10%", height: 1, borderTop: "1px dashed #E5E5E5", pointerEvents: "none" }} />
                {TIMELINE.map((t) => (
                  <div key={t.time} style={{ textAlign: "center", flex: 1, position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>{t.time}</div>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: t.done ? ORANGE : "#E5E5E5", border: t.done ? `2px solid ${ORANGE}` : "2px solid #D9D9D9", margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 12, color: t.done ? ORANGE : "#999", fontWeight: t.done ? 600 : 400 }}>{t.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 板块结论 ── */}
          <div style={{ border: "1px solid #E5E5E5", borderRadius: 12, backgroundColor: "#FFF9F0", padding: "20px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span>📝</span> 板块结论
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: ORANGE, lineHeight: 1.6 }}>
              &ldquo;当前看上行空间超百倍&rdquo;
            </div>
          </div>
        </div>
      );

    case "harmonic":
      return <SubPageTemplate title="谐波减速器" content={HARMONIC} />;
    case "roller-screw":
      return <SubPageTemplate title="行星滚柱丝杠" content={ROLLER_SCREW} />;
    case "frameless-motor":
      return <SubPageTemplate title="无框力矩电机" content={FRAMELESS_MOTOR} />;
    case "force-sensor":
      return <SubPageTemplate title="六维力传感器" content={FORCE_SENSOR} />;
    case "dexterous-hand":
      return <SubPageTemplate title="灵巧手" content={DEXTEROUS_HAND} />;
    case "ball-screw":
      return <SubPageTemplate title="滚珠丝杠" content={BALL_SCREW} />;
    case "reports":
      return <ReportsTab />;

    default:
      return <p className="text-muted-foreground">未知板块</p>;
  }
}

export function HumanoidRobot() {
  const [active, setActive] = useState<TabKey>("overview");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">人形机器人</h1>
        <p className="text-sm text-muted-foreground mt-1">产业链分板块跟踪</p>
      </div>

      {/* 分栏切换 */}
      <div className="flex flex-wrap gap-1.5 border-b pb-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={
              `inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-[1px] ` +
              (active === key
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50")
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <TabContent tab={active} />
    </div>
  );
}
