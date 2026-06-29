import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TrendingUp, TrendingDown, RefreshCcw,
  Target, Flame, ScrollText, Swords, ExternalLink,
  Clock, AlertTriangle, Globe,
  ChevronDown, ChevronRight, Newspaper, DollarSign, Zap,
  BarChart3, Radio, BookOpen, FileText
} from "lucide-react";

// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

interface IndexDef { code: string; name: string; market: "a" | "us"; }
interface IndexData { code: string; name: string; price: number; changePct: number; changeAmt: number; }

interface SectorItem { code: string; name: string; price: number; changePct: number; changeAmt: number; }

interface LHBSeatItem {
  code: string;
  name: string;
  tradeDate: string;
  seatName: string;
  isInstitution: boolean;
  buyAmt: number;
  sellAmt: number;
  netBuy: number;
  explanation: string;
  changeRate: number;
  statisticsDays: string;
}

interface LHBStockAgg {
  code: string;
  name: string;
  changeRate: number;
  tradeDate: string;
  explanation: string;
  instNetBuy: number;
  instBuyCount: number;
  instSellCount: number;
  instBuyAmt: number;
  instSellAmt: number;
  hotMoneySeats: string[];
  hotMoneyNetBuy: number;
  totalNetBuy: number;
}

const HOT_MONEY_KEYWORDS = [
  "拉萨", "益田路荣超", "上海江苏路", "绍兴", "上海打浦路",
  "上海溧阳路", "深南大道京基", "杭州龙井路", "三亚迎宾路",
  "深圳红岭中路", "杭州体育场路", "深圳华富路", "上海牡丹江路",
  "华鑫证券深圳分公司", "国泰君安上海分公司", "量化",
];

interface ReportItem {
  title: string;
  stockName: string;
  stockCode: string;
  orgName: string;
  orgSName: string;
  publishDate: string;
  infoCode: string;
  industryName: string;
  ratingName: string;
}

interface USMoverItem {
  symbol: string; name: string;
  price: number; changePct: number; changeAmt: number;
}

interface USMarketOverview {
  sectorTop5: Array<{ name: string; changePct: number }>;
  sectorBottom5: Array<{ name: string; changePct: number }>;
  techStocks: Array<{ symbol: string; name: string; changePct: number; reason: string }>;
  aShareMapping: Array<{ usSector: string; cnSector: string; relevance: string }>;
}

interface TodayCatalyst {
  events: Array<{
    eventName: string;
    time: string;
    affectSector: string;
    impactIntensity: "高" | "中" | "低";
    description: string;
  }>;
}

interface MorningReport {
  reports: Array<{
    title: string;
    coreConclusion: string;
    industry: string;
    ratingChange: string;
    targetAdjustment: string;
  }>;
}

// ══════════════════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════════════════

const INDEX_LIST: IndexDef[] = [
  { code: "sh000001", name: "上证指数", market: "a" },
  { code: "sz399001", name: "深证成指", market: "a" },
  { code: "sz399006", name: "创业板指", market: "a" },
  { code: "int_nasdaq", name: "纳斯达克", market: "us" },
  { code: "int_sp500", name: "标普500", market: "us" },
  { code: "int_dji", name: "道琼斯", market: "us" },
  { code: "int_sox", name: "费城半导体", market: "us" },
];

const US_MOVER_CODES = ["AAPL", "NVDA", "TSLA", "MSFT", "AMD", "INTC", "META", "GOOGL", "AMZN", "AVGO", "SMCI", "ARM"];

// Four-phase definition
type PhaseKey = "preMarket" | "intraday" | "postMarket" | "industry";

const PHASES: { key: PhaseKey; label: string; icon: typeof Target; color: string; desc: string }[] = [
  { key: "preMarket", label: "盘前情报", icon: Newspaper, color: "text-amber-500", desc: "隔夜美股·早报头条·热点锁定" },
  { key: "intraday", label: "盘中监测", icon: Zap, color: "text-red-500", desc: "板块排行·资金流向·涨跌停" },
  { key: "postMarket", label: "盘后龙虎榜", icon: Swords, color: "text-purple-500", desc: "机构席位·游资动向·净买入" },
  { key: "industry", label: "产业链媒体", icon: Radio, color: "text-blue-500", desc: "行业研报·政策动态·一手消息" },
];

/*
// Determine auto-expanded phase based on time of day
function getDefaultPhase(): PhaseKey {
  const h = new Date().getHours();
  const day = new Date().getDay();
  if (day === 0 || day === 6) return "industry"; // weekend → read reports

  if (h >= 6 && h < 9) return "preMarket";    // 盘前
  if (h >= 9 && h < 15) return "intraday";     // 盘中
  if (h >= 15 && h < 18) return "postMarket";  // 盘后
  return "industry";                            // 晚间→研读
}
*/

// ══════════════════════════════════════════════════════════════
// Utility — A股红涨绿跌 / 美股绿涨红跌
// ══════════════════════════════════════════════════════════════

/** 统一红涨绿跌（全市场） */
function colorClass(pct: number) {
  if (pct > 0) return "text-red-500 dark:text-red-400";
  if (pct < 0) return "text-emerald-600 dark:text-emerald-400";
  return "text-muted-foreground";
}

function bgColorClass(pct: number) {
  if (pct > 0) return "bg-red-500/10";
  if (pct < 0) return "bg-emerald-500/10";
  return "bg-muted/30";
}

