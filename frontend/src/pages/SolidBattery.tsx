import { useState, useEffect, useCallback } from "react";
import { Cpu, BatteryMedium, Layers, CircuitBoard, HardDrive, Grid3X3, BookOpen, FlaskConical, Cylinder, Beaker } from "lucide-react";

const TABS = [
  { key: "overview", label: "总览", icon: Grid3X3 },
  { key: "reports", label: "研报库", icon: BookOpen },
  { key: "solid-electrolyte", label: "固态电解质", icon: FlaskConical },
  { key: "cathode", label: "高镍/富锂锰正极", icon: BatteryMedium },
  { key: "anode", label: "硅碳/锂金属负极", icon: Cylinder },
  { key: "cnt", label: "CNT导电剂", icon: CircuitBoard },
  { key: "composite-collector", label: "复合集流体", icon: Layers },
  { key: "dry-electrode", label: "干法电极设备", icon: Cpu },
  { key: "isostatic-pressing", label: "等静压成型", icon: Beaker },
  { key: "precursor", label: "前驱体", icon: HardDrive },
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
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">🌍 竞争格局</h3>
        <p className="text-sm text-muted-foreground">待补（产业级格局描述，个股层暂不展开）</p>
      </div>
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
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">🎯 核心标的</h3>
        <p className="text-sm text-muted-foreground">待补（个股层暂不展开）</p>
      </div>
    </div>
  );
}

// ── 八个环节内容 ──────────────────────────────────────────
const SOLID_ELECTROLYTE: SectorContent = {
  positioning: "固态电解质是全固态电池的核心材料，替代传统液态电解液+隔膜，承担锂离子传输和正负极物理隔离双重功能。主流路线包括氧化物（LLZO/LLTO）、硫化物（LGPS/LiSiPSCl）、聚合物（PEO基）三大体系。硫化物离子电导率最高（>10mS/cm），是丰田/三星SDI/宁德时代主攻方向。固态电解质占电芯成本约30-40%，是价值量最高的单一材料环节。",
  valueShare: "35%",
  domestication: "<15%",
  techBarrier: { level: 92, desc: "硫化物空气稳定性（遇水生成H2S）、氧化物晶界电阻、电解质/电极固固界面阻抗。硫化物量产需要露点<-60度的干燥房，全球仅出光兴产/三井金属有吨级产能。" },
  capacityBarrier: { level: 85, desc: "硫化物电解质前驱体（Li2S）价格>1000元/kg，规模化后可降至200-300元/kg。全球硫化锂产能<100吨/年，扩产周期18-24个月。" },
  scores: [{ dim: "技术壁垒", level: 92 }, { dim: "价值量占比", level: 95 }, { dim: "国产化率", level: 12 }, { dim: "产业确定性", level: 85 }, { dim: "业绩弹性", level: 90 }],
};

const CATHODE: SectorContent = {
  positioning: "高镍/富锂锰正极是固态电池正极材料的两大升级方向。高镍正极（NCM811/NCMA/Ni90+）提升能量密度上限，富锂锰基（Li-rich Mn）通过阴离子氧化还原实现>300mAh/g比容量且成本大幅降低。固态电池可适配更高电压正极（>4.5V），充分发挥高镍/富锂锰材料的潜力。正极材料占电芯成本约25%。",
  valueShare: "25%",
  domestication: "40-50%",
  techBarrier: { level: 75, desc: "高镍正极表面残锂/产气问题、富锂锰首圈不可逆容量损失、电压衰减。超高镍（Ni95+）前驱体共沉淀控制是核心工艺难点。" },
  capacityBarrier: { level: 55, desc: "高镍正极产能国内（容百/当升/华友）已超50万吨/年，产能充裕。富锂锰正极尚在中试阶段，量产线投资约3-5亿元/万吨。" },
  scores: [{ dim: "技术壁垒", level: 75 }, { dim: "价值量占比", level: 80 }, { dim: "国产化率", level: 45 }, { dim: "产业确定性", level: 80 }, { dim: "业绩弹性", level: 75 }],
};

