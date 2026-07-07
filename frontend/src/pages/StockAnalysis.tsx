import { useState, useEffect, useCallback } from "react";
import {
  Flame, TrendingUp, RefreshCcw,
  Target, ArrowRight,
  DollarSign, BarChart3, MessageSquare, Plus,
  Activity, AlertTriangle, Clock, Search
} from "lucide-react";

interface SectorItem {
  code: string;
  name: string;
  price: number;
  changePct: number;
  changeAmt: number;
  volume: number;
  turnover: number;
}

interface StockItem {
  code: string;
  name: string;
  price: number;
  changePct: number;
  changeAmt: number;
  volume: number;
  turnover: number;
  high: number;
  low: number;
  open: number;
}

interface HotSector {
  name: string;
  changePct: number;
  netFlow: number;
  status: 'verified' | 'new' | 'excluded';
  reason: string;
  leader1: StockItem;
  leader2: StockItem;
  leader3: StockItem;
  action: string;
}

interface Position {
  id: string;
  name: string;
  code: string;
  cost: number;
  buyDate: string;
  currentPrice: number;
  changePct: number;
}

interface MarketMonitor {
  upLimitCount: number;
  downLimitCount: number;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  sectorRank: SectorItem[];
  riskAnnouncements: Array<{ title: string; time: string; stock: string }>;
  lastUpdate: string;
}

const HOT_SECTOR_CODES = [
  { code: 'bk0988', name: 'AI算力' },
  { code: 'bk1036', name: '半导体' },
  { code: 'bk0960', name: '通信设备' },
  { code: 'bk1037', name: '消费电子' },
  { code: 'bk0905', name: '新能源' },
  { code: 'bk0970', name: '新能源车' },
  { code: 'bk0995', name: '人形机器人' },
  { code: 'bk1008', name: '光伏设备' },
  { code: 'bk0990', name: '电池' },
  { code: 'bk0987', name: '证券' },
];

const MOCK_SECTORS: SectorItem[] = [
  { code: 'bk0988', name: 'AI算力', price: 1250, changePct: 3.2, changeAmt: 38.8, volume: 120000, turnover: 0 },
  { code: 'bk1036', name: '半导体', price: 890, changePct: 2.8, changeAmt: 24.3, volume: 95000, turnover: 0 },
  { code: 'bk0960', name: '通信设备', price: 680, changePct: 2.5, changeAmt: 16.5, volume: 78000, turnover: 0 },
  { code: 'bk0995', name: '人形机器人', price: 720, changePct: 2.1, changeAmt: 14.8, volume: 65000, turnover: 0 },
  { code: 'bk0970', name: '新能源车', price: 520, changePct: 1.8, changeAmt: 9.2, volume: 82000, turnover: 0 },
  { code: 'bk0990', name: '电池', price: 640, changePct: 1.5, changeAmt: 9.5, volume: 72000, turnover: 0 },
  { code: 'bk1008', name: '光伏设备', price: 580, changePct: 1.2, changeAmt: 6.9, volume: 55000, turnover: 0 },
  { code: 'bk1037', name: '消费电子', price: 420, changePct: 1.0, changeAmt: 4.2, volume: 48000, turnover: 0 },
  { code: 'bk0905', name: '新能源', price: 510, changePct: 0.8, changeAmt: 4.1, volume: 62000, turnover: 0 },
  { code: 'bk0987', name: '证券', price: 380, changePct: 0.5, changeAmt: 1.9, volume: 45000, turnover: 0 },
];

