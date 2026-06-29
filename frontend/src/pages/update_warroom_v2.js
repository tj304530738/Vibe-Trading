const fs = require('fs');
const filePath = 'WarRoom.tsx';

console.log('开始完整更新WarRoom.tsx...');

// 读取文件
let content = fs.readFileSync(filePath, 'utf8');

// 1. 修复导入语句 - 移除未使用的导入
content = content.replace(
  /import \{\s*TrendingUp,\s*TrendingDown,\s*RefreshCcw,[\s\S]*?\} from "lucide-react";/,
  `import {
  TrendingUp, TrendingDown, RefreshCcw,
  Target, Flame, ScrollText, Swords, ExternalLink,
  Clock, AlertTriangle, Globe,
  ChevronDown, ChevronRight, Newspaper, DollarSign, Zap,
  BarChart3, Radio, BookOpen, Calendar, FileText
} from "lucide-react";`
);

console.log('✓ 已修复导入语句');

// 2. 移除未使用的接口定义
// 找到并删除USMarketOverview、TodayCatalyst、MorningReport接口
let lines = content.split('\n');
let newLines = [];
let skipLines = false;
let braceCount = 0;
let interfaceName = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 检测接口定义开始
  if (line.match(/^interface\s+(USMarketOverview|TodayCatalyst|MorningReport)\s*\{/)) {
    skipLines = true;
    interfaceName = line.match(/interface\s+(\w+)/)[1];
    braceCount = 1;
    console.log(`  跳过接口定义: ${interfaceName}`);
    continue;
  }
  
  if (skipLines) {
    // 计算花括号
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceCount += openBraces - closeBraces;
    
    // 如果花括号平衡了，结束跳过
    if (braceCount <= 0) {
      skipLines = false;
      // 跳过接口后面的空行
      while (i + 1 < lines.length && lines[i + 1].trim() === '') {
        i++;
      }
    }
    continue;
  }
  
  newLines.push(line);
}

content = newLines.join('\n');
console.log('✓ 已移除未使用的接口定义');

// 3. 修复getDefaultPhase函数（如果未使用，可以保留）