const ANODE: SectorContent = {
  positioning: "硅碳/锂金属负极是固态电池负极材料的核心升级路径。硅碳负极（SiOx/C或Si/C）理论比容量4200mAh/g（石墨372的10倍+），已小批量用于消费电子和高端电动车。锂金属负极是固态电池的终极负极方案，理论比容量3860mAh/g且电位最低，搭配固态电解质可实现>500Wh/kg。硅碳负极占电芯成本约10%，锂金属负极目前实验室阶段。",
  valueShare: "10%",
  domestication: "20-30%",
  techBarrier: { level: 85, desc: "硅碳负极体积膨胀（>300%）导致SEI反复破裂、循环寿命短。锂金属负极的枝晶生长和死锂形成是核心科学难题。CVD法硅碳和预锂化技术是关键。" },
  capacityBarrier: { level: 65, desc: "硅碳负极国内（贝特瑞/杉杉/璞泰来）已有万吨级产能。锂金属负极尚未产业化，产能壁垒不适用（目前为零）。" },
  scores: [{ dim: "技术壁垒", level: 85 }, { dim: "价值量占比", level: 60 }, { dim: "国产化率", level: 25 }, { dim: "产业确定性", level: 75 }, { dim: "业绩弹性", level: 80 }],
};

const CNT: SectorContent = {
  positioning: "CNT（碳纳米管）导电剂是固态电池正极的关键辅材，在正极材料颗粒间形成三维导电网络，降低内阻、提升倍率性能。固态电池因无液态电解液浸润，对导电剂依赖更强，CNT添加量从液态电池的0.5-1%提升至2-5%，单GWh用量增加3-5倍。单壁CNT性能最优但价格昂贵（>1000万元/吨），多壁CNT为主流方案。",
  valueShare: "3%",
  domestication: ">60%",
  techBarrier: { level: 70, desc: "单壁CNT选择性制备（纯度>95%）、分散工艺（避免团聚）是核心壁垒。OCSiAl（俄罗斯）全球单壁CNT市占率>90%。多壁CNT国内技术已成熟。" },
  capacityBarrier: { level: 40, desc: "多壁CNT国内产能充裕（天奈科技/道氏技术），单壁CNT全球仅OCSiAl有百吨级产能。国内单壁CNT中试阶段。" },
  scores: [{ dim: "技术壁垒", level: 70 }, { dim: "价值量占比", level: 20 }, { dim: "国产化率", level: 65 }, { dim: "产业确定性", level: 80 }, { dim: "业绩弹性", level: 60 }],
};

const COMPOSITE_COLLECTOR: SectorContent = {
  positioning: "复合集流体采用\"金属-高分子-金属\"三明治结构替代传统纯铜/铝箔，可减重40-60%、提升能量密度3-5%、消除内短路风险（高分子层在热失控时熔断）。固态电池因工作温度更高、对安全性要求更极致，是复合集流体的理想应用场景。复合铜箔（PET/Cu）和复合铝箔（PET/Al）是两大方向，单车价值量约1200-2000元。",
  valueShare: "5%",
  domestication: ">50%",
  techBarrier: { level: 65, desc: "PVD/PECVD镀膜均匀性（<5%偏差）、高分子基膜耐温性（>150度）、镀层结合力。磁控溅射+水电镀两步法是主流工艺。" },
  capacityBarrier: { level: 50, desc: "磁控溅射设备产能受限（爱发科/应材主导），国产设备（汇成真空/振华）正在追赶。复合铜箔良率从60%提升至85%+是产业关键节点。" },
  scores: [{ dim: "技术壁垒", level: 65 }, { dim: "价值量占比", level: 40 }, { dim: "国产化率", level: 55 }, { dim: "产业确定性", level: 85 }, { dim: "业绩弹性", level: 70 }],
};

const DRY_ELECTRODE: SectorContent = {
  positioning: "干法电极工艺是固态电池制造的核心设备创新，通过PTFE纤维化替代传统湿法涂布+NMP溶剂回收，省去涂布干燥和溶剂回收两道工序，设备投资降低30%、能耗降低60%、厂房面积减少50%。特斯拉4680电池率先引入干法电极（Maxwell技术），固态电池因省去电解液注入工序，干法工艺协同性更强。",
  valueShare: "8%",
  domestication: "<20%",
  techBarrier: { level: 80, desc: "PTFE纤维化均匀度控制（<10%偏差）、干法电极膜厚度一致性（<2μm）、连续化卷对卷生产节拍（>50m/min）。特斯拉/Maxwell积累超过10年专利壁垒。" },
  capacityBarrier: { level: 70, desc: "干法电极设备全球仅Maxwell（特斯拉）、三星SDI、LG新能源有成熟产线。国产设备（先导智能/赢合科技）处于样机/小试阶段，差距约2-3年。" },
  scores: [{ dim: "技术壁垒", level: 80 }, { dim: "价值量占比", level: 55 }, { dim: "国产化率", level: 15 }, { dim: "产业确定性", level: 75 }, { dim: "业绩弹性", level: 75 }],
};