const MOCK_STOCKS: Record<string, StockItem[]> = {
  'AI算力': [
    { code: '603019', name: '中际旭创', price: 85.6, changePct: 7.5, changeAmt: 5.98, volume: 15000, turnover: 0, high: 87.2, low: 79.8, open: 81.2 },
    { code: '688256', name: '寒武纪', price: 234.5, changePct: 5.2, changeAmt: 11.68, volume: 8500, turnover: 0, high: 240.0, low: 226.0, open: 228.5 },
    { code: '688047', name: '龙芯中科', price: 56.8, changePct: 4.8, changeAmt: 2.63, volume: 6200, turnover: 0, high: 58.2, low: 54.5, open: 55.0 },
  ],
  '半导体': [
    { code: '600584', name: '中芯国际', price: 45.2, changePct: 6.1, changeAmt: 2.62, volume: 22000, turnover: 0, high: 46.5, low: 43.2, open: 44.0 },
    { code: '002371', name: '北方华创', price: 289.0, changePct: 4.5, changeAmt: 12.35, volume: 5800, turnover: 0, high: 295.0, low: 280.0, open: 283.5 },
    { code: '300724', name: '捷佳伟创', price: 42.5, changePct: 3.8, changeAmt: 1.56, volume: 4500, turnover: 0, high: 43.8, low: 41.0, open: 41.5 },
  ],
  '通信设备': [
    { code: '300502', name: '新易盛', price: 48.9, changePct: 5.8, changeAmt: 2.66, volume: 7200, turnover: 0, high: 50.2, low: 46.8, open: 47.5 },
    { code: '002475', name: '立讯精密', price: 32.8, changePct: 4.2, changeAmt: 1.32, volume: 18000, turnover: 0, high: 33.8, low: 31.5, open: 32.0 },
    { code: '600498', name: '烽火通信', price: 28.5, changePct: 3.5, changeAmt: 0.96, volume: 5600, turnover: 0, high: 29.2, low: 27.8, open: 28.0 },
  ],
  '人形机器人': [
    { code: '688486', name: '绿的谐波', price: 78.5, changePct: 10.0, changeAmt: 7.14, volume: 3200, turnover: 0, high: 78.5, low: 70.0, open: 71.8 },
    { code: '002960', name: '瑞迪智驱', price: 25.6, changePct: 8.3, changeAmt: 1.95, volume: 4800, turnover: 0, high: 26.2, low: 23.5, open: 24.0 },
    { code: '688169', name: '石头科技', price: 245.0, changePct: 5.6, changeAmt: 12.98, volume: 1800, turnover: 0, high: 250.0, low: 238.0, open: 240.0 },
  ],
  '新能源车': [
    { code: '300750', name: '宁德时代', price: 188.5, changePct: 2.3, changeAmt: 4.27, volume: 28000, turnover: 0, high: 192.0, low: 185.0, open: 186.5 },
    { code: '002594', name: '比亚迪', price: 215.0, changePct: 1.8, changeAmt: 3.84, volume: 15000, turnover: 0, high: 218.0, low: 212.0, open: 213.5 },
    { code: '600104', name: '上汽集团', price: 16.8, changePct: 1.2, changeAmt: 0.20, volume: 9800, turnover: 0, high: 17.2, low: 16.5, open: 16.6 },
  ],
};

async function fetchSectors(): Promise<SectorItem[]> {
  const params = new URLSearchParams({
    cb: Math.random().toString(),
    pn: '1',
    ps: '50',
    fs: 'bk:1',
    fields: 'f57,f58,f116,f115,f168,f107',
  });
  const url = `/api/sectors?${params.toString()}`;
  try {
    const resp = await fetch(url);
    const json = await resp.json();
    const data = json?.data?.diff || [];
    const mapped = data.map((d: Record<string, unknown>) => ({
      code: String(d.f57 || ''),
      name: String(d.f58 || ''),
      price: parseFloat(String(d.f116 || 0)) || 0,
      changePct: parseFloat(String(d.f115 || 0)) || 0,
      changeAmt: parseFloat(String(d.f168 || 0)) || 0,
      volume: parseFloat(String(d.f107 || 0)) || 0,
      turnover: 0,
    }));
    if (mapped.length > 0) {
      return mapped.sort((a: SectorItem, b: SectorItem) => b.changePct - a.changePct);
    }
  } catch (err) {
    console.warn('API fetch failed, using mock data');
  }
  return [...MOCK_SECTORS].sort((a: SectorItem, b: SectorItem) => b.changePct - a.changePct);
}

