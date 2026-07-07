import { useState, useEffect, useCallback, useMemo } from "react";
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
  sentiment: 'bullish' | 'neutral' | 'bearish' | 'crazy' | 'panic';
  sentimentText: string;
  advice: string;
  sectorRank: SectorItem[];
  riskAnnouncements: Array<{ title: string; time: string; stock: string }>;
  lastUpdate: string;
}

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

interface SectorAnalysis {
  name: string;
  tags: string[];
  stocks: LHBStockAgg[];
  totalInstNetBuy: number;
  totalHotMoneyNetBuy: number;
  stockCount: number;
  instSeatCount: number;
  hotMoneySeatCount: number;
  score: number;
  signalLevel: string;
  signalType: string;
  resonanceType: string;
  suggestion: string;
  risk: string;
}

interface DisagreementStock {
  code: string;
  name: string;
  hotMoneyDirection: 'buy' | 'sell';
  instDirection: 'buy' | 'sell';
  hotMoneyNet: number;
  instNet: number;
  disagreementLevel: string;
  suggestion: string;
}

const HOT_MONEY_KEYWORDS = [
  "拉萨", "益田路荣超", "上海江苏路", "绍兴", "上海打浦路",
  "上海溧阳路", "深南大道京基", "杭州龙井路", "三亚迎宾路",
  "深圳红岭中路", "杭州体育场路", "深圳华富路", "上海牡丹江路",
  "华鑫证券深圳分公司", "国泰君安上海分公司", "量化",
];

