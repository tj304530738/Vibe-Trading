import { useTranslation } from "react-i18next";
import { Bot, TrendingUp, Globe, Sparkles, Users, UserCircle2, NotebookPen, Landmark } from "lucide-react";

interface Example {
  titleKey: string;
  descKey: string;
  promptKey: string;
}

interface Category {
  labelKey: string;
  icon: React.ReactNode;
  color: string;
  examples: Example[];
}

const CATEGORIES: Category[] = [
  {
<<<<<<< HEAD
    label: "多市场回测",
=======
    labelKey: "welcome.categories.multiMarketBacktest",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-red-400 border-red-500/30 hover:border-red-500/60 hover:bg-red-500/5",
    examples: [
      {
<<<<<<< HEAD
        title: "跨市场组合",
        desc: "A股 + 加密货币 + 美股，风险平价优化器",
        prompt: "Backtest a risk-parity portfolio of 000001.SZ, BTC-USDT, and AAPL for full-year 2024, compare against equal-weight baseline",
      },
      {
        title: "BTC 5分钟 MACD 策略",
        desc: "基于 OKX 实时数据的分钟级加密货币回测",
        prompt: "Backtest BTC-USDT 5-minute MACD strategy, fast=12 slow=26 signal=9, last 30 days",
      },
      {
        title: "美股科技最大分散化",
        desc: "通过 yfinance 对 FAANG+ 进行投资组合优化",
        prompt: "Backtest AAPL, MSFT, GOOGL, AMZN, NVDA with max_diversification portfolio optimizer, full-year 2024",
=======
        titleKey: "welcome.examples.crossMarketPortfolio",
        descKey: "welcome.examples.crossMarketPortfolioDesc",
        promptKey: "welcome.examples.crossMarketPortfolioPrompt",
      },
      {
        titleKey: "welcome.examples.btcMacd",
        descKey: "welcome.examples.btcMacdDesc",
        promptKey: "welcome.examples.btcMacdPrompt",
      },
      {
        titleKey: "welcome.examples.usTechMaxDiv",
        descKey: "welcome.examples.usTechMaxDivDesc",
        promptKey: "welcome.examples.usTechMaxDivPrompt",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
      },
    ],
  },
  {
<<<<<<< HEAD
    label: "研究与分析",
=======
    labelKey: "welcome.categories.researchAnalysis",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
    icon: <Sparkles className="h-4 w-4" />,
    color: "text-amber-400 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/5",
    examples: [
      {
<<<<<<< HEAD
        title: "多因子 Alpha 模型",
        desc: "对 300 只股票进行 IC 加权因子合成",
        prompt: "Build a multi-factor alpha model using momentum, reversal, volatility, and turnover on CSI 300 constituents with IC-weighted factor synthesis, backtest 2023-2024",
      },
      {
        title: "期权希腊字母分析",
        desc: "Black-Scholes 定价，Delta/Gamma/Theta/Vega 分析",
        prompt: "Calculate option Greeks using Black-Scholes: spot=100, strike=105, risk-free rate=3%, vol=25%, expiry=90 days, analyze Delta/Gamma/Theta/Vega",
=======
        titleKey: "welcome.examples.multiFactorAlpha",
        descKey: "welcome.examples.multiFactorAlphaDesc",
        promptKey: "welcome.examples.multiFactorAlphaPrompt",
      },
      {
        titleKey: "welcome.examples.optionsGreeks",
        descKey: "welcome.examples.optionsGreeksDesc",
        promptKey: "welcome.examples.optionsGreeksPrompt",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
      },
    ],
  },
  {
<<<<<<< HEAD
    label: "群体智能团队",
=======
    labelKey: "welcome.categories.swarmTeams",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
    icon: <Users className="h-4 w-4" />,
    color: "text-violet-400 border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/5",
    examples: [
      {
<<<<<<< HEAD
        title: "投资委员会评审",
        desc: "多智能体辩论：多头 vs 空头，风险审查，投资经理决策",
        prompt: "[Swarm Team Mode] Use the investment_committee preset to evaluate whether to go long or short on NVDA given current market conditions",
      },
      {
        title: "量化策略工作台",
        desc: "筛选 → 因子研究 → 回测 → 风险审计流水线",
        prompt: "[Swarm Team Mode] Use the quant_strategy_desk preset to find and backtest the best momentum strategy on CSI 300 constituents",
=======
        titleKey: "welcome.examples.investmentCommittee",
        descKey: "welcome.examples.investmentCommitteeDesc",
        promptKey: "welcome.examples.investmentCommitteePrompt",
      },
      {
        titleKey: "welcome.examples.quantStrategyDesk",
        descKey: "welcome.examples.quantStrategyDeskDesc",
        promptKey: "welcome.examples.quantStrategyDeskPrompt",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
      },
    ],
  },
  {
<<<<<<< HEAD
    label: "文档与网络研究",
=======
    labelKey: "welcome.categories.docWebResearch",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
    icon: <Globe className="h-4 w-4" />,
    color: "text-blue-400 border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/5",
    examples: [
      {
<<<<<<< HEAD
        title: "分析财报 PDF",
        desc: "上传 PDF 并询问财务问题",
        prompt: "Summarize the key financial metrics, risks, and outlook from the uploaded earnings report",
      },
      {
        title: "网络研究：宏观经济展望",
        desc: "阅读最新网络来源进行宏观分析",
        prompt: "Read the latest Fed meeting minutes and summarize the key takeaways for equity and crypto markets",
=======
        titleKey: "welcome.examples.earningsReport",
        descKey: "welcome.examples.earningsReportDesc",
        promptKey: "welcome.examples.earningsReportPrompt",
      },
      {
        titleKey: "welcome.examples.macroResearch",
        descKey: "welcome.examples.macroResearchDesc",
        promptKey: "welcome.examples.macroResearchPrompt",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
      },
    ],
  },
  {
<<<<<<< HEAD
    label: "交易日志",
=======
    labelKey: "welcome.categories.tradeJournal",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
    icon: <NotebookPen className="h-4 w-4" />,
    color: "text-orange-400 border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/5",
    examples: [
      {
<<<<<<< HEAD
        title: "分析券商导出数据",
        desc: "解析同花顺/东财/富途/通用 CSV —— 持仓天数、胜率、盈亏比、小时分布",
        prompt: "Analyze the trade journal I just uploaded — full profile with holding stats, win rate, top symbols, and hourly distribution",
      },
      {
        title: "诊断行为偏差",
        desc: "处置效应、过度交易、追涨动量、锚定效应 —— 严重程度 + 数值证据",
        prompt: "Run the 4 behavior diagnostics on my trade journal (disposition, overtrading, chasing, anchoring) and tell me which bias hurts my PnL most",
=======
        titleKey: "welcome.examples.analyzeBrokerExport",
        descKey: "welcome.examples.analyzeBrokerExportDesc",
        promptKey: "welcome.examples.analyzeBrokerExportPrompt",
      },
      {
        titleKey: "welcome.examples.diagnoseBehavior",
        descKey: "welcome.examples.diagnoseBehaviorDesc",
        promptKey: "welcome.examples.diagnoseBehaviorPrompt",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
      },
    ],
  },
  {
<<<<<<< HEAD
    label: "交易连接器",
=======
    labelKey: "welcome.categories.tradingConnectors",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
    icon: <Landmark className="h-4 w-4" />,
    color: "text-cyan-400 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/5",
    examples: [
      {
<<<<<<< HEAD
        title: "检查已选连接器",
        desc: "列出连接器配置并验证当前选择",
        prompt: "List my trading connector profiles, show which one is selected, then check that selected connector. If it is not ready, tell me exactly what setup step is missing. Do not place or modify orders.",
      },
      {
        title: "分析连接器投资组合",
        desc: "从已选连接器读取账户摘要和持仓",
        prompt: "Use the selected trading connector profile to summarize my account, positions, concentration, cash, and portfolio risk. Do not place or modify orders.",
      },
      {
        title: "报价与趋势",
        desc: "通过已选连接器获取报价和近 30 日日线数据",
        prompt: "Use the selected trading connector to fetch an AAPL quote and 30 daily bars, then summarize the current quote versus the recent trend. Keep it read-only.",
=======
        titleKey: "welcome.examples.checkConnector",
        descKey: "welcome.examples.checkConnectorDesc",
        promptKey: "welcome.examples.checkConnectorPrompt",
      },
      {
        titleKey: "welcome.examples.analyzePortfolio",
        descKey: "welcome.examples.analyzePortfolioDesc",
        promptKey: "welcome.examples.analyzePortfolioPrompt",
      },
      {
        titleKey: "welcome.examples.quoteTrend",
        descKey: "welcome.examples.quoteTrendDesc",
        promptKey: "welcome.examples.quoteTrendPrompt",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
      },
    ],
  },
  {
<<<<<<< HEAD
    label: "影子账户",
=======
    labelKey: "welcome.categories.shadowAccount",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
    icon: <UserCircle2 className="h-4 w-4" />,
    color: "text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5",
    examples: [
      {
<<<<<<< HEAD
        title: "从日志训练影子账户",
        desc: "从券商 CSV 提取策略规则并持久化影子账户配置",
        prompt: "Train my shadow account from the trading journal I just uploaded — show the extracted rules and confirm they look like my behavior",
      },
      {
        title: "我少赚了多少？",
        desc: "回测影子策略并与实际盈亏进行归因分析",
        prompt: "Run a shadow backtest for the last 90 days on the US market and break down where my PnL diverged from the shadow (rule violations, early exits, missed signals)",
      },
      {
        title: "生成影子报告",
        desc: "8 章节 HTML/PDF —— 净值曲线、按市场夏普比率、归因瀑布图",
        prompt: "Render the shadow report and give me the URL — lead with the you-vs-shadow delta",
=======
        titleKey: "welcome.examples.trainShadow",
        descKey: "welcome.examples.trainShadowDesc",
        promptKey: "welcome.examples.trainShadowPrompt",
      },
      {
        titleKey: "welcome.examples.shadowDelta",
        descKey: "welcome.examples.shadowDeltaDesc",
        promptKey: "welcome.examples.shadowDeltaPrompt",
      },
      {
        titleKey: "welcome.examples.shadowReport",
        descKey: "welcome.examples.shadowReportDesc",
        promptKey: "welcome.examples.shadowReportPrompt",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
      },
    ],
  },
];