// 4. 完整重写PreMarketPanel组件
const newPreMarketPanel = `
function PreMarketPanel() {
  const [usMovers, setUsMovers] = useState<USMoverItem[]>([]);
  const [loadingUS, setLoadingUS] = useState(true);
  const [usErr, setUsErr] = useState("");

  // 美股动向数据（静态示例，后续接入API）
  const usOverview: USMarketOverview = {
    indices: [
      { name: "纳斯达克", code: "IXIC", changePct: 0.44, reason: "科技股反弹，AI概念股走强" },
      { name: "标普500", code: "INX", changePct: 0.12, reason: "宽基指数小幅上涨" },
      { name: "道琼斯", code: "DJI", changePct: -0.23, reason: "传统板块承压" },
    ],
    sectorTop5: [
      { name: "半导体", changePct: 2.35 },
      { name: "AI算力", changePct: 1.89 },
      { name: "软件服务", changePct: 1.45 },
      { name: "通信设备", changePct: 1.12 },
      { name: "新能源", changePct: 0.98 },
    ],
    sectorBottom5: [
      { name: "传统零售", changePct: -1.56 },
      { name: "航空运输", changePct: -1.23 },
      { name: "生物医药", changePct: -0.89 },
      { name: "金融银行", changePct: -0.67 },
      { name: "房地产", changePct: -0.45 },
    ],
    semiIndex: { name: "费城半导体指数", changePct: 1.78 },
    techStocks: [
      { symbol: "NVDA", name: "英伟达", changePct: 1.23, reason: "AI芯片需求持续旺盛" },
      { symbol: "AAPL", name: "苹果", changePct: -0.45, reason: "iPhone销量预期下调" },
      { symbol: "MSFT", name: "微软", changePct: 0.89, reason: "Azure云服务增长强劲" },
      { symbol: "TSLA", name: "特斯拉", changePct: -1.67, reason: "交付数据不及预期" },
      { symbol: "AMD", name: "超微", changePct: 2.14, reason: "AI GPU市场份额提升" },
    ],
    aShareMapping: [
      { usSector: "半导体", cnSector: "A股芯片板块", relevance: "高" },
      { usSector: "AI算力", cnSector: "算力基础设施", relevance: "高" },
      { usSector: "通信设备", cnSector: "5G/6G产业链", relevance: "中" },
      { usSector: "新能源", cnSector: "新能源车产业链", relevance: "中" },
    ],
  };

  // 今日催化数据（静态示例，后续接入API）
  const catalyst: TodayCatalyst = {
    events: [
      {
        eventName: "国务院常务会议",
        time: "今日 10:00",
        affectSector: "全部",
        impactIntensity: "高",
        description: "讨论经济形势和政策措施",
      },
      {
        eventName: "工信部新能源汽车政策发布",
        time: "今日 14:00",
        affectSector: "新能源车、锂电",
        impactIntensity: "高",
        description: "新能源汽车产业扶持政策细则",
      },
      {
        eventName: "CPI/PPI数据公布",
        time: "今日 09:30",
        affectSector: "全部",
        impactIntensity: "中",
        description: "5月通胀数据，影响货币政策预期",
      },
      {
        eventName: "新股申购：XX科技",
        time: "今日",
        affectSector: "科创板",
        impactIntensity: "低",
        description: "科创板新股，主营AI芯片",
      },
      {
        eventName: "XX股份解禁",
        time: "今日",
        affectSector: "半导体",
        impactIntensity: "中",
        description: "限售股解禁1.2亿股，关注抛压",
      },
    ],
  };

  // 研报风向数据（静态示例，后续接入API）
  const morningReports: MorningReport = {
    reports: [
      {
        title: "半导体行业2026年中期策略：AI算力驱动新一轮成长周期",
        coreConclusion: "行业评级上调至\\"强于大市\\"，建议关注算力芯片和先进封装",
        industry: "半导体",
        ratingChange: "上调",
        targetAdjustment: "平均上调15%",
      },
      {
        title: "新能源汽车产业链深度报告：智能化加速，产业链价值重估",
        coreConclusion: "首次覆盖智能座舱产业链，给予\\"买入\\"评级",
        industry: "新能源车",
        ratingChange: "首次覆盖",
        targetAdjustment: "新覆盖",
      },
      {
        title: "光模块行业跟踪：800G需求爆发，1.6T商用提速",
        coreConclusion: "目标价大幅上调20-30%，维持\\"买入\\"评级",
        industry: "通信设备",
        ratingChange: "维持",
        targetAdjustment: "上调20-30%",
      },
    ],
  };

  useEffect(() => {
    fetchUSMovers()
      .then(setUsMovers)
      .catch(() => setUsErr("美股数据加载失败"))
      .finally(() => setLoadingUS(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* ===== 第一部分：隔夜美股核心标的涨跌 ===== */}
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
                className={\`rounded-lg border p-2.5 \${bgColorClass(item.changePct)} hover:shadow-sm transition-shadow\`}
                title={\`\${item.name} — 昨收价格\`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-mono font-bold">{item.symbol}</span>
                  <div className={\`flex items-center gap-0.5 text-xs font-bold tabular-nums \${colorClass(item.changePct)}\`}>
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

      {/* ===== 第二部分：【美股动向】===== */}
      <div className="rounded-lg border bg-card/50 p-4">
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-orange-500" />
          【美股动向】5分钟了解隔夜美股市场在炒什么
        </h4>

        {/* 2.1 三大指数表现 */}
        <div className="mb-4">
          <h5 className="text-xs font-semibold text-muted-foreground mb-2">📊 隔夜美股三大指数表现</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {usOverview.indices.map((idx, i) => (
              <div key={i} className={\`rounded-lg border p-3 \${bgColorClass(idx.changePct)}\`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{idx.name}</span>
                  <span className={\`text-sm font-bold tabular-nums \${colorClass(idx.changePct)}\`}>
                    {idx.changePct > 0 ? "+" : ""}{idx.changePct.toFixed(2)}%
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">{idx.reason}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2.2 板块涨跌前5 */}
        <div className="mb-4">
          <h5 className="text-xs font-semibold text-muted-foreground mb-2">🔥 板块涨跌幅前5</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-medium text-emerald-600 mb-1.5">涨幅前5</div>
              {usOverview.sectorTop5.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-muted/30">
                  <span className="text-xs">{i + 1}. {s.name}</span>
                  <span className={\`text-xs font-bold \${colorClass(s.changePct)}\`}>
                    +{s.changePct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[11px] font-medium text-red-500 mb-1.5">跌幅前5</div>
              {usOverview.sectorBottom5.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-muted/30">
                  <span className="text-xs">{i + 1}. {s.name}</span>
                  <span className={\`text-xs font-bold \${colorClass(s.changePct)}\`}>
                    {s.changePct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2.3 费城半导体指数 */}
        <div className="mb-4 rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold">费城半导体指数 (SOX)</span>
            <span className={\`text-sm font-bold \${colorClass(usOverview.semiIndex.changePct)}\`}>
              {usOverview.semiIndex.changePct > 0 ? "+" : ""}{usOverview.semiIndex.changePct.toFixed(2)}%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">半导体板块是美股科技股风向标，重点关注NVDA、AMD、INTC等龙头股表现</p>
        </div>

        {/* 2.4 核心科技股涨跌原因 */}
        <div className="mb-4">
          <h5 className="text-xs font-semibold text-muted-foreground mb-2">💡 核心科技股涨跌及原因</h5>
          <div className="space-y-1.5">
            {usOverview.techStocks.map((stock, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-muted/20">
                <span className="text-xs font-mono font-bold w-12 shrink-0">{stock.symbol}</span>
                <span className="text-xs flex-1 truncate">{stock.name}</span>
                <span className={\`text-xs font-bold w-16 text-right shrink-0 tabular-nums \${colorClass(stock.changePct)}\`}>
                  {stock.changePct > 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
                </span>
                <span className="text-[10px] text-muted-foreground flex-1 truncate">{stock.reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2.5 A股映射板块 */}
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground mb-2">🎯 对A股今日可能产生映射的板块</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {usOverview.aShareMapping.map((m, i) => (
              <div key={i} className="rounded-lg bg-muted/30 p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium">美股：{m.usSector}</span>
                  <span className="text-muted-foreground mx-1">→</span>
                  <span className="text-xs font-medium text-blue-600">A股：{m.cnSector}</span>
                </div>
                <span className={\`text-[10px] font-bold \${
                  m.relevance === "高" ? "text-red-500" : m.relevance === "中" ? "text-amber-500" : "text-muted-foreground"
                }\`}>
                  关联度：{m.relevance}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 第三部分：【今日催化】===== */}
      <div className="rounded-lg border bg-card/50 p-4">
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-green-500" />
          【今日催化】24小时内A股重大事件
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-muted/30">
                <th className="text-left py-2 px-2 font-semibold">事件名称</th>
                <th className="text-left py-2 px-2 font-semibold">时间</th>
                <th className="text-left py-2 px-2 font-semibold">影响板块</th>
                <th className="text-center py-2 px-2 font-semibold">影响强度</th>
              </tr>
            </thead>
            <tbody>
              {catalyst.events
                .sort((a, b) => {
                  const order = { "高": 3, "中": 2, "低": 1 };
                  return (order[b.impactIntensity as keyof typeof order] || 0) - (order[a.impactIntensity as keyof typeof order] || 0);
                })
                .map((event, i) => (
                  <tr key={i} className="border-b border-muted/20 hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-2">
                      <div className="font-medium">{event.eventName}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{event.description}</div>
                    </td>
                    <td className="py-2.5 px-2 text-muted-foreground">{event.time}</td>
                    <td className="py-2.5 px-2">
                      <span className="inline-block bg-blue-500/10 text-blue-600 text-[10px] px-1.5 py-0.5 rounded">
                        {event.affectSector}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={\`inline-block text-[10px] font-bold px-2 py-0.5 rounded \${
                        event.impactIntensity === "高"
                          ? "bg-red-500/10 text-red-600"
                          : event.impactIntensity === "中"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-muted/30 text-muted-foreground"
                      }\`}>
                        {event.impactIntensity}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 第四部分：【研报风向】===== */}
      <div className="rounded-lg border bg-card/50 p-4">
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-purple-500" />
          【研报风向】今日凌晨至早上最新券商研报
        </h4>
        <div className="space-y-3">
          {morningReports.reports.map((report, i) => (
            <div key={i} className="rounded-lg border p-3 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h5 className="text-xs font-semibold flex-1">{report.title}</h5>
                <span className="text-[10px] bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded shrink-0">
                  {report.industry}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">{report.coreConclusion}</p>
              <div className="flex items-center gap-3 text-[10px]">
                {report.ratingChange && (
                  <span className={\`px-1.5 py-0.5 rounded \${
                    report.ratingChange === "上调" || report.ratingChange === "首次覆盖"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted/30 text-muted-foreground"
                  }\`}>
                    评级：{report.ratingChange}
                  </span>
                )}
                {report.targetAdjustment && (
                  <span className="text-muted-foreground">
                    目标价：{report.targetAdjustment}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-3">
          💡 提示：以上为示例数据，实际使用时将接入实时研报API获取最新报告
        </p>
      </div>

      {/* 早报信息入口 */}
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
    </div>
  );
}
`;