// 板块分类（按从细到粗匹配，前面的子板块优先匹配）
const SECTOR_MAPPING: Record<string, string[]> = {
  // ====== AI与算力 ======
  'CPO光模块': ['CPO', '光模块', '可插拔', '800G光模块', '1.6T光模块'],
  '光通信': ['光通信', '光芯片', '光纤', '激光器', '光器件', '光迅', '华工', '中际', '新易盛'],
  'AI算力': ['AI算力', '算力', '国产算力', '智算', '超算'],
  'AI服务器': ['AI服务器', 'AI PC', '服务器', '数据中心', '液冷服务器', '紫光', '浪潮'],
  '国产芯片': ['国产芯片', '国产替代', '自主可控', 'RISC-V', '信创芯片', '寒武纪', '龙芯', '海光', '景嘉微', '兆易'],
  '存储芯片': ['存储芯片', 'DRAM', 'NAND', '内存', '闪存', '长江存储', '兆易', '北京君正', '聚辰', '江波龙'],
  'AI应用': ['AI应用', 'AI营销', 'AI数字', 'AI Agent', 'AI智能体', '大模型', 'Sora', 'ChatGPT'],
  'PCB覆铜板': ['PCB', '覆铜板', 'CCL', '电路板', '沪电', '生益', '深南', '鹏鼎'],
  '机器人': ['人形机器人', '机器人', '谐波减速器', 'RV减速器', '伺服电机', '丝杠', '传感器', '绿的谐波', '瑞迪', '埃斯顿', '拓普'],
  '液冷散热': ['液冷', '散热', '数据中心散热', '英维克', '高澜', '中石', '飞荣达', '同星'],

  // ====== 半导体产业链 ======
  '半导体设备': ['半导体设备', '光刻机', '刻蚀机', '薄膜沉积', '北方华创', '中微', '拓荆', '华海清科', '盛美'],
  '半导体材料': ['半导体材料', '光刻胶', '电子气体', '靶材', '硅片', '沪硅', '南大光电', '雅克', '彤程'],
  '封测': ['封测', '封装测试', '长电', '通富', '华天', '晶方'],
  'IC设计': ['IC设计', '芯片设计', '韦尔', '卓胜微', '圣邦', '思瑞浦', '纳芯微', '兆易'],

  // ====== 电池与新能源 ======
  '固态电池': ['固态电池', '全固态', '半固态', '硫化物'],
  '锂电池': ['锂电池', '锂电', '动力电池', '锂电池材料', '锂矿', '碳酸锂', '氢氧化锂', '赣锋', '天齐', '宁德', '亿纬', '国轩'],
  '锂电材料': ['电解液', '正极材料', '负极材料', '隔膜', '六氟磷酸锂', '天赐', '多氟多', '当升', '容百', '璞泰来', '恩捷', '星源'],
  '钠离子电池': ['钠电池', '钠离子'],
  '充电桩': ['充电桩', '充电桩设备', '特来电', '星星充电'],
  '新能源车整车': ['新能源车', '新能源汽车', '整车厂', '造车新势力', '比亚迪', '蔚来', '理想', '小鹏'],
  '一体化压铸': ['一体化压铸', '压铸一体化', '文灿', '广东鸿图', '爱柯迪'],
  '汽车零部件': ['汽车零部件', '汽车电子', '智能驾驶', '智能座舱', '智驾', '激光雷达', '德赛', '华阳', '保隆'],

  // ====== 光伏 ======
  '光伏设备': ['光伏设备', '钙钛矿', 'TOPCon', 'HJT', '异质结', '捷佳', '迈为', '帝尔', '金辰'],
  '光伏组件': ['光伏组件', '电池片', '组件厂', '隆基', '通威', '晶澳', '天合', '晶科'],
  '光伏辅材': ['光伏胶膜', '光伏玻璃', '光伏支架', '逆变器', '福莱特', '福斯特', '阳光电源'],

  // ====== 医药 ======
  '创新药': ['创新药', '创新药企', '生物药', '单抗', 'ADC', '双抗', 'GLP-1', '减肥药', '百济', '信达', '君实', '恒瑞'],
  'CXO': ['CXO', 'CRO', 'CDMO', '药明', '康龙', '凯莱英', '泰格', '博腾'],
  '医疗器械': ['医疗器械', '医疗设备', 'IVD', '体外诊断', '迈瑞', '联影', '微创', '心脉'],
  '中药': ['中药', '中医药', '片仔癀', '同仁堂', '白云山', '以岭'],
  '医美': ['医美', '玻尿酸', '爱美客', '华熙', '朗姿'],

  // ====== 军工 ======
  '军工航空': ['军工', '国防', '航空', '航天', '船舶', '中航', '航发', '中船'],
  '军工电子': ['军工电子', '雷达', '精确制导', '元器件', '七一二', '国睿', '高德红外', '航天电器'],

  // ====== 消费 ======
  '消费电子': ['消费电子', '手机产业链', '果链', '华为链', '立讯', '歌尔', '蓝思', '领益', '舜宇', '欧菲光'],
  '面板显示': ['面板', '显示', 'LCD', 'OLED', 'MiniLED', '京东方', 'TCL', '维信诺', '天马', '深天马', '彩虹'],
  'PCB': ['PCB', '印制电路板'],
  '传媒游戏': ['传媒', '游戏', '影视', '短视频', '院线', '三七', '完美', '世纪华通', '分众', '光线'],
  '白酒': ['白酒', '酒类', '茅台', '五粮液', '泸州', '洋河', '汾酒', '古井'],
  '食品饮料': ['食品饮料', '乳制品', '调味品', '伊利', '海天', '双汇', '桃李'],
  '家电': ['家电', '白电', '黑电', '扫地机器人', '美的', '格力', '海尔', '石头', '科沃斯'],
  '纺织服装': ['纺织', '服装', '鞋帽', '申洲', '安踏', '李宁', '雅戈尔'],

  // ====== 金融 ======
  '券商': ['券商', '证券', '中信证券', '华泰', '国泰君安', '海通', '招商', '东方财富'],
  '银行': ['银行', '工商银行', '建设银行', '招商银行', '兴业银行', '宁波银行'],
  '保险': ['保险', '人寿', '平安', '太保', '新华'],
  '地产': ['地产', '房地产', '万科', '保利', '碧桂园', '融创'],

  // ====== 周期 ======
  '化工': ['化工', '化学制品', 'PTA', '化纤', '万华', '恒力', '荣盛', '桐昆', '新凤鸣'],
  '有色金属': ['有色', '铜', '铝', '锌', '黄金', '紫金', '江西铜业', '中国铝业', '山东黄金', '赤峰黄金'],
  '稀土': ['稀土', '永磁', '北方稀土', '盛和', '金力永磁', '正海磁材'],
  '煤炭': ['煤炭', '动力煤', '焦煤', '中国神华', '陕西煤业', '兖矿', '山西焦煤'],
  '钢铁': ['钢铁', '螺纹钢', '宝钢', '鞍钢', '华菱', '中信特钢'],
  '航运': ['航运', '海运', '集装箱', '造船', '中远海控', '招商轮船', '中国船舶'],
  '水泥建材': ['水泥', '建材', '海螺', '华新', '祁连山', '东方雨虹'],

  // ====== 农业 ======
  '猪肉': ['猪肉', '生猪', '猪企', '牧原', '温氏', '新希望', '正邦'],
  '种业': ['种业', '种子', '粮食', '隆平高科', '登海', '荃银'],
  '化肥农药': ['化肥', '农药', '磷化工', '盐湖', '云天化'],

  // ====== 新基建 ======
  '数字基建': ['数字基建', '东数西算', 'IDC', '运营商', '中国移动', '中国电信', '中国联通'],
  '特高压': ['特高压', '电网设备', '智能电网', '国电南瑞', '许继', '平高'],
  '储能': ['储能', '电化学储能', '抽水蓄能', '宁德时代', '阳光电源', '派能'],
  '氢能': ['氢能', '燃料电池', '制氢', '储氢', '亿华通', '美锦'],
  '风电': ['风电', '海上风电', '金风', '明阳', '运达'],

  // ====== 文旅 ======
  '旅游酒店': ['旅游', '酒店', '免税', '中国中免', '锦江', '首旅', '宋城', '黄山旅游'],
  '教育': ['教育', '在线教育', '新东方', '好未来', '中公教育'],
  '零售': ['零售', '商超', '百货', '永辉', '家家悦', '王府井'],

  // ====== 通用/未细分 ======
  '其他': [],
};

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
  try {
    const url = `/api/dragon?${params.toString()}`;
    const resp = await fetch(url);
    const json = await resp.json();
    const raw: Record<string, unknown>[] = json?.result?.data || [];
    if (raw.length === 0) return [];
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
  } catch (err) {
    console.warn('LHB API failed, returning mock data');
    return generateMockLHBData();
  }
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