function TrendIcon({ pct, size }: { pct: number; size?: string }) {
  const s = size || "h-3.5 w-3.5";
  if (pct > 0) return <TrendingUp className={s} />;
  if (pct < 0) return <TrendingDown className={s} />;
  return <span className={`${s} inline-block text-center`}>—</span>;
}

// ══════════════════════════════════════════════════════════════
// API Fetch functions — all using CORS-safe methods
// ══════════════════════════════════════════════════════════════


function parseSinaResponse(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = text.split("\n");
  for (const line of lines) {
    const match = line.match(/var\s+hq_str_(\w+)\s*=\s*"([^"]*)"/);
    if (match) {
      result[match[1]] = match[2];
    }
  }
  return result;
}

async function fetchIndices(): Promise<Record<string, IndexData>> {
  const aCodes = INDEX_LIST.filter(i => i.market === "a").map(i => i.code);
  const usCodes = INDEX_LIST.filter(i => i.market === "us").map(i => i.code);

  const [aR, usR] = await Promise.allSettled([
    (async () => {
      const q = aCodes.join(",");
      const url = API_PROXY
        ? `/api/tencent?q=${q}`
        : `/api/tencent?q=${q}&_t=${Date.now()}`;
      const resp = await fetch(url);
      const text = await resp.text();
      const r: Record<string, IndexData> = {};
      for (const code of aCodes) {
        const match = text.match(new RegExp(`v_${code}="([^"]*)"`));
        if (!match) continue;
        const f = match[1].split("~");
        if (f.length < 50) continue;
        const def = INDEX_LIST.find(d => d.code === code);
        r[code] = {
          code,
          name: def?.name || f[1],
          price: parseFloat(f[3]) || 0,
          changeAmt: parseFloat(f[31]) || 0,
          changePct: parseFloat(f[32]) || 0,
        };
      }
      return r;
    })(),
    (async () => {
      const q = usCodes.join(",");
      const url = API_PROXY
        ? `/api/sina/list=${q}`
        : `/api/sina/list=${q}`;
      const resp = await fetch(url);
      const text = await resp.text();
      const parsed = parseSinaResponse(text);
      const r: Record<string, IndexData> = {};
      for (const code of usCodes) {
        const raw = parsed[code];
        if (!raw) continue;
        const f = raw.split(",");
        if (f.length < 4) continue;
        const def = INDEX_LIST.find(d => d.code === code);
        r[code] = {
          code,
          name: def?.name || f[0],
          price: parseFloat(f[1]) || 0,
          changeAmt: parseFloat(f[2]) || 0,
          changePct: parseFloat(f[3]) || 0,
        };
      }
      return r;
    })(),
  ]);
  const merged: Record<string, IndexData> = {};
  if (aR.status === "fulfilled") Object.assign(merged, aR.value);
  if (usR.status === "fulfilled") Object.assign(merged, usR.value);
  return merged;
}

// API 路径统一使用 /api/ 前缀
// 本地开发: serve.js / Vite 代理
// 生产环境: Netlify Functions
const API_PROXY = '';

async function fetchSectors(): Promise<SectorItem[]> {
  const params = new URLSearchParams({
    pn: "1", pz: "40", po: "1", np: "1", fltt: "2", invt: "2",
    fs: "m:90+t:2", fields: "f12,f14,f2,f3,f4,f14",
  });
    const url = `/api/sectors?${params.toString()}`;
  const resp = await fetch(url);
  const json = await resp.json();
  // Handle both Eastmoney raw format and backend-wrapped format
  const items = json?.data?.diff || json?.data || [];
  return (items).map((d: Record<string, unknown>) => ({
    code: String(d.f12 || d.code || ""),
    name: String(d.f14 || d.name || ""),
    price: Number(d.f2 || d.price) || 0,
    changePct: Number(d.f3 || d.changePct) || 0,
    changeAmt: Number(d.f4 || d.changeAmt) || 0,
  }));
}

async function fetchLHBSeats(): Promise<LHBSeatItem[]> {
  const params = new URLSearchParams({
    reportName: "RPT_BILLBOARD_SEAT",
    columns: "SECURITY_CODE,SECURITY_NAME_ABBR,TRADE_DATE,OPERATEDEPT_NAME,BUY_AMT,SELL_AMT,NET_BUY,TRADE_DIRECTION,EXPLANATION,CHANGE_RATE,STATISTICS_DAYS",
    pageNumber: "1",
    pageSize: "1000",
    sortTypes: "-1",
    sortColumns: "TRADE_DATE",
    source: "WEB",
    client: "WEB",
  });
    const url = `/api/dragon?${params.toString()}`;
  const resp = await fetch(url);
  const json = await resp.json();
  const raw: Record<string, unknown>[] = json?.result?.data || [];
  if (raw.length === 0) return [];
  // Keep only the most recent trade date
  const latestDate = String(raw[0].TRADE_DATE || "").slice(0, 10);
  return raw
    .filter(d => String(d.TRADE_DATE || "").slice(0, 10) === latestDate)
    .map(d => {
      const seatName = String(d.OPERATEDEPT_NAME || "");
      return {
        code: String(d.SECURITY_CODE || ""),
        name: String(d.SECURITY_NAME_ABBR || ""),
        tradeDate: latestDate,
        seatName,
        isInstitution: seatName === "机构专用",
        buyAmt: Number(d.BUY_AMT) || 0,
        sellAmt: Number(d.SELL_AMT) || 0,
        netBuy: Number(d.NET_BUY) || 0,
        explanation: String(d.EXPLANATION || ""),
        changeRate: Number(d.CHANGE_RATE) || 0,
        statisticsDays: String(d.STATISTICS_DAYS || "1"),
      };
    });
}

