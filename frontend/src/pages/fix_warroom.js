const fs = require('fs');
const filePath = 'WarRoom.tsx';

// 读取文件内容
let content = fs.readFileSync(filePath, 'utf8');

// 新的PreMarketPanel组件完整实现
const newPreMarketPanel = `function PreMarketPanel() {
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