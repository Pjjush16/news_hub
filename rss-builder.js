const fs = require('fs');
const { Parser } = require('htmlparser2');
const he = require('he');

// ==================== 配置区 ====================
const FEEDS = [
  // —— 中文 · 科技/商业 ——
  { name: 'IT之家',       url: 'https://www.ithome.com/rss/',                    category: '科技' },
  { name: '少数派',       url: 'https://sspai.com/feed',                         category: '科技' },
  { name: 'Solidot',      url: 'https://www.solidot.org/index.rss',              category: '科技' },
  { name: '智东西',       url: 'https://zhidx.com/rss',                          category: '科技' },
  { name: '爱范儿',       url: 'https://www.ifanr.com/feed',                     category: '科技' },
  { name: 'cnBeta',       url: 'https://plink.anyfeeder.com/cnbeta',             category: '科技' },
  { name: '钛媒体',       url: 'https://www.tmtpost.com/rss',                    category: '商业' },
  { name: '虎嗅',         url: 'https://www.huxiu.com/rss/0.xml',                category: '商业' },
  { name: '界面新闻',     url: 'https://feedx.net/rss/jiemian.xml',              category: '商业' },
  { name: 'Odaily快讯',   url: 'https://rss.odaily.news/rss/newsflash',          category: '财经' },
  { name: 'FT中文网',     url: 'https://www.ftchinese.com/rss/feed',             category: '财经' },
  { name: '量子位',       url: 'https://www.qbitai.com/feed',                    category: 'AI' },
  { name: '机器之心',     url: 'https://wechat2rss.xlab.app/feed/51e92aad2728acdd1fda7314be32b16639353001.xml', category: 'AI' },
  { name: '阮一峰',       url: 'https://www.ruanyifeng.com/blog/atom.xml',       category: '开发' },
  { name: '美团技术',     url: 'https://tech.meituan.com/feed',                  category: '开发' },
  { name: 'V2EX',         url: 'https://www.v2ex.com/index.xml',                 category: '开发' },
  { name: 'LinuxDo',      url: 'https://linux.do/latest.rss',                    category: '开发' },
  { name: '中国日报',     url: 'https://plink.anyfeeder.com/chinadaily/china',   category: '新闻' },
  { name: 'BBC 中文',     url: 'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml', category: '国际' },
  { name: 'DW 中文',      url: 'https://rss.dw.com/rdf/rss-chi-all',             category: '国际' },
  { name: '纽约时报中文', url: 'https://cn.nytimes.com/rss/',                    category: '国际' },

  // —— 国际 · 科技/AI/科学 ——
  { name: 'Hacker News',  url: 'https://news.ycombinator.com/rss',               category: '开发' },
  { name: 'GitHub Blog',  url: 'https://github.blog/feed/',                      category: '开发' },
  { name: 'TechCrunch',   url: 'https://techcrunch.com/feed/',                   category: '科技' },
  { name: 'The Verge',    url: 'https://www.theverge.com/rss/index.xml',         category: '科技' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index',category: '科技' },
  { name: 'Wired',        url: 'https://www.wired.com/feed/rss',                 category: '科技' },
  { name: 'Engadget',     url: 'https://www.engadget.com/rss.xml',               category: '科技' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/',      category: '科技' },
  { name: 'OpenAI',       url: 'https://openai.com/news/rss.xml',                category: 'AI' },
  { name: 'Google AI',    url: 'https://blog.google/technology/ai/rss/',         category: 'AI' },
  { name: 'DeepMind',     url: 'https://deepmind.google/blog/rss.xml',           category: 'AI' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml',           category: 'AI' },
  { name: 'arXiv cs.AI',  url: 'https://arxiv.org/rss/cs.AI',                    category: 'AI' },
  { name: 'Nature',       url: 'https://www.nature.com/nature.rss',              category: '科学' },
  { name: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/all.xml',       category: '科学' },
  { name: 'Quanta',       url: 'https://www.quantamagazine.org/feed/',           category: '科学' },
  { name: 'Phys.org',     url: 'https://phys.org/rss-feed/',                     category: '科学' },

  // —— 国际 · 新闻/财经 ——
  { name: 'BBC World',    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',    category: '国际' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss',          category: '国际' },
  { name: 'Al Jazeera',   url: 'https://www.aljazeera.com/xml/rss/all.xml',      category: '国际' },
  { name: 'NYT World',    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: '国际' },
  { name: 'Washington Post', url: 'https://feeds.washingtonpost.com/rss/world',  category: '国际' },
  { name: 'DW English',   url: 'https://rss.dw.com/rdf/rss-en-all',              category: '国际' },
  { name: 'France 24',    url: 'https://www.france24.com/en/rss',                category: '国际' },
  { name: 'Sky News',     url: 'https://feeds.skynews.com/feeds/rss/world.xml',  category: '国际' },
  { name: 'Politico EU',  url: 'https://www.politico.eu/feed/',                  category: '国际' },
  { name: 'Euronews',     url: 'https://www.euronews.com/rss',                   category: '国际' },
  { name: 'SCMP',         url: 'https://www.scmp.com/rss/91/feed/',              category: '国际' },
  { name: 'CBC',          url: 'https://www.cbc.ca/webfeed/rss/rss-topstories',  category: '国际' },
  { name: 'ABC Australia',url: 'https://www.abc.net.au/news/feed/45910/rss.xml', category: '国际' },
  { name: 'RNZ',          url: 'https://www.rnz.co.nz/rss/news.xml',             category: '国际' },
  { name: 'CNBC',         url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', category: '财经' },
  { name: 'Bloomberg',    url: 'https://feeds.bloomberg.com/markets/news.rss',   category: '财经' },
  { name: 'FT',           url: 'https://www.ft.com/rss/home',                    category: '财经' },
  { name: 'Economist',    url: 'https://www.economist.com/the-world-this-week/rss.xml', category: '财经' },
];

const FETCH_TIMEOUT = 15000;
const MAX_ITEMS = 300;

// ==================== 核心：基于 htmlparser2 的纯文本提取 ====================
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'template', 'svg', 'math', 'iframe']);

function htmlToText(html) {
  if (html == null) return '';
  
  let input = String(html);
  // 启发式判断：如果原文没 HTML 标签但有转义标签，先解一层
  if (!/<[a-z!/]/i.test(input) && /&lt;[a-z!/]/i.test(input)) {
    input = he.decode(input);
  }

  let out = '';
  let skipDepth = 0;

  const parser = new Parser({
    onopentag(name) {
      if (SKIP_TAGS.has(name)) { skipDepth++; return; }
      if (skipDepth === 0) out += ' ';
    },
    ontext(t) {
      if (skipDepth === 0) out += t;
    },
    onclosetag(name) {
      if (SKIP_TAGS.has(name)) { if (skipDepth > 0) skipDepth--; return; }
      if (skipDepth === 0) out += ' ';
    },
    oncomment() {},                 // 丢弃注释
    onprocessinginstruction() {},   // 丢弃 <?xml ?>
  }, {
    decodeEntities: true,           // 内部用 entities 库解码
    lowerCaseTags: true,
    recognizeSelfClosing: true,
  });

  // 限制最大解析长度防止 DoS
  parser.write(input.slice(0, 200_000)); 
  parser.end();

  // 清理控制字符与零宽字符，合并空白
  return out
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028\u2029\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 按码点安全截断（防止切坏 emoji）
function truncateByCodePoint(str, limit) {
  return [...str].slice(0, limit).join('');
}

// ==================== XML 标签提取 ====================
function extractTag(xml, tag) {
  const cdata = new RegExp(`<${tag}(?:\\s[^>]*)?>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
  let m = xml.match(cdata);
  if (m) return m[1].trim();
  const plain = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i');
  m = xml.match(plain);
  return m ? m[1].trim() : '';
}

function extractAtomLink(block) {
  for (const m of block.matchAll(/<link\b([^>]*?)\/?>/gi)) {
    const attrs = m[1];
    const href = /href=["']([^"']+)["']/i.exec(attrs);
    if (!href) continue;
    const rel = /rel=["']([^"']+)["']/i.exec(attrs);
    if (!rel || rel[1].toLowerCase() === 'alternate') return href[1];
  }
  return extractTag(block, 'link');
}

function toISO(dateStr) {
  if (!dateStr) return new Date().toISOString();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function parseItems(xml, feed) {
  const items = [];
  const push = (rawTitle, link, rawDesc, pub) => {
    if (!rawTitle || !link) return;
    
    // 统一应用 htmlToText 和码点截断
    const title = truncateByCodePoint(htmlToText(rawTitle), 100);
    const description = truncateByCodePoint(htmlToText(rawDesc), 300);

    if (!title) return;
    
    items.push({ 
      title, 
      link, 
      description, 
      pubDate: toISO(pub), 
      source: feed.name, 
      category: feed.category 
    });
  };

  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const b = m[0];
    push(
      extractTag(b, 'title'), 
      extractTag(b, 'link') || (/<link[^>]*href=["']([^"']+)["']/i.exec(b)?.[1] ?? ''), 
      extractTag(b, 'description') || extractTag(b, 'content:encoded'), 
      extractTag(b, 'pubDate') || extractTag(b, 'dc:date')
    );
  }

  for (const m of xml.matchAll(/<entry[\s>][\s\S]*?<\/entry>/gi)) {
    const b = m[0];
    push(
      extractTag(b, 'title'), 
      extractAtomLink(b), 
      extractTag(b, 'summary') || extractTag(b, 'content'), 
      extractTag(b, 'updated') || extractTag(b, 'published')
    );
  }
  return items;
}

// ==================== 抓取与生成 ====================
async function fetchFeed(feed) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseItems(xml, feed);
  } finally {
    clearTimeout(timer);
  }
}

async function build() {
  console.log(`开始抓取 ${FEEDS.length} 个源...`);
  const results = await Promise.allSettled(FEEDS.map(f => fetchFeed(f)));
  const all = [];
  
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      console.log(`✅ ${FEEDS[i].name}: ${r.value.length} 条`);
      all.push(...r.value);
    } else {
      console.log(`❌ ${FEEDS[i].name}: ${r.reason}`);
    }
  });

  all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  const seen = new Set();
  const finalItems = all.filter(item => {
    const cleanLink = item.link.replace(/[?#].*$/, '').toLowerCase();
    const key = item.title.replace(/[\s\p{P}]/gu, '').toLowerCase() + '|' + cleanLink;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, MAX_ITEMS);

  fs.writeFileSync('posts.json', JSON.stringify(finalItems, null, 2));

  const escapeXml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  const cdata = (str) => `<![CDATA[${String(str || '').replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
  
  const itemsXml = finalItems.map(item => `
    <item>
      <title>${cdata(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.link)}</guid>
      <description>${cdata(item.description)}</description>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <category>${cdata(item.category)}</category>
      <source>${escapeXml(item.source)}</source>
    </item>`).join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>YAONET · 新闻聚合</title>
    <link>https://news.yaonet.de5.net</link>
    <description>聚合 ${FEEDS.length} 个新闻源，自动去重、按时间排序。</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://news.yaonet.de5.net/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  fs.writeFileSync('feed.xml', rssXml);
  console.log(`\n构建完成！共生成 ${finalItems.length} 条新闻。`);
}

build().catch(console.error);