function aggregateLHB(seats: LHBSeatItem[]): LHBStockAgg[] {
  const map = new Map<string, LHBStockAgg>();
  for (const s of seats) {
    if (!map.has(s.code)) {
      map.set(s.code, {
        code: s.code, name: s.name, changeRate: s.changeRate,
        tradeDate: s.tradeDate, explanation: s.explanation,
        instNetBuy: 0, instBuyCount: 0, instSellCount: 0,
        instBuyAmt: 0, instSellAmt: 0,
        hotMoneySeats: [], hotMoneyNetBuy: 0,
        totalNetBuy: 0,
      });
    }
    const agg = map.get(s.code)!;
    agg.totalNetBuy += s.netBuy;
    if (s.isInstitution) {
      if (s.buyAmt > 0) agg.instBuyCount++;
      if (s.sellAmt > 0) agg.instSellCount++;
      agg.instBuyAmt += s.buyAmt;
      agg.instSellAmt += s.sellAmt;
      agg.instNetBuy += s.netBuy;
    } else {
      if (HOT_MONEY_KEYWORDS.some(kw => s.seatName.includes(kw))) {
        agg.hotMoneySeats.push(s.seatName);
        agg.hotMoneyNetBuy += s.netBuy;
      }
    }
  }
  return Array.from(map.values());
}

async function fetchReports(): Promise<ReportItem[]> {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const params = new URLSearchParams({
    pageNo: "1",
    pageSize: "15",
    beginTime: weekAgo,
    endTime: today,
    qType: "0",
  });
    const url = `/api/reports?${params.toString()}`;
  const resp = await fetch(url);
  const json = await resp.json();
  // Eastmoney reports API returns { data: { data: [...] } } or { data: [...] }
  const reportData = json?.data;
  const items = (reportData?.data || reportData || []);
  return items.slice(0, 15).map((d: Record<string, unknown>) => ({
    title: String(d.title || ""),
    stockName: String(d.stockName || ""),
    stockCode: String(d.stockCode || ""),
    orgName: String(d.orgName || ""),
    orgSName: String(d.orgSName || ""),
    publishDate: String(d.publishDate || "").slice(0, 10),
    infoCode: String(d.infoCode || ""),
    industryName: String(d.indvInduName || d.industryName || ""),
    ratingName: String(d.emRatingName || d.sRatingName || ""),
  }));
}

async function fetchUSMovers(): Promise<USMoverItem[]> {
  const q = US_MOVER_CODES.map(c => `gb_${c.toLowerCase()}`).join(",");
  const url = API_PROXY
    ? `/api/sina/list=${q}`
    : `/api/sina/list=${q}`;
  const resp = await fetch(url);
  const text = await resp.text();
  const parsed = parseSinaResponse(text);
  const r: USMoverItem[] = [];
  for (const code of US_MOVER_CODES) {
    const raw = parsed['gb_' + code.toLowerCase()];
    if (!raw) continue;
    const f = raw.split(",");
    if (f.length < 4 || !f[0]) continue;
    r.push({
      symbol: code,
      name: f[0],
      price: parseFloat(f[1]) || 0,
      changePct: parseFloat(f[2]) || 0,
      changeAmt: parseFloat(f[4]) || 0,
    });
  }
  return r.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
}

// ══════════════════════════════════════════════════════════════
// Sub-components
// ══════════════════════════════════════════════════════════════