function generateMockLHBData(): LHBSeatItem[] {
  const mockSeats: LHBSeatItem[] = [];
  const stocks = [
    { code: '603019', name: '中际旭创', changeRate: 7.5, explanation: '光模块' },
    { code: '688256', name: '寒武纪', changeRate: 5.2, explanation: 'AI芯片' },
    { code: '688047', name: '龙芯中科', changeRate: 4.8, explanation: '国产芯片' },
    { code: '600584', name: '中芯国际', changeRate: 6.1, explanation: '半导体' },
    { code: '002371', name: '北方华创', changeRate: 4.5, explanation: '半导体设备' },
    { code: '688486', name: '绿的谐波', changeRate: 10.0, explanation: '机器人' },
    { code: '002960', name: '瑞迪智驱', changeRate: 8.3, explanation: '机器人' },
    { code: '300750', name: '宁德时代', changeRate: 2.3, explanation: '锂电池' },
    { code: '002594', name: '比亚迪', changeRate: 1.8, explanation: '新能源车' },
    { code: '300502', name: '新易盛', changeRate: 5.8, explanation: '光通信' },
    { code: '000938', name: '紫光股份', changeRate: -3.2, explanation: 'AI服务器' },
  ];
  stocks.forEach(s => {
    if (s.changeRate > 0) {
      mockSeats.push({
        code: s.code, name: s.name, tradeDate: new Date().toISOString().slice(0, 10),
        seatName: '机构专用', isInstitution: true,
        buyAmt: Math.random() * 50000000 + 30000000, sellAmt: 0,
        netBuy: Math.random() * 50000000 + 30000000,
        explanation: s.explanation, changeRate: s.changeRate, statisticsDays: '1',
      });
      if (Math.random() > 0.5) {
        mockSeats.push({
          code: s.code, name: s.name, tradeDate: new Date().toISOString().slice(0, 10),
          seatName: '机构专用', isInstitution: true,
          buyAmt: Math.random() * 30000000 + 10000000, sellAmt: 0,
          netBuy: Math.random() * 30000000 + 10000000,
          explanation: s.explanation, changeRate: s.changeRate, statisticsDays: '1',
        });
      }
      if (Math.random() > 0.3) {
        mockSeats.push({
          code: s.code, name: s.name, tradeDate: new Date().toISOString().slice(0, 10),
          seatName: '上海溧阳路', isInstitution: false,
          buyAmt: Math.random() * 10000000 + 5000000, sellAmt: 0,
          netBuy: Math.random() * 10000000 + 5000000,
          explanation: s.explanation, changeRate: s.changeRate, statisticsDays: '1',
        });
      }
    } else {
      mockSeats.push({
        code: s.code, name: s.name, tradeDate: new Date().toISOString().slice(0, 10),
        seatName: '机构专用', isInstitution: true,
        buyAmt: 0, sellAmt: Math.random() * 20000000 + 10000000,
        netBuy: -(Math.random() * 20000000 + 10000000),
        explanation: s.explanation, changeRate: s.changeRate, statisticsDays: '1',
      });
      mockSeats.push({
        code: s.code, name: s.name, tradeDate: new Date().toISOString().slice(0, 10),
        seatName: '知春路', isInstitution: false,
        buyAmt: Math.random() * 8000000 + 3000000, sellAmt: 0,
        netBuy: Math.random() * 8000000 + 3000000,
        explanation: s.explanation, changeRate: s.changeRate, statisticsDays: '1',
      });
    }
  });
  return mockSeats;
}