<<<<<<< HEAD
const CAPABILITY_CHIPS = [
  "金融技能库",
  "群体智能团队",
  "自动发现工具",
  "3 大市场：A股 · 加密货币 · 港美股",
  "交易连接器配置",
  "分钟级到日线级时间框架",
  "4 种投资组合优化器",
  "15+ 风险指标",
  "期权与衍生品",
  "PDF 与网络研究",
  "因子分析与机器学习",
  "交易日志分析器",
  "影子账户回测",
  "持久化记忆",
  "会话搜索",
=======
const CAPABILITY_CHIP_KEYS = [
  "financeSkills",
  "swarmTeams",
  "autoTools",
  "markets",
  "connectors",
  "timeframes",
  "optimizers",
  "riskMetrics",
  "options",
  "pdfWeb",
  "factorML",
  "journalAnalyzer",
  "shadowBacktest",
  "memory",
  "sessionSearch",
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
];

interface Props {
  onExample: (s: string) => void;
}

export function WelcomeScreen({ onExample }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center">
      {/* Header */}
      <div className="space-y-3">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/80 to-info/80 flex items-center justify-center shadow-lg">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('welcome.title')}</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
<<<<<<< HEAD
            与你的专业金融智能体团队一起投研
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed mx-auto">
            描述一个交易策略即可开始。
=======
            {t('welcome.subtitle')}
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed mx-auto">
            {t('welcome.describePrompt')}
>>>>>>> 0c297be610ab61eef59fe01db8ba67c97b91f2ef
          </p>
        </div>
      </div>

      {/* Capability chips */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {CAPABILITY_CHIP_KEYS.map((key) => (
          <span
            key={key}
            className="px-2.5 py-1 text-xs rounded-full border border-border/60 text-muted-foreground bg-muted/30"
          >
            {t(`welcome.capabilities.${key}`)}
          </span>
        ))}
      </div>

      {/* Example categories grid */}
      <div className="w-full max-w-2xl text-left space-y-4">
        <p className="text-xs text-muted-foreground px-1">{t('welcome.tryExample')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.labelKey} className="space-y-2">
              <div className={`flex items-center gap-1.5 text-xs font-medium px-1 ${cat.color.split(" ").filter(c => c.startsWith("text-")).join(" ")}`}>
                {cat.icon}
                <span>{t(cat.labelKey)}</span>
              </div>
              <div className="space-y-1.5">
                {cat.examples.map((ex) => (
                  <button
                    key={ex.titleKey}
                    onClick={() => onExample(t(ex.promptKey))}
                    className={`block w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${cat.color}`}
                  >
                    <span className="text-sm font-medium text-foreground leading-snug">
                      {t(ex.titleKey)}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
                      {t(ex.descKey)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
