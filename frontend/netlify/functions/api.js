// Netlify Function: API 代理
// 路径: /.netlify/functions/api
// 支持的子路径:
//   /tencent?q=...     → 腾讯财经 A股指数
//   /sina/list=...     → 新浪财经 美股指数/个股
//   /sectors?...       → 东方财富 板块排行
//   /dragon?...        → 东方财富 龙虎榜
//   /reports?...       → 东方财富 研报

export default async (req, context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace('/.netlify/functions/api', '');

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  let targetUrl = '';
  let extraHeaders = {};

  try {
    if (path.startsWith('/tencent')) {
      targetUrl = 'https://qt.gtimg.cn/q' + url.search;
      extraHeaders = { Referer: 'https://finance.qq.com/' };
    } else if (path.startsWith('/sina')) {
      const sinaPath = path.replace('/sina', '');
      targetUrl = 'https://hq.sinajs.cn' + sinaPath + url.search;
      extraHeaders = { Referer: 'https://finance.sina.com.cn/' };
    } else if (path.startsWith('/sectors')) {
      targetUrl = 'https://push2.eastmoney.com/api/qt/clist/get' + url.search;
      extraHeaders = { Referer: 'https://quote.eastmoney.com/' };
    } else if (path.startsWith('/dragon')) {
      targetUrl = 'https://datacenter.eastmoney.com/securities/api/data/v1/get' + url.search;
      extraHeaders = { Referer: 'https://data.eastmoney.com/' };
    } else if (path.startsWith('/reports')) {
      targetUrl = 'https://reportapi.eastmoney.com/report/list' + url.search;
      extraHeaders = { Referer: 'https://data.eastmoney.com/' };
    } else {
      return json({
        error: 'Not found',
        hint: 'Use /tencent, /sina, /sectors, /dragon, or /reports',
        path,
      }, 404);
    }

    const resp = await fetch(targetUrl, {
      method: req.method,
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