const ISOSTATIC_PRESSING: SectorContent = {
  positioning: "等静压成型是固态电解质成型的关键工艺，通过高压液体/气体介质对粉体施加各向均匀压力（100-600MPa），获得高致密度（>99%）、无缺陷的固态电解质陶瓷片。冷等静压（CIP）用于粉体预成型，热等静压（HIP）用于最终致密化烧结。等静压设备单台价格1000-3000万元，是固态电池产线投资最大的单机设备之一。",
  valueShare: "5%",
  domestication: "<10%",
  techBarrier: { level: 85, desc: "超高压容器设计（>600MPa）、温度/压力均匀性控制（<5度/<10MPa偏差）、大尺寸腔体制造。全球仅Quintus（瑞典）/Kobelco（日本）/Avure（美国）掌握核心超高压技术。" },
  capacityBarrier: { level: 75, desc: "超高压腔体锻件（>100吨级）全球仅日本JSW/中国一重可供应。国产等静压设备（川西机器/中科新达）最高压力约300MPa，与进口差距明显。" },
  scores: [{ dim: "技术壁垒", level: 85 }, { dim: "价值量占比", level: 40 }, { dim: "国产化率", level: 8 }, { dim: "产业确定性", level: 70 }, { dim: "业绩弹性", level: 70 }],
};

const PRECURSOR: SectorContent = {
  positioning: "前驱体是正极材料制备的核心中间体，通过共沉淀法将镍/钴/锰/铝等金属盐溶液转化为球形氢氧化物前驱体（Ni(1-x-y)CoxMny(OH)2），经与锂盐混合烧结后制成正极材料。前驱体的粒径分布（D50:3-15μm）、形貌（球形度）、元素分布均匀性直接决定正极材料性能。固态电池对前驱体一致性和纯度要求更高。前驱体占正极材料成本约50%。",
  valueShare: "9%",
  domestication: ">70%",
  techBarrier: { level: 65, desc: "超高镍（Ni95+）前驱体共沉淀pH/氨浓度精确控制（<0.1偏差）、粒径窄分布（span<0.8）、杂质控制（<10ppb）。华友钴业/格林美/中伟股份全球份额超40%。" },
  capacityBarrier: { level: 40, desc: "前驱体产能扩张周期约12个月，单万吨投资约2-3亿元。国内产能超200万吨/年（占全球70%+），产能壁垒较低。" },
  scores: [{ dim: "技术壁垒", level: 65 }, { dim: "价值量占比", level: 75 }, { dim: "国产化率", level: 72 }, { dim: "产业确定性", level: 85 }, { dim: "业绩弹性", level: 65 }],
};

// ── 总览数据 ──────────────────────────────────────────────
const ORANGE = "#FF9900";
const OVERVIEW_COMPONENTS = [
  { label: "固态电解质", pct: "35%" },
  { label: "高镍/富锂锰正极", pct: "25%" },
  { label: "硅碳/锂金属负极", pct: "10%" },
  { label: "CNT导电剂", pct: "3%" },
  { label: "复合集流体", pct: "5%" },
  { label: "干法电极设备", pct: "8%" },
  { label: "等静压成型", pct: "5%" },
  { label: "前驱体", pct: "9%" },
];

const SCORE_ROWS = [
  { label: "产业确定性", score: "80.0" },
  { label: "业绩弹性", score: "85.0" },
  { label: "估值位置", score: "70.0" },
  { label: "产业协同", score: "75.0" },
  { label: "国产替代进度", score: "35.0" },
  { label: "周期阶段", score: "——" },
];

const COST_ROWS = [
  { main: "固态电解质", mainPct: "35.0%", sub: "正极材料+前驱体", subPct: "34.0%" },
  { main: "硅碳/锂金属负极", mainPct: "10.0%", sub: "干法电极设备", subPct: "8.0%" },
  { main: "复合集流体", mainPct: "5.0%", sub: "等静压成型设备", subPct: "5.0%" },
];