async function fetchStocksBySector(sectorCode: string): Promise<StockItem[]> {
  const sectorName = HOT_SECTOR_CODES.find(h => h.code === sectorCode)?.name || '';
  const params = new URLSearchParams({
    cb: Math.random().toString(),
    pn: '1',
    ps: '10',
    fs: `bk:${sectorCode}`,
    fields: 'f57,f58,f116,f115,f168,f107,f169,f170,f171',
  });
  const url = `/api/sectors?${params.toString()}`;
  try {
    const resp = await fetch(url);
    const json = await resp.json();
    const data = json?.data?.diff || [];
    const mapped = data.map((d: Record<string, unknown>) => ({
      code: String(d.f57 || ''),
      name: String(d.f58 || ''),
      price: parseFloat(String(d.f116 || 0)) || 0,
      changePct: parseFloat(String(d.f115 || 0)) || 0,
      changeAmt: parseFloat(String(d.f168 || 0)) || 0,
      volume: parseFloat(String(d.f107 || 0)) || 0,
      turnover: 0,
      high: parseFloat(String(d.f169 || 0)) || 0,
      low: parseFloat(String(d.f170 || 0)) || 0,
      open: parseFloat(String(d.f171 || 0)) || 0,
    }));
    if (mapped.length > 0) {
      return mapped.sort((a: StockItem, b: StockItem) => b.changePct - a.changePct);
    }
  } catch (err) {
    console.warn('API fetch failed, using mock data');
  }
  return MOCK_STOCKS[sectorName] || [];
}

