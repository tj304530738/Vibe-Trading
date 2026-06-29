/**
 * WarRoom API Proxy — Cloudflare Worker (完整版)
 *
 * 代理所有数据接口，解决浏览器 CORS 跨域问题。
 * 
 * 路由:
 *   GET /tencent?q=...    → qt.gtimg.cn (腾讯财经 - A股指数)
 *   GET /sina/list=...    → hq.sinajs.cn (新浪财经 - 美股指数/个股)
 *   GET /sectors?...      → push2.eastmoney.com (板块排行)
 *   GET /dragon?...       → datacenter.eastmoney.com (龙虎榜)
 *   GET /reports?...      → reportapi.eastmoney.com (研报)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
        status: 204,
      });
    }

    // Route to target API
    let targetUrl = '';
    let extraHeaders = {};

    if (path.startsWith('/tencent')) {
      // 腾讯财经 A股指数
      targetUrl = 'https://qt.gtimg.cn/q' + url.search;
      extraHeaders = {
        'Referer': 'https://finance.qq.com/',
      };
    } else if (path.startsWith('/sina')) {
      // 新浪财经 美股指数/个股
      const sinaPath = path.replace('/sina', '');
      targetUrl = 'https://hq.sinajs.cn' + sinaPath + url.search;
      extraHeaders = {
        'Referer': 'https://finance.sina.com.cn/',
      };
    } else if (path === '/sectors' || path.startsWith('/sectors')) {
      // 东方财富 板块排行
      targetUrl = 'https://push2.eastmoney.com/api/qt/clist/get' + url.search;
      extraHeaders = {
        'Referer': 'https://quote.eastmoney.com/',
      };
    } else if (path === '/dragon' || path.startsWith('/dragon')) {
      // 东方财富 龙虎榜
      targetUrl = 'https://datacenter.eastmoney.com/securities/api/data/v1/get' + url.search;
      extraHeaders = {
        'Referer': 'https://data.eastmoney.com/',
      };
    } else if (path === '/reports' || path.startsWith('/reports')) {
      // 东方财富 研报
      targetUrl = 'https://reportapi.eastmoney.com/report/list' + url.search;
      extraHeaders = {
        'Referer': 'https://data.eastmoney.com/',
      };
    } else {
      return json({ error: 'Not found', hint: 'Use /tencent, /sina, /sectors, /dragon, or /reports' }, 404);
    }

    try {
      const resp = await fetch(targetUrl, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          ...extraHeaders,
        },
      });

      const data = await resp.text();

      return new Response(data, {
        status: resp.status,
        headers: {
          'Content-Type': getContentType(path),
          ...corsHeaders(),
        },
      });
    } catch (err) {
      return json({
        error: 'Proxy error',
        message: err.message,
        target: targetUrl,
      }, 502);
    }
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function getContentType(path) {
  if (path.startsWith('/tencent') || path.startsWith('/sina')) {
    return 'application/javascript; charset=utf-8';
  }
  return 'application/json; charset=utf-8';
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders() },
  });
}