const TIMELINE = [
  { time: "2025", event: "半固态量产装车", done: true },
  { time: "2027", event: "全固态小批量", done: false },
  { time: "2028", event: "硫化物全固态中试", done: false },
  { time: "2030+", event: "全固态规模化量产", done: false },
];

// ── 研报库 ────────────────────────────────────────────────
const REPORT_KEYWORDS = "锂电池,固态电池,锂电,负极材料,正极材料,电解质,复合集流体,导电剂,前驱体,干法电极,电池设备,富锂锰,硅碳,CNT,碳纳米管,等静压";

const LINK_CATEGORIES: [string, string[]][] = [
  ["固态电解质", ["固态电解质", "硫化物", "氧化物", "LLZO", "LGPS", "聚合物", "电解质膜", "固态电池"]],
  ["高镍/富锂锰正极", ["高镍", "富锂锰", "NCM", "NCMA", "正极", "超高镍", "正极材料"]],
  ["硅碳/锂金属负极", ["硅碳", "锂金属", "负极", "SiOx", "金属锂", "负极材料"]],
  ["CNT导电剂", ["CNT", "碳纳米管", "导电剂", "单壁", "多壁"]],
  ["复合集流体", ["复合集流体", "复合铜箔", "复合铝箔", "PET膜"]],
  ["干法电极设备", ["干法电极", "干法", "PTFE", "纤维化", "Maxwell", "电池设备"]],
  ["等静压成型", ["等静压", "CIP", "HIP", "冷等静压", "热等静压"]],
  ["前驱体", ["前驱体", "共沉淀", "氢氧化物"]],
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
          <p className="text-sm text-muted-foreground mt-1">近三个月 · 固态电池产业链 · 东财行业研报（qType=1）· 共 {reports.length} 篇</p>
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
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: ORANGE }}>固态电池产业链全景</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ border: "1px solid #E5E5E5", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#666", backgroundColor: "#fafafa" }}>上游<br /><span style={{ fontSize: 11 }}>锂矿 · 镍钴锰盐 · 化工原料</span></div>
              <span style={{ color: "#D9D9D9", fontSize: 18 }}>→</span>
              <div style={{ border: `2px solid ${ORANGE}`, borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: ORANGE, backgroundColor: "#FFF9F0" }}>八大核心环节</div>
              <span style={{ color: "#D9D9D9", fontSize: 18 }}>→</span>
              <div style={{ border: "1px solid #E5E5E5", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#666", backgroundColor: "#fafafa" }}>下游<br /><span style={{ fontSize: 11 }}>电动车 · 储能 · 消费电子 · eVTOL</span></div>
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
                  <tr><td style={{ padding: "10px 0", fontWeight: 700, color: ORANGE, fontSize: 14 }}>板块综合分</td><td style={{ padding: "10px 0", textAlign: "right", fontWeight: 700, color: ORANGE, fontSize: 18 }}>82.0</td></tr>
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
              <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 12 }}>💰 电芯成本构成</div>
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
              <div style={{ fontSize: 15, fontWeight: 600, color: ORANGE, marginBottom: 16 }}>⏱ 产业化里程碑</div>
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
              &ldquo;固态电池是下一代电池技术的终极方向，2027-2028年全固态有望小批量装车，电解质+设备国产替代空间最大&rdquo;
            </div>
          </div>
        </div>
      );
    case "solid-electrolyte":     return <SubPageTemplate title="固态电解质" content={SOLID_ELECTROLYTE} />;
    case "cathode":               return <SubPageTemplate title="高镍/富锂锰正极" content={CATHODE} />;
    case "anode":                 return <SubPageTemplate title="硅碳/锂金属负极" content={ANODE} />;
    case "cnt":                   return <SubPageTemplate title="CNT导电剂" content={CNT} />;
    case "composite-collector":   return <SubPageTemplate title="复合集流体" content={COMPOSITE_COLLECTOR} />;
    case "dry-electrode":         return <SubPageTemplate title="干法电极设备" content={DRY_ELECTRODE} />;
    case "isostatic-pressing":    return <SubPageTemplate title="等静压成型" content={ISOSTATIC_PRESSING} />;
    case "precursor":             return <SubPageTemplate title="前驱体" content={PRECURSOR} />;
    case "reports":               return <ReportsTab />;
    default:                      return <p className="text-muted-foreground">未知板块</p>;
  }
}

export function SolidBattery() {
  const [active, setActive] = useState<TabKey>("overview");
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">固态电池</h1>
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
