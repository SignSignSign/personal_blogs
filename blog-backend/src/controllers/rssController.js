const { query } = require('../config/db');

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

exports.rss = async (req, res, next) => {
  try {
    const base = process.env.PUBLIC_BASE || `http://localhost:5173`;
    const rows = query(
      `SELECT id, title, content, category, created_at FROM posts
       WHERE is_draft = 0
       ORDER BY created_at DESC LIMIT 50`
    );

    const items = rows.map((r) => `
    <item>
      <title>${escapeXml(r.title)}</title>
      <link>${base}/post/${r.id}</link>
      <guid>${base}/post/${r.id}</guid>
      <category>${escapeXml(r.category)}</category>
      <pubDate>${new Date(r.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${(r.content || '').slice(0, 400)}]]></description>
    </item>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>薄荷随笔</title>
  <link>${base}</link>
  <description>一片安静的写作角落</description>
  <language>zh-CN</language>
${items}
</channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(xml);
  } catch (e) { next(e); }
};
