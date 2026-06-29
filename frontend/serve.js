/**
 * 轻量静态服务器 + API代理
 * 用于部署 WarRoom 等页面，解决浏览器CORS跨域问题
 *
 * 启动: node serve.js
 * 访问: http://localhost:5899
 */
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 5899;
const DIST_DIR = path.join(__dirname, "dist");

// 代理规则：和 vite.config.ts 保持一致
const PROXY_RULES = [
  {
    match: "/api/tencent",
    target: "https://qt.gtimg.cn",
  },
  {
    match: "/api/sina",
    target: "https://hq.sinajs.cn",
    extraHeaders: { Referer: "https://finance.sina.com.cn" },
  },
  {
    match: "/api/sectors",
    target: "https://push2.eastmoney.com/api/qt/clist/get",
  },
  {
    match: "/api/dragon",
    target: "https://datacenter.eastmoney.com/securities/api/data/v1/get",
  },
  {
    match: "/api/reports",
    target: "https://reportapi.eastmoney.com/report/list",
  },
];

// MIME 类型
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

// SPA fallback: 所有非API、非文件的请求返回 index.html
function serveStatic(req, res) {
  let filePath = req.url.split("?")[0];
  // 去掉开头的 /
  if (filePath === "/" || filePath.startsWith("/war-room") || filePath.startsWith("/overview")) {
    filePath = "/index.html";
  }
  const fullPath = path.join(DIST_DIR, filePath);

  if (!fs.existsSync(fullPath) || !fullPath.startsWith(DIST_DIR)) {
    // SPA fallback
    serveFile(res, path.join(DIST_DIR, "index.html"));
    return;
  }

  serveFile(res, fullPath);
}

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  const stat = fs.statSync(filePath);
  const contentType = getMimeType(filePath);
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=3600",
  });
  fs.createReadStream(filePath).pipe(res);
}

// 代理请求
function proxyRequest(req, res, rule) {
  // 解析请求 URL，分离路径和查询参数
  const reqUrl = new URL(req.url, "http://localhost");
  const pathAfterMatch = reqUrl.pathname.slice(rule.match.length);
  const queryString = reqUrl.search;

  // 构建目标 URL
  const targetBase = rule.target;
  const targetUrl = new URL(targetBase + pathAfterMatch + queryString);

  const options = targetUrl;
  options.method = req.method;
  options.headers = {
    ...req.headers,
    host: options.host,
    origin: rule.target,
    ...(rule.extraHeaders || {}),
  };
  delete options.headers["connection"];

  const transport = options.protocol === "https:" ? https : http;

  const proxyReq = transport.request(options, (proxyRes) => {
    // 跳过 CORS 相关响应头，让浏览器以为这是同源请求
    const headers = { ...proxyRes.headers };
    delete headers["access-control-allow-origin"];
    delete headers["access-control-allow-methods"];
    delete headers["access-control-allow-headers"];

    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error(`[Proxy Error] ${rule.match}: ${err.message}`);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Proxy error", message: err.message }));
  });

  req.pipe(proxyReq);
}

// 主请求处理
const server = http.createServer((req, res) => {
  const url = req.url;

  // 检查是否匹配代理规则
  for (const rule of PROXY_RULES) {
    if (url.startsWith(rule.match)) {
      proxyRequest(req, res, rule);
      return;
    }
  }

  // 静态文件服务
  serveStatic(req, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n========================================`);
  console.log(`  Vibe Trading 静态服务器已启动`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://127.0.0.1:${PORT}/war-room`);
  console.log(`  http://127.0.0.1:${PORT}/overview`);
  console.log(`========================================\n`);
});