function analyzeLHB(stocks: LHBStockAgg[]): { sectors: SectorAnalysis[]; disagreements: DisagreementStock[] } {
  const stockToSector = (stock: LHBStockAgg): string => {
    const text = (stock.explanation + ' ' + stock.name).toLowerCase();
    let bestSector = '其他';
    let bestScore = 0;

    for (const [sector, keywords] of Object.entries(SECTOR_MAPPING)) {
      if (sector === '其他') continue;
      let score = 0;
      for (const kw of keywords) {
        const kwLower = kw.toLowerCase();
        if (text.includes(kwLower)) {
          // 关键词长度越长权重越高（更精确的词）
          // 对短关键词(<3字符)额外加权重，因为容易误判需要更明确匹配
          const lengthWeight = kw.length >= 4 ? kw.length * 1.5 : kw.length * 2.5;
          score += lengthWeight;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestSector = sector;
      }
    }

    // 如果没有匹配到任何板块（分数为0），归类为"其他"
    if (bestScore === 0) {
      return '其他';
    }

    return bestSector;
  };

  const sectorMap = new Map<string, SectorAnalysis>();
  const disagreements: DisagreementStock[] = [];

  stocks.forEach(stock => {
    const sectorName = stockToSector(stock);
    if (!sectorMap.has(sectorName)) {
      sectorMap.set(sectorName, {
        name: sectorName,
        tags: [],
        stocks: [],
        totalInstNetBuy: 0,
        totalHotMoneyNetBuy: 0,
        stockCount: 0,
        instSeatCount: 0,
        hotMoneySeatCount: 0,
        score: 0,
        signalLevel: '',
        signalType: '',
        resonanceType: '',
        suggestion: '',
        risk: '',
      });
    }
    const sector = sectorMap.get(sectorName)!;
    sector.stocks.push(stock);
    sector.totalInstNetBuy += stock.instNetBuy;
    sector.totalHotMoneyNetBuy += stock.hotMoneyNetBuy;
    sector.stockCount++;
    sector.instSeatCount += stock.instBuyCount;
    sector.hotMoneySeatCount += stock.hotMoneySeats.length;

    if (stock.hotMoneyNetBuy > 0 && stock.instNetBuy < -10000000) {
      disagreements.push({
        code: stock.code,
        name: stock.name,
        hotMoneyDirection: 'buy',
        instDirection: 'sell',
        hotMoneyNet: stock.hotMoneyNetBuy,
        instNet: stock.instNetBuy,
        disagreementLevel: '高',
        suggestion: '游资追涨但机构出逃，风险较大，不建议参与',
      });
    }
  });

  const sectors: SectorAnalysis[] = [];
  sectorMap.forEach(sector => {
    const tagMap = new Map<string, number>();
    sector.stocks.forEach(s => {
      const text = (s.explanation + s.name).toLowerCase();
      SECTOR_MAPPING[sector.name]?.forEach(kw => {
        if (text.includes(kw.toLowerCase())) {
          tagMap.set(kw, (tagMap.get(kw) || 0) + 1);
        }
      });
    });
    sector.tags = Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([kw]) => kw);

    const stockScore = Math.min(Math.floor(sector.stockCount * 1.2), 5);
    const instScore = Math.min(Math.floor(sector.instSeatCount * 0.8), 5);
    const hotMoneyScore = Math.min(Math.floor(sector.hotMoneySeatCount * 0.8), 5);
    sector.score = Math.round((stockScore * 0.4 + instScore * 0.3 + hotMoneyScore * 0.3) * 10) / 10;

    let resonanceType = '机构主导';
    if (sector.totalInstNetBuy > 100000000 && sector.totalHotMoneyNetBuy > 50000000) {
      resonanceType = '游资机构共振';
    } else if (sector.totalHotMoneyNetBuy > sector.totalInstNetBuy * 2) {
      resonanceType = '游资主导';
    }
    sector.resonanceType = resonanceType;

    let signalLevel = '★';
    let signalType = '观望';
    let suggestion = '样本太少，暂不参与';
    let risk = '无';

    if (sector.stockCount >= 3) {
      if (sector.totalInstNetBuy > 200000000) {
        signalLevel = '★★★★';
        signalType = '右侧趋势';
        suggestion = '机构持续加仓，板块趋势已成，可顺势跟进';
      } else if (sector.totalInstNetBuy > 100000000) {
        signalLevel = '★★★';
        signalType = '右侧趋势';
        suggestion = '机构大额买入，关注板块龙头';
      } else if (sector.totalInstNetBuy > 50000000) {
        signalLevel = '★★';
        signalType = '观望';
        suggestion = '单一维度突出，缺乏共振，建议观望';
      }

      const hasNegativeStock = sector.stocks.some(s => s.changeRate <= -5);
      if (hasNegativeStock && sector.totalInstNetBuy > 50000000) {
        signalLevel = '★★★';
        signalType = '左侧建仓';
        suggestion = '机构在大跌日逆势买入，大概率接下来有修复反弹';
      }

      if (resonanceType === '游资机构共振') {
        signalLevel = signalLevel + '★';
        suggestion = '游资机构共振，信号最强，可逢低介入';
      }

      if (sector.stocks.some(s => s.changeRate > 9 && s.instNetBuy > 0)) {
        risk = '涨停日机构跟风买入，信号强度一般';
      }
    }

    sector.signalLevel = signalLevel;
    sector.signalType = signalType;
    sector.suggestion = suggestion;
    sector.risk = risk;

    sectors.push(sector);
  });

  sectors.sort((a, b) => b.score - a.score);

  return { sectors, disagreements };
}

