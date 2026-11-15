# YAONET · 新闻聚合站

一个极致轻量、零服务器成本、完全自动化的全球新闻聚合站。

通过 **GitHub Actions** 定时抓取、清洗 50+ 个高质量 RSS 源，静态生成前端所需的 JSON 数据和标准 RSS 订阅源，并通过 **GitHub Pages** 免费托管。

## ✨ 核心特性

- **零服务器成本**：完全依赖 GitHub Actions 和 GitHub Pages，无需购买 VPS 或云函数。
- **无惧并发限制**：将抓取逻辑剥离到 Actions 环境中执行，彻底摆脱 Serverless（如 Cloudflare Worker）的 50 个子请求硬限制。
- **极其硬核的 HTML 清洗**：放弃正则表达式，引入 `htmlparser2` 解析 HTML 语法树，只收 `text node`，完美处理多重转义、未闭合标签和 `<script>` 注入残留。
- **阅读体验优先**：原生响应式设计、自动适配系统深色模式、骨架屏加载、平滑过渡动画。
- **标准 RSS 支持**：不仅提供网页浏览，同时生成标准的 `feed.xml`，可直接导入 Feedly、Inoreader 等任意 RSS 阅读器。
- **按码点安全截断**：防止 300 字符截断导致 Emoji 和复杂组合字符损坏。

## 🏗️ 架构与工作原理

```text
[ 50+ 全球 RSS 源 ] 
       │
       ▼ (每 30 分钟)
[ GitHub Actions ] ── 运行 rss-builder.js ──> 解析、清洗 HTML、去重、排序
       │
       ├─> 生成静态数据 `posts.json` (供前端渲染)
       ├─> 生成标准订阅源 `feed.xml` (供 RSS 阅读器)
       │
       ▼
[ Git Commit & Push ] 
       │
       ▼
[ GitHub Pages ] ── 静态分发 ──> 用户浏览器 / RSS 客户端
```

## 📂 目录结构

```text
├── .github/
│   └── workflows/
│       └── rss.yml          # GitHub Actions 定时任务配置
├── index.html               # 前端页面（纯 HTML/CSS/JS）
├── rss-builder.js           # 核心抓取与数据生成脚本 (Node.js)
├── package.json             # 依赖配置 (htmlparser2, he)
├── posts.json               # [自动生成] 供前端使用的聚合数据
├── feed.xml                 # [自动生成] 供阅读器订阅的 XML
└── README.md
```

## 🚀 部署指南

1. **Fork 或克隆本仓库**到你的 GitHub 账号下。
2. **配置仓库权限**：进入仓库的 `Settings` -> `Actions` -> `General` -> 找到 `Workflow permissions`，选择 **Read and write permissions**（允许 Action 自动提交生成的 JSON 和 XML 文件）。
3. **启用 GitHub Pages**：进入 `Settings` -> `Pages`，在 `Build and deployment` 的 `Source` 下拉框中选择 **Deploy from a branch**，分支选 `main`（或 `master`），目录选 `/ (root)`，点击 Save。
4. **手动触发一次构建**：进入仓库的 `Actions` 标签页，选择左侧的 `Update RSS Feed`，点击右侧的 `Run workflow`。
5. 等待大约 1 分钟，Action 会生成 `posts.json` 和 `feed.xml` 并自动 push 到仓库。之后访问你的 GitHub Pages 域名即可。

> **⚠️ 自定义域名注意**：如果你绑定了自定义域名（比如 `news.yaonet.de5.net`），请确保仓库根目录下有一个内容为你域名的 `CNAME` 文件，并且在 `index.html` 的 `<head>` 中修改 favicon 的绝对路径。

## 🛠️ 本地开发与测试

如果你想在本地修改样式或添加新的 RSS 源，请确保安装了 **Node.js (v18+)**。

```bash
# 1. 安装依赖
npm install

# 2. 运行抓取脚本（会在本地生成 posts.json 和 feed.xml）
node rss-builder.js

# 3. 启动本地 HTTP 服务预览前端页面（由于 fetch 的 CORS 限制，不能直接双击打开 html）
npx serve .
# 或使用 python3 -m http.server 8000
```

## 📡 如何增删 RSS 源？

打开 `rss-builder.js`，在顶部的 `FEEDS` 数组中按格式添加或删除源即可：

```javascript
const FEEDS = [
  { name: 'IT之家', url: 'https://www.ithome.com/rss/', category: '科技' },
  // 添加新源：
  { name: '阮一峰的网络日志', url: 'https://www.ruanyifeng.com/blog/atom.xml', category: '开发' },
];
```
添加后，下一次 Action 运行时会自动带上新源。

## 💡 踩坑记录（Why we do this?）

1. **为什么不用 Cloudflare Workers？** 
   Worker 免费版对单次请求有 50 个子请求（fetch）限制。当源数量达到 50+ 时，极易触发 `Too many subrequests` 报错导致整个请求崩溃。迁移至 Actions 后实现了真正的降维打击，6 分钟运行时间足够抓取上百个源。
2. **为什么一定要用 htmlparser2？** 
   RSS 源返回的 HTML 极其脏，正则表达式 `<[^>]*>` 无法处理属性中的 `>`（如 `<a title="a > b">`），也无法拦截 `<script>` 里的内容。使用解析器只拼接 `ontext` 是唯一能 100% 去除垃圾标签且保留纯文本的正确做法。

---
*Powered by GitHub Actions & Pages. 干净、纯粹、只看新闻。*