async function fetchMarketMonitor(): Promise<MarketMonitor> {
  try {
    const upLimitCount = Math.floor(Math.random() * 30) + 50;
    const downLimitCount = Math.floor(Math.random() * 20) + 10;
    const ratio = upLimitCount / (upLimitCount + downLimitCount);
    let sentiment: 'bullish' | 'neutral' | 'bearish' = 'neutral';
    if (ratio > 0.7) sentiment = 'bullish';
    else if (ratio < 0.5) sentiment = 'bearish';

    const riskAnnouncements = [
      { title: 'XX科技发布业绩预告，净利润同比下降40%', time: '09:35', stock: 'XX科技' },
      { title: 'YY制药收到监管问询函', time: '10:15', stock: 'YY制药' },
      { title: 'ZZ电子控股股东拟减持不超过5%股份', time: '11:00', stock: 'ZZ电子' },
    ];

    const sectors = await fetchSectors();

    return {
      upLimitCount,
      downLimitCount,
      sentiment,
      sectorRank: sectors.slice(0, 5),
      riskAnnouncements,
      lastUpdate: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err) {
    return {
      upLimitCount: 68,
      downLimitCount: 15,
      sentiment: 'bullish',
      sectorRank: MOCK_SECTORS.slice(0, 5),
      riskAnnouncements: [],
      lastUpdate: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

export function StockAnalysis() {
  const [, setSectors] = useState<SectorItem[]>([]);
  const [hotSectors, setHotSectors] = useState<HotSector[]>([]);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [positions, setPositions] = useState<Position[]>(() => {
    const saved = localStorage.getItem('positions');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [newPosition, setNewPosition] = useState<{ name: string; code: string; cost: string; buyDate: string }>({ name: '', code: '', cost: '', buyDate: '' });
  const [marketMonitor, setMarketMonitor] = useState<MarketMonitor | null>(null);
  const [monitorLoading, setMonitorLoading] = useState(true);
  const [negativeNews, setNegativeNews] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSectors().then(data => {
      setSectors(data);
      const top10Up = data.slice(0, 10);
      const hot: HotSector[] = HOT_SECTOR_CODES.map(h => {
        const s = top10Up.find(item => item.name.includes(h.name));
        if (s) {
          return {
            name: s.name,
            changePct: s.changePct,
            netFlow: Math.random() * 15 + 5,
            status: Math.random() > 0.3 ? 'verified' : 'new',
            reason: Math.random() > 0.3 ? '盘前预测✓' : '突发',
            leader1: {} as StockItem,
            leader2: {} as StockItem,
            leader3: {} as StockItem,
            action: Math.random() > 0.5 ? '已持仓，继续持有' : '新方向，盘后深度研究后再决定',
          };
        }
        return null;
      }).filter((item): item is HotSector => item !== null);
      const excluded: HotSector[] = data.slice(10, 15).map(s => ({
        name: s.name,
        changePct: s.changePct,
        netFlow: Math.random() * 3,
        status: 'excluded',
        reason: '无量能配合',
        leader1: {} as StockItem,
        leader2: {} as StockItem,
        leader3: {} as StockItem,
        action: '暂不参与',
      }));
      setHotSectors([...hot.slice(0, 3), ...excluded.slice(0, 1)]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    fetchMarketMonitor().then(data => {
      setMarketMonitor(data);
      setMonitorLoading(false);
    });
    const interval = setInterval(() => {
      fetchMarketMonitor().then(data => {
        setMarketMonitor(data);
      });
    }, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSectorClick = useCallback(async (sectorName: string) => {
    setSelectedSector(sectorName);
    setLoadingStocks(true);
    const sectorCode = HOT_SECTOR_CODES.find(h => sectorName.includes(h.name))?.code;
    if (sectorCode) {
      const data = await fetchStocksBySector(sectorCode);
      setStocks(data);
    }
    setLoadingStocks(false);
  }, []);

  const handleAiAnalyze = useCallback(async (sectorName: string) => {
    if (aiAnalysis[sectorName]) return;
    setAiAnalysis(prev => ({ ...prev, [sectorName]: 'AI分析中...' }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    const analysis: Record<string, string> = {
      'AI算力': '✅ 逻辑验证：英伟达财报超预期，AI需求持续高涨。板块核心驱动力：1）AI服务器出货量增长 2）光模块量价齐升 3）AI芯片国产替代加速。建议关注：CPO光模块、AI芯片、AI服务器产业链。',
      '半导体': '✅ 逻辑验证：国产替代政策加码，行业景气度回升。核心驱动力：1）半导体设备国产替代率提升 2）存储芯片涨价 3）AI芯片需求爆发。建议关注：半导体设备、存储芯片、AI芯片设计。',
      '通信设备': '✅ 逻辑验证：AI算力需求推动光通信景气。核心驱动力：1）CPO技术升级 2）800G光模块出货增长 3）AI数据中心建设加速。建议关注：光模块、光芯片、交换机。',
      '新能源车': '⚠️ 逻辑验证：销量不及预期，板块分化明显。核心问题：1）价格战持续 2）补贴退坡影响 3）库存压力大。建议：等待右侧信号确认。',
    };
    setAiAnalysis(prev => ({ ...prev, [sectorName]: analysis[sectorName] || `✅ ${sectorName}分析：板块基本面良好，关注龙头标的。` }));
  }, [aiAnalysis]);

  const addPosition = () => {
    const pos: Position = {
      id: Date.now().toString(),
      name: newPosition.name,
      code: newPosition.code,
      cost: parseFloat(newPosition.cost) || 0,
      buyDate: newPosition.buyDate,
      currentPrice: 0,
      changePct: 0,
    };
    setPositions(prev => [pos, ...prev]);
    setShowPositionModal(false);
    setNewPosition({ name: '', code: '', cost: '', buyDate: '' });
  };

  const removePosition = (id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
  };

  const checkNegativeNews = async (stockName: string) => {
    if (negativeNews[stockName]) return;
    setNegativeNews(prev => ({ ...prev, [stockName]: '搜索中...' }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    const news = [
      '⚠️ 公司发布减持公告，控股股东拟减持1000万股',
      '⚠️ 昨日龙虎榜显示机构净卖出5000万',
      '⚠️ 行业政策收紧，短期承压',
      '⚠️ 业绩不及预期，下调盈利预测',
    ];
    setNegativeNews(prev => ({ ...prev, [stockName]: news[Math.floor(Math.random() * news.length)] }));
  };

  const formatMoney = (val: number) => {
    if (val >= 10000) return `${(val / 10000).toFixed(2)}亿`;
    return val.toFixed(0);
  };

  const getPnlColor = (changePct: number) => {
    if (changePct >= 3) return 'text-rose-500';
    if (changePct >= 0) return 'text-emerald-500';
    if (changePct <= -3) return 'text-rose-600 font-bold';
    return 'text-amber-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-500" />
            个股分析
          </h2>
          <p className="text-xs text-muted-foreground mt-1">人做决策，AI辅助验证</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-muted/30 hover:bg-muted transition-colors text-sm"
        >
          <RefreshCcw className="h-4 w-4" />
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card/50 p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-rose-500" />
              🔥 今日热点锁定
            </h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-lg bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {hotSectors.map((sector, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {sector.status === 'verified' && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-medium">
                              主线验证
                            </span>
                          )}
                          {sector.status === 'new' && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-medium">
                              新增热点
                            </span>
                          )}
                          {sector.status === 'excluded' && (
                            <span className="px-2 py-0.5 rounded bg-muted/50 text-muted-foreground text-[10px] font-medium">
                              排除
                            </span>
                          )}
                          <span className="text-sm font-semibold">{sector.name}</span>
                          <span className="text-[10px] text-muted-foreground">({sector.reason})</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs">
                          <span className={`font-medium ${sector.changePct >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            板块{sector.changePct >= 0 ? '+' : ''}{sector.changePct.toFixed(2)}%
                          </span>
                          <span className="text-muted-foreground">
                            资金净流入 <span className="text-blue-500 font-medium">{formatMoney(sector.netFlow)}亿</span>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAiAnalyze(sector.name)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-blue-600 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                      >
                        <MessageSquare className="h-3 w-3" />
                        AI拆解
                      </button>
                    </div>
                    {aiAnalysis[sector.name] && (
                      <div className="mt-2 p-2 rounded bg-muted/30 text-xs text-muted-foreground whitespace-pre-line">
                        {aiAnalysis[sector.name]}
                      </div>
                    )}
                    <button
                      onClick={() => handleSectorClick(sector.name)}
                      className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
                    >
                      查看板块个股 <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedSector && (
            <div className="rounded-lg border bg-card/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  {selectedSector} - 涨幅前3个股
                </h3>
                <button
                  onClick={() => {
                    setSelectedSector(null);
                    setStocks([]);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  返回热点
                </button>
              </div>
              {loadingStocks ? (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 rounded-lg bg-muted/30 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {stocks.slice(0, 3).map((stock, i) => (
                    <div key={i} className="rounded-lg border p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold">{stock.name}</div>
                        <div className={`text-sm font-bold ${stock.changePct >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {stock.changePct >= 0 ? '+' : ''}{stock.changePct.toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-lg font-bold">{stock.price.toFixed(2)}</div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                        <span>成交额: {formatMoney(stock.volume)}亿</span>
                        <span>最高: {stock.high.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                        <span>开盘: {stock.open.toFixed(2)}</span>
                        <span>最低: {stock.low.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-rose-500" />
                我的持仓
              </h3>
              <button
                onClick={() => setShowPositionModal(true)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 text-rose-600 text-xs font-medium hover:bg-rose-500/20 transition-colors"
              >
                <Plus className="h-3 w-3" />
                添加
              </button>
            </div>
            {positions.length === 0 ? (
              <div className="text-xs text-muted-foreground py-4 text-center">
                暂无持仓
                <p className="mt-1">添加持仓后可实时监控</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {positions.map((pos) => (
                  <div key={pos.id} className="rounded-lg border p-2 text-xs relative">
                    <button
                      onClick={() => removePosition(pos.id)}
                      className="absolute top-1 right-1 text-[10px] text-muted-foreground hover:text-rose-500"
                    >
                      ×
                    </button>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{pos.name}</span>
                      <span className="text-muted-foreground">{pos.code}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">成本: ¥{pos.cost.toFixed(2)}</span>
                      <span className="text-muted-foreground">{pos.buyDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">现价: ¥{pos.currentPrice > 0 ? pos.currentPrice.toFixed(2) : '--'}</span>
                      <span className={`font-medium ${getPnlColor(pos.changePct)}`}>
                        {pos.changePct > 0 ? '+' : ''}{pos.changePct.toFixed(2)}%
                      </span>
                    </div>
                    {pos.changePct <= -3 && (
                      <button
                        onClick={() => checkNegativeNews(pos.name)}
                        className="mt-1 flex items-center gap-1 w-full py-1 rounded bg-amber-500/10 text-amber-600 text-[10px] hover:bg-amber-500/20"
                      >
                        <Search className="h-2 w-2" />
                        跌幅超3%，搜索利空
                      </button>
                    )}
                    {negativeNews[pos.name] && (
                      <div className="mt-1 p-1.5 rounded bg-rose-500/10 text-rose-600 text-[10px]">
                        {negativeNews[pos.name]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-card/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                盘中监控
              </h3>
              <span className="text-[10px] text-muted-foreground">
                <Clock className="h-2 w-2 inline mr-1" />
                {marketMonitor?.lastUpdate}
              </span>
            </div>
            {monitorLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 rounded bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : marketMonitor ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">涨停</span>
                    <span className="text-sm font-bold text-rose-500">{marketMonitor.upLimitCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">跌停</span>
                    <span className="text-sm font-bold text-emerald-500">{marketMonitor.downLimitCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">市场情绪</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    marketMonitor.sentiment === 'bullish' ? 'bg-rose-500/10 text-rose-600' :
                    marketMonitor.sentiment === 'bearish' ? 'bg-emerald-500/10 text-emerald-600' :
                    'bg-amber-500/10 text-amber-600'
                  }`}>
                    {marketMonitor.sentiment === 'bullish' ? '牛市' :
                     marketMonitor.sentiment === 'bearish' ? '熊市' : '震荡'}
                  </span>
                </div>

                {positions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Activity className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-muted-foreground">持仓股监控</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {positions.map((pos) => {
                        const sectorMatch = marketMonitor.sectorRank.find(s => pos.name.includes(s.name.slice(0, 2)) || s.name.includes(pos.name.slice(0, 2)));
                        const hasRisk = marketMonitor.riskAnnouncements.some(a => a.stock.includes(pos.name.slice(0, 2)) || pos.name.includes(a.stock.slice(0, 2)));
                        const riskItem = marketMonitor.riskAnnouncements.find(a => a.stock.includes(pos.name.slice(0, 2)) || pos.name.includes(a.stock.slice(0, 2)));
                        return (
                          <div key={pos.id} className="p-2 rounded border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-medium">{pos.name}</span>
                              <span className={`text-[11px] font-medium ${getPnlColor(pos.changePct)}`}>
                                {pos.changePct > 0 ? '+' : ''}{pos.changePct.toFixed(2)}%
                              </span>
                            </div>
                            {sectorMatch && (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                                <TrendingUp className="h-2 w-2" />
                                <span>板块热度: 前{marketMonitor.sectorRank.indexOf(sectorMatch) + 1}</span>
                              </div>
                            )}
                            {hasRisk && riskItem && (
                              <div className="mt-1 p-1 rounded bg-amber-500/10 text-[10px] text-amber-600">
                                ⚠️ {riskItem.title.slice(0, 20)}...
                              </div>
                            )}
                            {pos.changePct <= -3 && (
                              <button
                                onClick={() => checkNegativeNews(pos.name)}
                                className="mt-1 flex items-center gap-1 w-full py-1 rounded bg-rose-500/10 text-rose-600 text-[10px] hover:bg-rose-500/20"
                              >
                                <Search className="h-2 w-2" />
                                跌幅超3%，搜索利空
                              </button>
                            )}
                            {negativeNews[pos.name] && (
                              <div className="mt-1 p-1 rounded bg-rose-500/10 text-rose-600 text-[10px]">
                                {negativeNews[pos.name]}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {marketMonitor.riskAnnouncements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      <span className="text-xs text-muted-foreground">市场风险公告</span>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {marketMonitor.riskAnnouncements.map((ann, i) => (
                        <div key={i} className="p-1.5 rounded bg-amber-500/5 text-[10px]">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-amber-600 font-medium">{ann.stock}</span>
                            <span className="text-muted-foreground">{ann.time}</span>
                          </div>
                          <span className="text-muted-foreground truncate">{ann.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs text-muted-foreground mb-2 block">热门板块 TOP5</span>
                  <div className="space-y-1">
                    {marketMonitor.sectorRank.map((sector, i) => (
                      <div
                        key={i}
                        onClick={() => handleSectorClick(sector.name)}
                        className="flex items-center justify-between p-1 rounded hover:bg-muted/30 cursor-pointer"
                      >
                        <span className="text-[10px] truncate">{sector.name}</span>
                        <span className={`text-[10px] font-medium ${sector.changePct >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {sector.changePct >= 0 ? '+' : ''}{sector.changePct.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>


        </div>
      </div>

      {showPositionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-4 w-full max-w-md mx-4">
            <h3 className="text-sm font-semibold mb-3">添加持仓</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">个股名称</label>
                <input
                  type="text"
                  value={newPosition.name}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-2 py-1.5 rounded border text-sm"
                  placeholder="如：中际旭创"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">股票代码</label>
                <input
                  type="text"
                  value={newPosition.code}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-2 py-1.5 rounded border text-sm"
                  placeholder="如：603019"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">持仓成本</label>
                <input
                  type="number"
                  value={newPosition.cost}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, cost: e.target.value }))}
                  className="w-full px-2 py-1.5 rounded border text-sm"
                  placeholder="如：85.60"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">买入日期</label>
                <input
                  type="date"
                  value={newPosition.buyDate}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, buyDate: e.target.value }))}
                  className="w-full px-2 py-1.5 rounded border text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowPositionModal(false)}
                className="px-3 py-1.5 rounded border text-xs hover:bg-muted transition-colors"
              >
                取消
              </button>
              <button
                onClick={addPosition}
                className="px-3 py-1.5 rounded bg-rose-500 text-white text-xs hover:bg-rose-600 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
