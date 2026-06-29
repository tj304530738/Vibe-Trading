import { useEffect, useState, useCallback, useRef } from "react";
import { TrendingUp, TrendingDown, RefreshCcw, Plus, X, Search } from "lucide-react";

// ── 类型定义 ──────────────────────────────────────────────
interface IndexDef { code: string; name: string; market: "a" | "us"; }
interface IndexData { code: string; name: string; price: number; changePct: number; changeAmt: number; }
interface StockItem { code: string; name: string; price: number; changePct: number; changeAmt: number; }

const INDEX_LIST: IndexDef[] = [
  { code: "sh000001", name: "上证指数", market: "a" },
  { code: "sh000300", name: "沪深300", market: "a" },
  { code: "sz399006", name: "创业板指", market: "a" },
  { code: "int_nasdaq", name: "纳斯达克", market: "us" },
  { code: "int_sp500", name: "标普500", market: "us" },
  { code: "int_dji", name: "道琼斯", market: "us" },
];

// ── localStorage 持久化 ────────────────────────────────────
function loadWatchlist(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function saveWatchlist(key: string, list: string[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

// ── 数据获取（JSONP/script-tag 方式，无 CORS 问题） ─────
function loadFinanceScript(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = url;
    script.onload = () => { if (script.parentNode) script.parentNode.removeChild(script); resolve('loaded'); };
    script.onerror = () => { if (script.parentNode) script.parentNode.removeChild(script); reject(new Error(`Failed: ${url}`)); };
    document.head.appendChild(script);
  });
}

async function fetchAShareQuotes(codes: string[]): Promise<Record<string, StockItem>> {
  if (codes.length === 0) return {};
  const q = codes.map((c) => {
    if (c.startsWith("sh") || c.startsWith("sz") || c.startsWith("bj")) return c;
    if (c.startsWith("6") || c.startsWith("9")) return `sh${c}`;
    if (c.startsWith("8")) return `bj${c}`;
    return `sz${c}`;
  }).join(",");
  // Tencent API — load as script, read window.v_XXX globals
  await loadFinanceScript(`https://qt.gtimg.cn/q?q=${q}&t=${Date.now()}`);
  const result: Record<string, StockItem> = {};
  for (const code of codes) {
    const fullCode = (code.startsWith("sh") || code.startsWith("sz") || code.startsWith("bj")) ? code
      : code.startsWith("6") || code.startsWith("9") ? `sh${code}` : code.startsWith("8") ? `bj${code}` : `sz${code}`;
    const raw = (window as any)['v_' + fullCode];
    if (!raw) continue;
    const f = raw.split("~");
    if (f.length < 50) continue;
    const bareCode = fullCode.length === 9 && /^[a-z]{2}/.test(fullCode) ? fullCode.slice(2) : fullCode;
    result[bareCode] = { code: bareCode, name: f[1], price: parseFloat(f[3]) || 0, changeAmt: parseFloat(f[31]) || 0, changePct: parseFloat(f[32]) || 0 };
  }
  for (const c of codes.map(c => c.startsWith("sh")||c.startsWith("sz")||c.startsWith("bj") ? c : c.startsWith("6")||c.startsWith("9")?`sh${c}`:c.startsWith("8")?`bj${c}`:`sz${c}`)) {
    delete (window as any)['v_' + c];
  }
  return result;
}

async function fetchUSQuotes(codes: string[]): Promise<Record<string, StockItem>> {
  if (codes.length === 0) return {};
  const q = codes.map((c) => `gb_${c.toLowerCase()}`).join(",");
  // Sina US stock API — load as script
  await loadFinanceScript(`https://hq.sinajs.cn/list=${q}&t=${Date.now()}`);
  const result: Record<string, StockItem> = {};
  for (const code of codes) {
    const raw = (window as any)['hq_str_gb_' + code.toLowerCase()];
    if (!raw) continue;
    const f = raw.split(",");
    if (f.length < 4) continue;
    result[code.toUpperCase()] = { code: code.toUpperCase(), name: f[0], price: parseFloat(f[1])||0, changePct: parseFloat(f[2])||0, changeAmt: parseFloat(f[4])||0 };
  }
  for (const c of codes) { delete (window as any)['hq_str_gb_' + c.toLowerCase()]; }
  return result;
}

async function fetchIndices(): Promise<Record<string, IndexData>> {
  const aCodes = INDEX_LIST.filter((i) => i.market === "a").map((i) => i.code);
  const usCodes = INDEX_LIST.filter((i) => i.market === "us").map((i) => i.code);
  const [aR, usR] = await Promise.allSettled([
    // Pass full codes with sh/sz prefix to avoid mis-guessing (000001=sh not sz)
    fetchAShareQuotes(aCodes).then((m) => {
      const r: Record<string, IndexData> = {};
      for (const def of INDEX_LIST.filter((i) => i.market === "a")) {
        const raw = m[def.code];  // key is full code like "sh000001"
        if (raw) r[def.code] = { ...raw, name: def.name };
      }
      return r;
    }),
    fetchUSQuotes(usCodes).then((m) => {
      const r: Record<string, IndexData> = {};
      for (const def of INDEX_LIST.filter((i) => i.market === "us")) {
        const raw = m[def.code];
        if (raw) r[def.code] = { ...raw, name: def.name };
      }
      return r;
    }),
  ]);
  const merged: Record<string, IndexData> = {};
  if (aR.status === "fulfilled") Object.assign(merged, aR.value);
  if (usR.status === "fulfilled") Object.assign(merged, usR.value);
  return merged;
}

// ── 涨跌幅颜色（统一：红涨绿跌） ────────────────────────
function colorClass(pct: number) {
  if (pct > 0) return "text-red-500 dark:text-red-400";
  if (pct < 0) return "text-emerald-600 dark:text-emerald-400";
  return "text-muted-foreground";
}
function TrendIcon({ pct }: { pct: number }) {
  if (pct > 0) return <TrendingUp className="h-3.5 w-3.5" />;
  if (pct < 0) return <TrendingDown className="h-3.5 w-3.5" />;
  return <span className="h-3.5 w-3.5 inline-block text-center">—</span>;
}

// ── 指数卡片 ──────────────────────────────────────────────
function IndexCard({ data, loading }: { data?: IndexData; loading: boolean }) {
  if (loading || !data) {
    return (
      <div className="rounded-xl border bg-card p-4 shadow-sm animate-pulse min-w-[160px] flex-1">
        <div className="h-3 bg-muted rounded w-12 mb-2" />
        <div className="h-7 bg-muted rounded w-20 mb-1" />
        <div className="h-3 bg-muted rounded w-16" />
      </div>
    );
  }
  const cc = colorClass(data.changePct);
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm min-w-[160px] flex-1 transition hover:shadow-md">
      <div className="text-xs font-medium text-muted-foreground mb-1">{data.name}</div>
      <div className={`text-xl font-bold tabular-nums ${cc}`}>
        {data.price.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className={`flex items-center gap-1 mt-1 text-xs font-medium tabular-nums ${cc}`}>
        <TrendIcon pct={data.changePct} />
        <span>{data.changePct > 0 ? "+" : ""}{data.changeAmt.toFixed(2)}</span>
        <span>({data.changePct > 0 ? "+" : ""}{data.changePct.toFixed(2)}%)</span>
      </div>
    </div>
  );
}

// ── 自选股行 ──────────────────────────────────────────────
function StockRow({ item, onRemove }: { item: StockItem; onRemove: () => void }) {
  const cc = colorClass(item.changePct);
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card/50 hover:bg-card transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{item.name}</div>
        <div className="text-xs text-muted-foreground">{item.code}</div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-bold tabular-nums ${cc}`}>
          {item.price.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`flex items-center justify-end gap-0.5 text-xs font-medium tabular-nums ${cc}`}>
          <TrendIcon pct={item.changePct} />
          <span>{item.changePct > 0 ? "+" : ""}{item.changePct.toFixed(2)}%</span>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive rounded transition-all"
        title="移除"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── 添加弹窗 ──────────────────────────────────────────────
function AddModal({ open, onClose, onAdd, market }: {
  open: boolean; onClose: () => void; onAdd: (code: string) => void; market: "a" | "us";
}) {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<StockItem | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { setInput(""); setPreview(null); setError(""); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);

  const handleSearch = useCallback(async () => {
    const v = input.trim();
    if (!v) return;
    setSearching(true); setError(""); setPreview(null);
    try {
      if (market === "a") {
        // 纯数字代码，否则当名称搜（简单处理：6位数字=代码）
        let code = v;
        if (!/^\d{6}$/.test(v)) {
          // 按名称搜索 — 尝试用腾讯搜索（用代码方式先试，失败再提示）
          setError("A股请输入6位代码（如 600519）");
          setSearching(false);
          return;
        }
        const data = await fetchAShareQuotes([code]);
        if (data[code]) { setPreview(data[code]); }
        else { setError("未找到该股票，请检查代码"); }
      } else {
        const code = v.toUpperCase().replace(/\s/g, "");
        if (!/^[A-Z]+$/.test(code)) { setError("美股请输入代码（如 AAPL）"); setSearching(false); return; }
        const data = await fetchUSQuotes([code]);
        if (data[code]) { setPreview(data[code]); }
        else { setError("未找到该股票，请检查代码"); }
      }
    } catch { setError("查询失败"); }
    setSearching(false);
  }, [input, market]);

  const confirm = () => {
    if (preview) { onAdd(preview.code); onClose(); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-background rounded-xl border shadow-xl p-5 w-full max-w-sm mx-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{market === "a" ? "添加A股自选" : "添加美股自选"}</h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder={market === "a" ? "输入6位代码，如 600519" : "输入代码，如 AAPL"}
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button onClick={handleSearch} disabled={searching || !input.trim()}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-40">
            <Search className="h-4 w-4" /> 查询
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {preview && (
          <div className="rounded-lg border bg-muted/20 p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{preview.name}</div>
              <div className="text-xs text-muted-foreground">{preview.code}</div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${colorClass(preview.changePct)}`}>{preview.price.toFixed(2)}</div>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm text-muted-foreground">取消</button>
          <button onClick={confirm} disabled={!preview}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm text-primary-foreground disabled:opacity-40">添加</button>
        </div>
      </div>
    </div>
  );
}

