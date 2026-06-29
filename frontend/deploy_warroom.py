"""
Netlify 部署脚本 — 每日作战室 (WarRoom)
将 frontend/dist 部署到 Netlify，手机+电脑随时访问。

用法:
  python deploy_warroom.py

前提:
  1. npm run build 已执行（生成 dist/ 目录）
  2. Cloudflare Worker 已部署（wrangler publish）
"""

import urllib.request, json, os, zipfile, io, glob

NETLIFY_TOKEN = 'nfp_1LH4BeexFmFLvtJgrbn1xEwaqbgenGBf18ef'
SITE_NAME = 'warroom-daily'
HEADERS = {
    'Authorization': f'Bearer {NETLIFY_TOKEN}',
    'User-Agent': 'WorkBuddy',
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, 'dist')

def main():
    print("=" * 50)
    print("  Netlify 部署: 每日作战室 WarRoom")
    print("=" * 50)

    # Step 1: 获取或创建站点
    print("\n[1/3] 检查/创建站点...")
    site_id, site_url = get_or_create_site(SITE_NAME)
    print(f"  站点ID: {site_id}")
    print(f"  URL: {site_url}")

    # Step 2: 打包 dist/
    print("\n[2/3] 打包 dist/ ...")
    if not os.path.isdir(DIST_DIR):
        print(f"  错误: {DIST_DIR} 不存在！请先运行 'npm run build'")
        exit(1)

    zip_data = zip_dir(DIST_DIR)
    print(f"  压缩包大小: {len(zip_data) / 1024:.0f} KB")

    # Step 3: 部署
    print("\n[3/3] 上传部署...")
    deploy(site_id, zip_data)

    print(f"\n{'=' * 50}")
    print(f"  访问地址: https://{site_url}")
    print(f"  WarRoom页: https://{site_url}/war-room")
    print(f"{'=' * 50}")


def get_or_create_site(name):
    """获取已有站点或创建新站点"""
    # 先尝试查找已有站点
    req = urllib.request.Request(
        'https://api.netlify.com/api/v1/sites',
        headers=HEADERS,
    )
    try:
        resp = urllib.request.urlopen(req)
        sites = json.loads(resp.read())
        for s in sites:
            if s.get('name') == name or s.get('custom_slug') == name:
                return s['id'], s['url']
    except Exception as e:
        print(f"  查询失败: {e}")

    # 创建新站点
    print(f"  创建新站点 '{name}'...")
    data = json.dumps({
        'name': name,
        'custom_slug': name,
    }).encode()
    req = urllib.request.Request(
        'https://api.netlify.com/api/v1/sites',
        data=data,
        method='POST',
        headers={**HEADERS, 'Content-Type': 'application/json'},
    )
    try:
        resp = urllib.request.urlopen(req)
        site = json.loads(resp.read())
        return site['id'], site['url']
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  创建失败: {e.code} - {body}")
        exit(1)


def zip_dir(dir_path):
    """将目录打包为 ZIP（内存中）"""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(dir_path):
            # 排除隐藏文件和 __pycache__
            dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__']
            for file in files:
                if file.startswith('.'):
                    continue
                full_path = os.path.join(root, file)
                arc_name = os.path.relpath(full_path, dir_path).replace('\\', '/')
                zf.write(full_path, arc_name)
    return buf.getvalue()


def deploy(site_id, zip_data):
    """上传部署到 Netlify"""
    req = urllib.request.Request(
        f'https://api.netlify.com/api/v1/sites/{site_id}/deploys',
        data=zip_data,
        method='POST',
        headers={**HEADERS, 'Content-Type': 'application/zip'},
    )
    try:
        resp = urllib.request.urlopen(req)
        deploy_info = json.loads(resp.read())
        print(f"  部署成功! ID: {deploy_info.get('id', '?')[:12]}...")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  部署失败: {e.code} - {body[:200]}")
        exit(1)


if __name__ == '__main__':
    main()