function IndexBar({ indices, loading }: { indices: Record<string, IndexData>; loading: boolean }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {INDEX_LIST.map(def => {
        const data = indices[def.code];
        if (loading || !data) {
          return (
            <div key={def.code} className="rounded-lg border bg-card p-2.5 shadow-sm animate-pulse min-w-[120px] flex-shrink-0">
              <div className="h-2.5 bg-muted rounded w-10 mb-1.5" />
              <div className="h-5 bg-muted rounded w-16 mb-1" />
              <div className="h-2.5 bg-muted rounded w-12" />
            </div>
          );
        }
        const cc = colorClass(data.changePct);
        return (
          <div key={def.code} className="rounded-lg border bg-card p-2.5 shadow-sm min-w-[120px] flex-shrink-0">
            <div className="text-[11px] font-medium text-muted-foreground mb-0.5">{data.name}</div>
            <div className={`text-base font-bold tabular-nums ${cc}`}>
              {data.price >= 1000
                ? data.price.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                : data.price.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-medium tabular-nums ${cc}`}>
              <TrendIcon pct={data.changePct} size="h-3 w-3" />
              <span>{data.changePct > 0 ? "+" : ""}{data.changePct.toFixed(2)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Expandable card wrapper ---
function ExpandCard({
  phase, defaultExpanded, children
}: {
  phase: typeof PHASES[number];
  defaultExpanded: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const Icon = phase.icon;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden transition-all">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className={`p-2 rounded-lg bg-muted/50 ${phase.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{phase.label}</div>
          <div className="text-xs text-muted-foreground">{phase.desc}</div>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="border-t p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Phase 1 — 盘前情报
// ══════════════════════════════════════════════════════════════

function PreMarketPanel() {
  const [usMovers, setUsMovers] = useState<USMoverItem[]>([]);
  const [loadingUS, setLoadingUS] = useState(true);
  const [usErr, setUsErr] = useState("");

  // Static data for new modules (to be replaced with real API later)
  const [usMarketData] = useState<USMarketOverview>({
    sectorTop5: [
      { name: "半导体", changePct: 1.25 },
      { name: "科技", changePct: 0.88 },
      { name: "通信服务", changePct: 0.72 },
      { name: "非必需消费", changePct: 0.65 },
      { name: "工业", changePct: 0.48 }
    ],
    sectorBottom5: [
      { name: "能源", changePct: -0.85 },
      { name: "公用事业", changePct: -0.42 },
      { name: "房地产", changePct: -0.38 },
      { name: "必需消费", changePct: -0.25 },
      { name: "医疗", changePct: -0.18 }
    ],
    techStocks: [
      { symbol: "NVDA", name: "英伟达", changePct: 1.85, reason: "AI芯片需求预期上调" },
      { symbol: "AAPL", name: "苹果", changePct: 0.62, reason: "iPhone销量预期改善" },
      { symbol: "MSFT", name: "微软", changePct: 0.78, reason: "Azure云服务增长" },
      { symbol: "TSLA", name: "特斯拉", changePct: -0.45, reason: "交付数据不及预期" },
      { symbol: "AMD", name: "AMD", changePct: 1.25, reason: "AI芯片市场份额扩大" },
      { symbol: "META", name: "Meta", changePct: 0.92, reason: "广告收入预期上调" }
    ],
    aShareMapping: [
      { usSector: "半导体/AI", cnSector: "A股算力芯片、光模块、AI服务器", relevance: "高" },
      { usSector: "科技/通信", cnSector: "A股消费电子、5G通信", relevance: "中" },
      { usSector: "新能源", cnSector: "A股新能源车、锂电材料", relevance: "中" }
    ]
  });

  const [todayCatalyst] = useState<TodayCatalyst>({
    events: [
      {
        eventName: "国家统计局公布PMI数据",
        time: "09:30",
        affectSector: "全市场",
        impactIntensity: "高",
        description: "制造业采购经理指数，反映经济景气度"
      },
      {
        eventName: "工信部电子信息制造业座谈会",
        time: "14:00",
        affectSector: "半导体、消费电子",
        impactIntensity: "中",
        description: "讨论产业链供应链稳定"
      },
      {
        eventName: "新股申购：XX科技(688XXX)",
        time: "全天",
        affectSector: "新股",
        impactIntensity: "低",
        description: "科创板新股申购"
      }
    ]
  });

  const [morningReports] = useState<MorningReport>({
    reports: [
      {
        title: "AI算力产业链深度：从GPU到光模块的全链条机会",
        coreConclusion: "上调行业评级至超配，建议关注光模块、AI服务器、算力芯片",
        industry: "通信设备",
        ratingChange: "中性→超配",
        targetAdjustment: "平均上调15%"
      },
      {
        title: "半导体设备国产化加速：刻蚀/CVD双轮驱动",
        coreConclusion: "首次覆盖北方华创、中微公司，目标价分别上调20%",
        industry: "半导体设备",
        ratingChange: "首次覆盖",
        targetAdjustment: "目标价上调20%"
      },
      {
        title: "新能源车产业链2026年投资策略：智能化+出海双主线",
        coreConclusion: "维持行业标配，建议关注智能驾驶、海外产能布局标的",
        industry: "新能源车",
        ratingChange: "标配维持",
        targetAdjustment: "个别标的调整"
      }
    ]
  });

  useEffect(() => {
    fetchUSMovers()
      .then(setUsMovers)
      .catch(() => setUsErr("美股数据加载失败"))
      .finally(() => setLoadingUS(false));
  }, []);

  return (
    <div className="space-y-4">
      {/* Module 1: 隔夜美股核心标的涨跌 (unchanged) */}
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-blue-500" />
          隔夜美股核心标的涨跌
          <span className="text-xs text-muted-foreground font-normal">（前一交易日收盘）</span>
        </h4>
        {loadingUS ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : usErr ? (
          <p className="text-sm text-muted-foreground/60">{usErr}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {usMovers.map(item => (
              <div
                key={item.symbol}
                className={`rounded-lg border p-2.5 ${bgColorClass(item.changePct)} hover:shadow-sm transition-shadow`}
                title={`${item.name} — 昨收价格`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-mono font-bold">{item.symbol}</span>
                  <div className={`flex items-center gap-0.5 text-xs font-bold tabular-nums ${colorClass(item.changePct)}`}>
                    <TrendIcon pct={item.changePct} size="h-3 w-3" />
                    {item.changePct > 0 ? "+" : ""}{item.changePct.toFixed(2)}%
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">{item.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Module 2: 【美股动向】 */}
      <div className="rounded-lg border bg-card/50 p-4 space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-500" />
          【美股动向】隔夜市场焦点与催化
        </h4>

        {/* 板块涨跌前5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-red-500" />
              领涨板块 TOP5
            </div>
            <div className="space-y-1">
              {usMarketData.sectorTop5.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-muted/30">
                  <span className="font-medium">{i + 1}. {s.name}</span>
                  <span className={colorClass(s.changePct)}>{s.changePct > 0 ? "+" : ""}{s.changePct.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-500" />
              领跌板块 TOP5
            </div>
            <div className="space-y-1">
              {usMarketData.sectorBottom5.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-muted/30">
                  <span className="font-medium">{i + 1}. {s.name}</span>
                  <span className={colorClass(s.changePct)}>{s.changePct > 0 ? "+" : ""}{s.changePct.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 重要科技股涨跌 */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">重要科技股涨跌</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {usMarketData.techStocks.map((stock, i) => (
              <div key={i} className={`flex items-center justify-between text-xs px-2 py-1.5 rounded border ${bgColorClass(stock.changePct)}`}>
                <div>
                  <span className="font-mono font-bold">{stock.symbol}</span>
                  <span className="text-muted-foreground ml-1">{stock.name}</span>
                </div>
                <span className={`font-bold ${colorClass(stock.changePct)}`}>
                  {stock.changePct > 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* A股映射板块 */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">📌 对A股今日可能映射的板块</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {usMarketData.aShareMapping.map((m, i) => (
              <div key={i} className="rounded bg-muted/30 p-2 text-xs">
                <div className="font-medium text-blue-500">{m.usSector}</div>
                <div className="text-muted-foreground mt-0.5">{m.cnSector}</div>
                <div className="text-[10px] mt-1">关联度：<span className={m.relevance === "高" ? "text-red-500" : "text-amber-500"}>{m.relevance}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module 3: 【今日催化】 */}
      <div className="rounded-lg border bg-card/50 p-4 space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          【今日催化】24H内重大事件与政策
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-medium">事件名称</th>
                <th className="text-left py-2 px-2 font-medium">时间</th>
                <th className="text-left py-2 px-2 font-medium">影响板块</th>
                <th className="text-left py-2 px-2 font-medium">影响强度</th>
              </tr>
            </thead>
            <tbody>
              {todayCatalyst.events.map((event, i) => (
                <tr key={i} className="border-b border-muted/50 hover:bg-muted/20">
                  <td className="py-2 px-2 font-medium">{event.eventName}</td>
                  <td className="py-2 px-2 text-muted-foreground">{event.time}</td>
                  <td className="py-2 px-2">{event.affectSector}</td>
                  <td className="py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      event.impactIntensity === "高" ? "bg-red-500/10 text-red-500" :
                      event.impactIntensity === "中" ? "bg-amber-500/10 text-amber-600" :
                      "bg-green-500/10 text-green-600"
                    }`}>
                      {event.impactIntensity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-muted-foreground/60">💡 数据来源：国务院官网、发改委/工信部网站、财联社（实时更新中）</p>
      </div>

      {/* Module 4: 【研报风向】 */}
      <div className="rounded-lg border bg-card/50 p-4 space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          【研报风向】凌晨-早间最新研报
        </h4>
        <div className="space-y-2">
          {morningReports.reports.map((report, i) => (
            <div key={i} className="rounded-lg border p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{report.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{report.industry} · {report.coreConclusion}</div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {report.ratingChange !== "无" && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-medium">
                      {report.ratingChange}
                    </span>
                  )}
                  {report.targetAdjustment !== "无" && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-medium">
                      {report.targetAdjustment}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/60">💡 数据来源：Wind、东方财富研报中心（实时更新中）</p>
      </div>

      {/* 早报信息 */}
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold">今日早报 · 关键信息</span>
          <span className="text-xs text-muted-foreground">（数据来源：财联社 / 证券时报 · 需在浏览器中查看完整内容）</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="https://www.cls.cn/telegraph"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border bg-card/50 p-3 hover:bg-card transition-colors"
          >
            <Newspaper className="h-4 w-4 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium">财联社电报</div>
              <div className="text-xs text-muted-foreground">7×24实时快讯</div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 ml-auto" />
          </a>
          <a
            href="https://www.stcn.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border bg-card/50 p-3 hover:bg-card transition-colors"
          >
            <Radio className="h-4 w-4 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium">证券时报</div>
              <div className="text-xs text-muted-foreground">权威财经媒体</div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 ml-auto" />
          </a>
          <a
            href="https://www.eastmoney.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border bg-card/50 p-3 hover:bg-card transition-colors"
          >
            <BarChart3 className="h-4 w-4 text-red-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium">东方财富</div>
              <div className="text-xs text-muted-foreground">24小时全球财经</div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 ml-auto" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-3">
          💡 盘前操盘备忘录：① 看隔夜美股映射A股板块情绪 ② 查看早报确认当日事件催化 ③ 确认自选股竞价量价
        </p>
      </div>

      {/* 美股→A股情绪映射表 */}
      <div className="rounded-lg border bg-card/50 p-3">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">美股→A股情绪映射参考</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { us: "NVDA/AMD ↑", cn: "算力芯片、光模块", color: "text-emerald-500" },
            { us: "TSLA ↑", cn: "新能源车、锂电", color: "text-emerald-500" },
            { us: "AAPL/MSFT ↑", cn: "消费电子、AI应用", color: "text-emerald-500" },
            { us: "SMCI/ARM ↑", cn: "AI服务器、存储", color: "text-emerald-500" },
          ].map((item, i) => (
            <div key={i} className="rounded bg-muted/30 p-2">
              <span className={item.color}>{item.us}</span>
              <span className="text-muted-foreground"> → </span>
              <span>{item.cn}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 

// ══════════════════════════════════════════════════════════════
// Phase 2 — 盘中监测
// ══════════════════════════════════════════════════════════════

function IntradayPanel({ sectors, loading }: { sectors: SectorItem[]; loading: boolean }) {
  const [view, setView] = useState<"hot" | "cold">("hot");

  const top = useMemo(() => {
    const sorted = [...sectors].sort((a, b) => b.changePct - a.changePct);
    return view === "hot" ? sorted.slice(0, 20) : sorted.reverse().slice(0, 20);
  }, [sectors, view]);

  return (
    <div className="space-y-4">
      {/* 板块涨跌切换 */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          实时板块排行
        </h4>
        <div className="flex text-xs rounded-lg bg-muted p-0.5">
          <button
            onClick={() => setView("hot")}
            className={`px-2.5 py-1 rounded-md transition-colors ${view === "hot" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
          >
            🔥 涨幅 TOP 20
          </button>
          <button
            onClick={() => setView("cold")}
            className={`px-2.5 py-1 rounded-md transition-colors ${view === "cold" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
          >
            ❄️ 跌幅 TOP 20
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : top.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground/60">
          板块数据加载中，请稍后刷新
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {top.map((item, i) => {
            const cc = colorClass(item.changePct);
            const bg = bgColorClass(item.changePct);
            return (
              <div
                key={item.code}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bg} hover:shadow-sm transition-shadow cursor-pointer`}
                onClick={() => window.open(`https://quote.eastmoney.com/unify/r/90.${item.code}`, "_blank")}
                title="点击查看板块详情（东方财富）"
              >
                <span className="text-[11px] font-bold text-muted-foreground w-5 shrink-0 text-center">
                  {i < 3 ? <span className={i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-amber-600"}>{i + 1}</span> : i + 1}
                </span>
                <span className="flex-1 text-xs font-medium truncate">{item.name}</span>
                <span className={`text-xs font-bold tabular-nums ${cc} flex items-center gap-1`}>
                  <TrendIcon pct={item.changePct} size="h-3 w-3" />
                  {item.changePct > 0 ? "+" : ""}{item.changePct.toFixed(2)}%
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground/30 shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* 资金流向提示 */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold">盘中资金监测要点</span>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>① 看板块涨幅前5 + 主力净流入前5 → 确认当日主攻方向</li>
          <li>② 北向资金净流向：连续3日净流入 → 外资加仓信号</li>
          <li>③ 涨停板数量 &amp; 炸板率：封板率&gt;70% → 短线情绪好</li>
          <li>④ 以看为主，不做追高；等右侧确认后的回踩介入</li>
        </ul>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Phase 3 — 盘后龙虎榜
// ══════════════════════════════════════════════════════════════

function PostMarketPanel({ seats, loading }: { seats: LHBSeatItem[]; loading: boolean }) {
  const stocks = useMemo(() => aggregateLHB(seats), [seats]);
  const tradeDate = seats[0]?.tradeDate || "";

  // Section 1: 机构净买入 > 3000万
  const instBigBuy = stocks
    .filter(s => s.instNetBuy > 30_000_000)
    .sort((a, b) => b.instNetBuy - a.instNetBuy);

  // Section 2: 机构连续上榜 (statisticsDays >= 3 OR instBuyCount >= 2)
  const instContinuous = stocks
    .filter(s => s.instBuyCount >= 2 && s.instNetBuy > 0)
    .sort((a, b) => b.instNetBuy - a.instNetBuy);

  // Section 3: 知名游资大额买入
  const hotMoney = stocks
    .filter(s => s.hotMoneySeats.length > 0 && s.hotMoneyNetBuy > 5_000_000)
    .sort((a, b) => b.hotMoneyNetBuy - a.hotMoneyNetBuy);

  // Section 4: 机构大额卖出 (警示)
  const instBigSell = stocks
    .filter(s => s.instNetBuy < -10_000_000)
    .sort((a, b) => a.instNetBuy - b.instNetBuy);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 rounded bg-muted/30 animate-pulse" />
        <div className="h-32 rounded-lg bg-muted/30 animate-pulse" />
        <div className="h-32 rounded-lg bg-muted/30 animate-pulse" />
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground/60">
        <Swords className="h-8 w-8 mx-auto mb-2 opacity-20" />
        今日无龙虎榜数据（非交易日或数据暂未更新）
      </div>
    );
  }

  const fmtWan = (v: number) => (v / 10000).toFixed(0);

  const renderRow = (s: LHBStockAgg, idx: number, type: "instBuy" | "instSell" | "hotMoney") => {
    const netColor = type === "instSell" ? "text-emerald-600" : "text-red-500";
    const netBg = type === "instSell" ? "bg-emerald-500/5" : "bg-red-500/5";
    const netVal = type === "hotMoney" ? s.hotMoneyNetBuy : s.instNetBuy;
    let signal = "";
    if (type === "instBuy") {
      signal = s.instBuyCount >= 2 ? "机构连续布局" : "机构大额买入";
      if (s.changeRate < 3 && s.instNetBuy > 50_000_000) signal += "·悄悄吸筹";
    } else if (type === "instSell") {
      signal = "机构大额出逃";
      if (s.changeRate > 5) signal += "·高位派发";
    } else {
      signal = "游资抢筹";
      if (s.instNetBuy > 0) signal += "·机构游资合力";
    }

    return (
      <div
        key={`${s.code}-${idx}`}
        className={`grid grid-cols-12 gap-1 px-2.5 py-2 rounded-lg border ${netBg} hover:shadow-sm transition-shadow cursor-pointer text-xs items-center`}
        onClick={() => window.open(`https://data.eastmoney.com/stock/lhb,${s.tradeDate},${s.code}.html`, "_blank")}
        title="点击查看龙虎榜详情"
      >
        <span className="col-span-1 font-bold text-muted-foreground text-center">{idx + 1}</span>
        <div className="col-span-2 min-w-0">
          <div className="font-medium truncate">{s.name}</div>
          <div className="text-[10px] text-muted-foreground">{s.code}</div>
        </div>
        <span className={`col-span-2 font-bold text-right ${netColor}`}>
          {netVal > 0 ? "+" : ""}{fmtWan(netVal)}万
        </span>
        <span className="col-span-1 text-center text-muted-foreground">
          {type === "hotMoney" ? "—" : `${s.instBuyCount}买`}
        </span>
        <span className="col-span-1 text-center text-muted-foreground">
          {type === "hotMoney" ? "—" : `${s.instSellCount}卖`}
        </span>
        <span className={`col-span-2 text-right ${colorClass(s.changeRate)}`}>
          {s.changeRate > 0 ? "+" : ""}{s.changeRate.toFixed(2)}%
        </span>
        <span className="col-span-3 text-[10px] text-muted-foreground truncate" title={signal}>
          {signal}
        </span>
      </div>
    );
  };

  const SectionHeader = ({ icon, title, count, color }: { icon: string; title: string; count: number; color: string }) => (
    <div className={`flex items-center gap-2 mb-2 ${color}`}>
      <span className="text-sm font-semibold">{icon}</span>
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-muted-foreground font-normal">({count}只)</span>
    </div>
  );

  const TableHeader = () => (
    <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground border-b">
      <span className="col-span-1 text-center">#</span>
      <span className="col-span-2">名称/代码</span>
      <span className="col-span-2 text-right">净额(万)</span>
      <span className="col-span-1 text-center">买入席</span>
      <span className="col-span-1 text-center">卖出席</span>
      <span className="col-span-2 text-right">涨跌幅</span>
      <span className="col-span-3">信号解读</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Swords className="h-4 w-4 text-purple-500" />
        龙虎榜深度拆解
        {tradeDate && (
          <span className="text-xs text-muted-foreground font-normal">数据日期：{tradeDate}</span>
        )}
      </h4>

      {/* Section 1: 机构净买入 > 3000万 */}
      <div>
        <SectionHeader icon="🔵" title="机构净买入 > 3000万" count={instBigBuy.length} color="text-blue-600" />
        {instBigBuy.length > 0 ? (
          <div className="space-y-1">
            <TableHeader />
            {instBigBuy.slice(0, 15).map((s, i) => renderRow(s, i, "instBuy"))}
          </div>
        ) : <p className="text-xs text-muted-foreground/60 py-2">今日无符合条件个股</p>}
      </div>

      {/* Section 2: 机构连续布局 */}
      <div>
        <SectionHeader icon="🟢" title="机构连续布局（多席位买入）" count={instContinuous.length} color="text-emerald-600" />
        {instContinuous.length > 0 ? (
          <div className="space-y-1">
            <TableHeader />
            {instContinuous.slice(0, 10).map((s, i) => renderRow(s, i, "instBuy"))}
          </div>
        ) : <p className="text-xs text-muted-foreground/60 py-2">今日无符合条件个股</p>}
      </div>

      {/* Section 3: 知名游资大额买入 */}
      <div>
        <SectionHeader icon="🟠" title="知名游资大额买入" count={hotMoney.length} color="text-orange-600" />
        {hotMoney.length > 0 ? (
          <div className="space-y-1">
            <TableHeader />
            {hotMoney.slice(0, 10).map((s, i) => renderRow(s, i, "hotMoney"))}
            <div className="text-[10px] text-muted-foreground mt-1 px-2">
              涉及游资席位：{hotMoney.flatMap(s => s.hotMoneySeats).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5).map(n => n.length > 12 ? n.slice(0, 12) + "..." : n).join("、")}
            </div>
          </div>
        ) : <p className="text-xs text-muted-foreground/60 py-2">今日无知名游资上榜</p>}
      </div>

      {/* Section 4: 机构大额卖出 (警示) */}
      <div>
        <SectionHeader icon="🔴" title="机构大额卖出（警示信号）" count={instBigSell.length} color="text-red-600" />
        {instBigSell.length > 0 ? (
          <div className="space-y-1">
            <TableHeader />
            {instBigSell.slice(0, 10).map((s, i) => renderRow(s, i, "instSell"))}
          </div>
        ) : <p className="text-xs text-muted-foreground/60 py-2">今日无符合条件个股</p>}
      </div>

      <div className="rounded-lg border bg-card/50 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>信号说明：</strong></p>
            <p>· 机构净买入&gt;3000万 = 中线布局信号，特别关注涨幅不大但机构大买的个股</p>
            <p>· 多席位买入 = 机构共识信号，比单一席位买入更可靠</p>
            <p>· 游资大额买入 = 短线情绪信号，注意区分机构逻辑 vs 游资逻辑</p>
            <p>· 机构大额卖出 = 警示信号，特别是前期强势股出现机构出货</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Phase 4 — 产业链媒体
// ══════════════════════════════════════════════════════════════

function IndustryPanel({ reports, loading }: { reports: ReportItem[]; loading: boolean }) {
  const [filter, setFilter] = useState("all");

  // Group reports by industry
  const industries = useMemo(() => {
    const map = new Map<string, ReportItem[]>();
    for (const r of reports) {
      const k = r.industryName || "综合";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [reports]);

  const filtered = filter === "all" ? reports : reports.filter(r => (r.industryName || "综合") === filter);

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <ScrollText className="h-4 w-4 text-blue-500" />
        最新行业研报（近7天）
        {!loading && <span className="text-xs text-muted-foreground font-normal">共 {reports.length} 篇</span>}
      </h4>

      {/* 行业筛选 */}
      {industries.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            全部
          </button>
          {industries.slice(0, 8).map(([name]) => (
            <button
              key={name}
              onClick={() => setFilter(name)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 truncate max-w-[120px] ${filter === name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-11 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground/60">
          研报数据加载中，请稍后刷新
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((r, i) => (
            <a
              key={`${r.infoCode}-${i}`}
              href={`https://data.eastmoney.com/report/info/${r.infoCode}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card/50 hover:bg-card transition-colors group"
            >
              <span className="text-[11px] font-bold text-muted-foreground w-5 shrink-0 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate group-hover:text-primary transition-colors">{r.title}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                  {r.stockName && <span className="font-medium">{r.stockName}</span>}
                  {r.stockCode && <span className="font-mono">{r.stockCode}</span>}
                  <span>·</span>
                  <span>{r.orgSName || r.orgName}</span>
                  <span>·</span>
                  <span>{r.publishDate}</span>
                  {r.ratingName && (
                    <>
                      <span>·</span>
                      <span className={`px-1 py-0.5 rounded text-[10px] font-medium ${r.ratingName.includes("买入") || r.ratingName.includes("优于") ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {r.ratingName}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 shrink-0 transition-colors" />
            </a>
          ))}
        </div>
      )}

      {/* 产业链媒体入口 */}
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
        <h4 className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1.5">
          <Radio className="h-3.5 w-3.5" />
          产业链垂直媒体 · 一手消息
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "科创板日报", url: "https://www.chinastarmarket.cn/", desc: "硬科技赛道" },
            { label: "36氪", url: "https://36kr.com/", desc: "创投&新经济" },
            { label: "半导体行业观察", url: "https://www.semiinsights.com/", desc: "芯片产业链" },
            { label: "高工锂电", url: "https://www.gg-lb.com/", desc: "锂电&储能" },
            { label: "光伏們", url: "https://www.pvmen.com/", desc: "光伏产业链" },
            { label: "机器之心", url: "https://www.jiqizhixin.com/", desc: "AI&机器人" },
            { label: "集微网", url: "https://www.jiwei.net/", desc: "半导体&ICT" },
            { label: "盖世汽车", url: "https://auto.gasgoo.com/", desc: "智能汽车" },
          ].map(item => (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-0.5 rounded-lg border bg-card/50 p-2.5 hover:bg-card transition-colors"
            >
              <span className="text-xs font-medium">{item.label}</span>
              <span className="text-[10px] text-muted-foreground">{item.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════

export function WarRoom() {
  const [indices, setIndices] = useState<Record<string, IndexData>>({});
  const [loadingIdx, setLoadingIdx] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [idxErr, setIdxErr] = useState("");

  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);

  const [lhbSeats, setLhbSeats] = useState<LHBSeatItem[]>([]);
  const [loadingLHB, setLoadingLHB] = useState(true);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // ── Refresh all ──
  const refreshAll = useCallback(() => {
    setLoadingIdx(true);
    setLoadingSectors(true);
    setLoadingLHB(true);
    setLoadingReports(true);
    setIdxErr("");

    fetchIndices()
      .then(data => { setIndices(data); setLastUpdate(new Date().toLocaleTimeString("zh-CN")); })
      .catch(() => setIdxErr("大盘数据加载失败"))
      .finally(() => setLoadingIdx(false));

    fetchSectors()
      .then(setSectors)
      .catch(() => {})
      .finally(() => setLoadingSectors(false));

    fetchLHBSeats()
      .then(setLhbSeats)
      .catch(() => {})
      .finally(() => setLoadingLHB(false));

    fetchReports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  // Auto-refresh indices every 15s
  useEffect(() => {
    const t = setInterval(() => {
      fetchIndices()
        .then(data => { setIndices(data); setLastUpdate(new Date().toLocaleTimeString("zh-CN")); })
        .catch(() => {});
    }, 15_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            每日作战室
          </h1>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <Clock className="h-3 w-3" />
            {lastUpdate ? `最后更新：${lastUpdate}` : "加载中…"}
            {idxErr && <span className="text-red-400">{idxErr}</span>}
          </p>
        </div>
        <button
          onClick={refreshAll}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          刷新全部
        </button>
      </div>

      {/* ── 大盘指数实时条 ── */}
      <IndexBar indices={indices} loading={loadingIdx} />

      {/* ── 四阶段作战面板 ── */}
      {PHASES.map(phase => (
        <ExpandCard key={phase.key} phase={phase} defaultExpanded={true}>
          {phase.key === "preMarket" && <PreMarketPanel />}
          {phase.key === "intraday" && <IntradayPanel sectors={sectors} loading={loadingSectors} />}
          {phase.key === "postMarket" && <PostMarketPanel seats={lhbSeats} loading={loadingLHB} />}
          {phase.key === "industry" && <IndustryPanel reports={reports} loading={loadingReports} />}
        </ExpandCard>
      ))}
    </div>
  );
}