// 5. 找到并替换PreMarketPanel组件
const functionStart = 'function PreMarketPanel() {';
const startIndex = content.indexOf(functionStart);

if (startIndex === -1) {
  console.log('错误：找不到PreMarketPanel组件');
  process.exit(1);
}

console.log('找到PreMarketPanel组件，位置：', startIndex);

// 找到组件的结束位置
let braceCount = 0;
let endIndex = startIndex + functionStart.length;
let inFunction = false;

for (let i = startIndex; i < content.length; i++) {
  if (content[i] === '{') {
    braceCount++;
    inFunction = true;
  } else if (content[i] === '}') {
    braceCount--;
    if (inFunction && braceCount === 0) {
      endIndex = i + 1;
      break;
    }
  }
}

console.log('组件结束位置：', endIndex);

// 替换组件
const newContent = content.substring(0, startIndex) + newPreMarketPanel + content.substring(endIndex);

// 6. 添加接口定义（在类型定义部分）
const interfaces = `
interface USMarketOverview {
  indices: Array<{ name: string; code: string; changePct: number; reason: string }>;
  sectorTop5: Array<{ name: string; changePct: number }>;
  sectorBottom5: Array<{ name: string; changePct: number }>;
  semiIndex: { name: string; changePct: number };
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
`;

// 在USMoverItem接口后添加新接口
const insertPos = newContent.indexOf('interface USMoverItem {');
if (insertPos !== -1) {
  const afterInterface = newContent.indexOf('}', insertPos) + 1;
  const finalContent = newContent.substring(0, afterInterface) + '\n' + interfaces + newContent.substring(afterInterface);
  
  // 写入文件
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log('✅ 成功：WarRoom.tsx已完整更新');
  console.log('');
  console.log('添加的功能：');
  console.log('1. 【美股动向】- 隔夜美股市场分析（三大指数、板块涨跌、费城半导体、科技股、A股映射）');
  console.log('2. 【今日催化】- 24小时内A股重大事件（表格展示，按影响强度排序）');
  console.log('3. 【研报风向】- 最新券商研报（标题、核心结论、评级变化、目标价调整）');
  console.log('');
  console.log('注意：当前使用静态示例数据，后续可接入实时API');
} else {
  console.log('错误：找不到插入位置');
  process.exit(1);
}