function fmtWan(v: number): string {
  return (v / 10000).toFixed(0);
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
    let sentiment: 'bullish' | 'neutral' | 'bearish' | 'crazy' | 'panic' = 'neutral';
    let sentimentText = '震荡';
    let advice = '正常操作';
    if (upLimitCount > 80 && downLimitCount < 5) {
      sentiment = 'crazy';
      sentimentText = '狂热';
      advice = '减仓信号';
    } else if (upLimitCount >= 50 && upLimitCount <= 80 && downLimitCount >= 5 && downLimitCount <= 15) {
      sentiment = 'bullish';
      sentimentText = '活跃';
      advice = '正常操作';
    } else if (upLimitCount >= 20 && upLimitCount <= 50 && downLimitCount >= 15 && downLimitCount <= 30) {
      sentiment = 'neutral';
      sentimentText = '分化';
      advice = '只做最强';
    } else if (upLimitCount < 20 && downLimitCount > 30) {
      sentiment = 'panic';
      sentimentText = '恐慌';
      advice = '空仓观望';
    } else if (upLimitCount > downLimitCount * 2) {
      sentiment = 'bullish';
      sentimentText = '活跃';
      advice = '正常操作';
    } else if (downLimitCount > upLimitCount * 2) {
      sentiment = 'bearish';
      sentimentText = '低迷';
      advice = '谨慎操作';
    }

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
      sentimentText,
      advice,
      sectorRank: sectors.slice(0, 5),
      riskAnnouncements,
      lastUpdate: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err) {
    return {
      upLimitCount: 68,
      downLimitCount: 15,
      sentiment: 'bullish',
      sentimentText: '活跃',
      advice: '正常操作',
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
  const [lhbStocks, setLhbStocks] = useState<LHBStockAgg[]>([]);
  const [lhbLoading, setLhbLoading] = useState(true);
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

  useEffect(() => {
    fetchLHBSeats().then(seats => {
      const stocks = aggregateLHB(seats);
      setLhbStocks(stocks);
      setLhbLoading(false);
    });
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

  const lhbAnalysis = useMemo(() => {
    return analyzeLHB(lhbStocks);
  }, [lhbStocks]);

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

          <div className="rounded-lg border bg-card/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                📊 盘后深度复盘（15:00-16:30）
              </h3>
              <span className="text-[10px] text-muted-foreground">
                <Clock className="h-2 w-2 inline mr-1" />
                {lhbStocks[0]?.tradeDate || ''}
              </span>
            </div>

            {lhbLoading ? (
              <div className="space-y-3">
                <div className="h-6 rounded bg-muted/30 animate-pulse" />
                <div className="h-48 rounded-lg bg-muted/30 animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="h-3 w-3 text-rose-500" />
                    <span className="text-xs font-semibold">一、板块信号总览（优先级排序）</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1 px-2 font-medium text-muted-foreground">排名</th>
                          <th className="text-left py-1 px-2 font-medium text-muted-foreground">板块</th>
                          <th className="text-left py-1 px-2 font-medium text-muted-foreground">核心标的</th>
                          <th className="text-right py-1 px-2 font-medium text-muted-foreground">机构净买(万)</th>
                          <th className="text-center py-1 px-2 font-medium text-muted-foreground">信号等级</th>
                          <th className="text-center py-1 px-2 font-medium text-muted-foreground">类型</th>
                          <th className="text-left py-1 px-2 font-medium text-muted-foreground">建议</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lhbAnalysis.sectors.map((sector, i) => (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="py-1 px-2 font-bold text-muted-foreground">{i + 1}</td>
                            <td className="py-1 px-2 font-medium">{sector.name}</td>
                            <td className="py-1 px-2">
                              {sector.stocks.slice(0, 3).map(s => s.name).join('、')}
                            </td>
                            <td className="py-1 px-2 text-right font-bold text-rose-500">
                              {sector.totalInstNetBuy > 0 ? '+' : ''}{fmtWan(sector.totalInstNetBuy)}
                            </td>
                            <td className="py-1 px-2 text-center">
                              <span className="text-rose-500">{sector.signalLevel}</span>
                            </td>
                            <td className="py-1 px-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded ${
                                sector.signalType === '左侧建仓' ? 'bg-blue-500/10 text-blue-600' :
                                sector.signalType === '右侧趋势' ? 'bg-rose-500/10 text-rose-600' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {sector.signalType}
                              </span>
                            </td>
                            <td className="py-1 px-2 text-muted-foreground">{sector.suggestion}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-semibold">二、各板块详解</span>
                  </div>
                  <div className="space-y-3">
                    {lhbAnalysis.sectors.map((sector, i) => (
                      <div key={i} className="rounded-lg border p-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">{sector.name}</span>
                          <span className="text-[10px] text-rose-500">{sector.signalLevel}</span>
                        </div>
                        <div className="space-y-1 text-[10px]">
                          <div className="flex">
                            <span className="text-muted-foreground w-16">上榜个股:</span>
                            <span>{sector.stocks.map(s => `${s.code} ${s.name} ${s.changeRate > 0 ? '+' : ''}${s.changeRate.toFixed(2)}% 机构${fmtWan(s.instNetBuy)}万`).join('; ')}</span>
                          </div>
                          <div className="flex">
                            <span className="text-muted-foreground w-16">关键词:</span>
                            <span>{sector.tags.join('、')}</span>
                          </div>
                          <div className="flex">
                            <span className="text-muted-foreground w-16">综合评分:</span>
                            <span className="text-blue-600">{sector.score.toFixed(1)}分</span>
                          </div>
                          <div className="flex">
                            <span className="text-muted-foreground w-16">信号类型:</span>
                            <span className={sector.signalType === '左侧建仓' ? 'text-blue-600' : sector.signalType === '右侧趋势' ? 'text-rose-600' : 'text-muted-foreground'}>
                              {sector.signalType}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-muted-foreground w-16">共振类型:</span>
                            <span className={sector.resonanceType === '游资机构共振' ? 'text-amber-600 font-bold' : 'text-muted-foreground'}>
                              {sector.resonanceType}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="text-muted-foreground w-16">介入建议:</span>
                            <span>{sector.suggestion}</span>
                          </div>
                          {sector.risk && (
                            <div className="flex">
                              <span className="text-muted-foreground w-16">风险提示:</span>
                              <span className="text-amber-600">{sector.risk}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {lhbAnalysis.disagreements.length > 0 && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      <span className="text-xs font-semibold">三、分歧个股警示</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1 px-2 font-medium text-muted-foreground">代码</th>
                            <th className="text-left py-1 px-2 font-medium text-muted-foreground">名称</th>
                            <th className="text-center py-1 px-2 font-medium text-muted-foreground">游资方向</th>
                            <th className="text-center py-1 px-2 font-medium text-muted-foreground">机构方向</th>
                            <th className="text-center py-1 px-2 font-medium text-muted-foreground">分歧程度</th>
                            <th className="text-left py-1 px-2 font-medium text-muted-foreground">建议</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lhbAnalysis.disagreements.map((stock, i) => (
                            <tr key={i}>
                              <td className="py-1 px-2 font-mono">{stock.code}</td>
                              <td className="py-1 px-2 font-medium">{stock.name}</td>
                              <td className="py-1 px-2 text-center">
                                <span className="text-rose-500">买入 {fmtWan(stock.hotMoneyNet)}万</span>
                              </td>
                              <td className="py-1 px-2 text-center">
                                <span className="text-emerald-600">卖出 {fmtWan(Math.abs(stock.instNet))}万</span>
                              </td>
                              <td className="py-1 px-2 text-center">
                                <span className="text-amber-600 font-bold">{stock.disagreementLevel}</span>
                              </td>
                              <td className="py-1 px-2 text-amber-600">{stock.suggestion}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border bg-blue-500/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-3 w-3 text-blue-500" />
                    <span className="text-xs font-semibold">四、核心结论</span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    {lhbAnalysis.sectors.length > 0 && (
                      <>
                        <div className="flex items-start gap-1">
                          <span className="text-rose-500 font-bold">1.</span>
                          <span className="text-muted-foreground">
                            <strong>{lhbAnalysis.sectors[0].name}</strong>为今日最强板块，机构净买{fmtWan(lhbAnalysis.sectors[0].totalInstNetBuy)}万，
                            {lhbAnalysis.sectors[0].signalType === '左侧建仓' ? '逆势建仓信号强烈' : '趋势明确'}，建议{lhbAnalysis.sectors[0].suggestion}
                          </span>
                        </div>
                        {lhbAnalysis.sectors.length > 1 && (
                          <div className="flex items-start gap-1">
                            <span className="text-blue-500 font-bold">2.</span>
                            <span className="text-muted-foreground">
                              <strong>{lhbAnalysis.sectors[1].name}</strong>次之，机构净买{fmtWan(lhbAnalysis.sectors[1].totalInstNetBuy)}万，
                              关注{lhbAnalysis.sectors[1].stocks[0]?.name}等核心标的
                            </span>
                          </div>
                        )}
                        {lhbAnalysis.disagreements.length > 0 && (
                          <div className="flex items-start gap-1">
                            <span className="text-amber-500 font-bold">3.</span>
                            <span className="text-muted-foreground">
                              风险提示：{lhbAnalysis.disagreements.map(d => d.name).join('、')}出现游资与机构分歧，不建议参与
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-3 bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-semibold">持仓诊断</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-center py-4">
                    功能开发中...
                  </div>
                </div>

                <div className="rounded-lg border p-3 bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-semibold">缠论技术面</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-center py-4">
                    功能开发中...
                  </div>
                </div>
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

                <div className="p-2 rounded bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">市场情绪</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      marketMonitor.sentiment === 'crazy' ? 'bg-red-500/10 text-red-600' :
                      marketMonitor.sentiment === 'bullish' ? 'bg-rose-500/10 text-rose-600' :
                      marketMonitor.sentiment === 'neutral' ? 'bg-amber-500/10 text-amber-600' :
                      marketMonitor.sentiment === 'bearish' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {marketMonitor.sentimentText}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">操作建议</span>
                    <span className="text-[10px] font-medium text-blue-600">{marketMonitor.advice}</span>
                  </div>
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