// ── 自选列组件 ────────────────────────────────────────────
function WatchlistColumn({ market, title, hint, refreshKey }: { market: "a" | "us"; title: string; hint: string; refreshKey: number }) {
  const storageKey = `overview_watchlist_${market}`;
  const [codes, setCodes] = useState<string[]>(() => loadWatchlist(storageKey));
  const [quotes, setQuotes] = useState<Record<string, StockItem>>({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const persist = (list: string[]) => { setCodes(list); saveWatchlist(storageKey, list); };

  const addCode = (code: string) => {
    const upper = code.toUpperCase();
    if (!codes.includes(upper)) persist([...codes, upper]);
  };
  const removeCode = (code: string) => {
    persist(codes.filter((c) => c !== code));
  };

  const fetchQuotes = useCallback(async () => {
    if (codes.length === 0) { setLoading(false); return; }
    try {
      const data = market === "a" ? await fetchAShareQuotes(codes) : await fetchUSQuotes(codes);
      setQuotes(data);
    } catch { /* keep stale data */ }
    setLoading(false);
  }, [codes, market]);

  useEffect(() => { fetchQuotes(); const t = setInterval(fetchQuotes, 15_000); return () => clearInterval(t); }, [fetchQuotes, refreshKey]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground/60">{hint}</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Plus className="h-3.5 w-3.5" /> 添加
        </button>
      </div>
      {loading && codes.length > 0 ? (
        <div className="space-y-2">
          {codes.map((c) => (
            <div key={c} className="h-12 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : codes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground/50">
          点击「添加」添加自选股
        </div>
      ) : (
        <div className="space-y-1.5">
          {codes.map((code) => (
            <StockRow key={code} item={quotes[code] || { code, name: code, price: 0, changePct: 0, changeAmt: 0 }} onRemove={() => removeCode(code)} />
          ))}
        </div>
      )}
      <AddModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addCode} market={market} />
    </div>
  );
}

// ── 页面主体 ──────────────────────────────────────────────
export function Overview() {
  const [indices, setIndices] = useState<Record<string, IndexData>>({});
  const [loadingIdx, setLoadingIdx] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchIndices();
      setIndices(data);
      setLastUpdate(new Date().toLocaleTimeString("zh-CN"));
    } catch { /* keep stale */ }
    setLoadingIdx(false);
  }, []);

  const refreshAll = useCallback(() => {
    refresh();
    setRefreshKey((k) => k + 1);
  }, [refresh]);

  useEffect(() => { refresh(); const t = setInterval(refresh, 15_000); return () => clearInterval(t); }, [refresh]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">行情看板</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lastUpdate ? `最后更新：${lastUpdate}` : "加载中…"}
          </p>
        </div>
        <button onClick={refreshAll} disabled={loadingIdx}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40">
          <RefreshCcw className={`h-4 w-4 ${loadingIdx ? "animate-spin" : ""}`} /> 刷新全部
        </button>
      </div>

      {/* 指数卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {INDEX_LIST.map((def) => (
          <IndexCard key={def.code} data={indices[def.code]} loading={loadingIdx} />
        ))}
      </div>

      {/* 自选股双列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WatchlistColumn market="a" title="A股自选" hint="基于 a-stock-data · 腾讯行情" refreshKey={refreshKey} />
        <WatchlistColumn market="us" title="美股自选" hint="基于新浪行情" refreshKey={refreshKey} />
      </div>

      {/* 数据源说明 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">A股市场</h3>
          <p className="text-xs text-muted-foreground/60">指数+自选：腾讯财经（a-stock-data 数据源）· 每15秒刷新</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">美股市场</h3>
          <p className="text-xs text-muted-foreground/60">指数+自选：新浪财经 · 每15秒刷新</p>
        </div>
      </div>
    </div>
  );
}
