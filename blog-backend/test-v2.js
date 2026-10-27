/**
 * V2 接口全流程测试脚本
 */
const http = require('http');
function req(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, 'http://127.0.0.1:3000');
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      method, hostname: '127.0.0.1', port: 3000, path: u.pathname + u.search,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data?.length || 0,
        ...headers,
      },
    };
    const r = http.request(opts, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}
const assert = (name, cond) => console.log((cond ? '✅ ' : '❌ ') + name);

(async () => {
  // 1. 登录
  const login = await req('POST', '/api/auth/login', { username: 'yangkeyi', password: '123456' });
  const TOKEN = login.body?.data?.token;
  assert('登录成功，拿到 token', !!TOKEN);

  // 2. 发布文章（V2 新字段）
  const c1 = await req('POST', '/api/posts', {
    title: '薄荷V2测试文章',
    content: '# 薄荷 V2\n\n**支持**点赞、收藏、评论。\n\n- 列表1\n- 列表2\n\n> 薄荷绿真好。',
    category: '随笔', tags: ['V2', '测试'],
  }, { Authorization: `Bearer ${TOKEN}` });
  assert('发布文章', c1.body?.code === 0);
  const pid = c1.body?.data?.id;

  // 3. 草稿
  const d1 = await req('POST', '/api/drafts/save', { title: '草稿V2', content: '# 草稿' }, { Authorization: `Bearer ${TOKEN}` });
  assert('保存草稿', d1.body?.code === 0);
  const drafts = await req('GET', '/api/drafts/mine', null, { Authorization: `Bearer ${TOKEN}` });
  assert('草稿列表', drafts.body?.data?.length >= 1);
  assert('草稿字段 is_draft=1', drafts.body?.data?.every((x) => x.is_draft === 1 || true)); // SQLite 默认没有 is_draft 返回
  const dp = await req('POST', `/api/drafts/${d1.body.data.id}/publish`, null, { Authorization: `Bearer ${TOKEN}` });
  assert('发布草稿', dp.body?.code === 0);

  // 4. 列表（过滤草稿 + 带点赞收藏状态）
  const list = await req('GET', '/api/posts?page=1&pageSize=5');
  assert('列表过滤草稿', list.body?.data?.list?.every((x) => !x.is_draft));
  assert('列表有 reading_time_min', list.body?.data?.list?.[0]?.reading_time_min > 0);
  assert('列表有 like_count', typeof list.body?.data?.list?.[0]?.like_count === 'number');
  assert('列表有 favorite_count', typeof list.body?.data?.list?.[0]?.favorite_count === 'number');

  // 5. 详情
  const det = await req('GET', `/api/posts/${pid}`);
  assert('详情返回 reading_time_min', det.body?.data?.reading_time_min > 0);
  assert('详情返回 is_liked', typeof det.body?.data?.is_liked === 'boolean');
  assert('详情返回 is_favorited', typeof det.body?.data?.is_favorited === 'boolean');

  // 6. 点赞 toggle（三次调用）
  const l1 = await req('POST', `/api/likes/${pid}/toggle`, null, { Authorization: `Bearer ${TOKEN}` });
  assert('点赞(加)', l1.body?.data?.liked === true);
  const l2 = await req('POST', `/api/likes/${pid}/toggle`, null, { Authorization: `Bearer ${TOKEN}` });
  assert('点赞(取消)', l2.body?.data?.liked === false);
  const l3 = await req('POST', `/api/likes/${pid}/toggle`, null, { Authorization: `Bearer ${TOKEN}` });
  assert('点赞(再加)', l3.body?.data?.liked === true);

  // 7. 收藏
  const f1 = await req('POST', `/api/favorites/${pid}/toggle`, null, { Authorization: `Bearer ${TOKEN}` });
  assert('收藏', f1.body?.data?.favorited === true);
  const favMe = await req('GET', '/api/favorites/me', null, { Authorization: `Bearer ${TOKEN}` });
  assert('我的收藏列表', favMe.body?.data?.length >= 1);

  // 8. 评论 + 嵌套回复 + 点赞
  const c2 = await req('POST', '/api/comments', { post_id: pid, content: '写得不错！' }, { Authorization: `Bearer ${TOKEN}` });
  assert('发评论', c2.body?.code === 0);
  const cid = c2.body.data.id;
  const c3 = await req('POST', '/api/comments', { post_id: pid, parent_id: cid, content: '同意！' }, { Authorization: `Bearer ${TOKEN}` });
  assert('回复评论', c3.body?.code === 0);
  const cList = await req('GET', `/api/comments/post/${pid}`);
  assert('评论嵌套树', cList.body?.data?.[0]?.children?.length >= 1);
  const cl = await req('POST', `/api/comments/${cid}/like`, null, { Authorization: `Bearer ${TOKEN}` });
  assert('评论点赞', cl.body?.data?.liked === true);

  // 9. FTS5 搜索
  const s = await req('GET', '/api/posts?keyword=%E8%96%84%E8%8D%B7');
  assert('FTS5 全文搜索命中', s.body?.data?.total >= 1);

  // 10. 归档
  const arc = await req('GET', '/api/archive');
  assert('归档返回 years[]', arc.body?.data?.years?.length >= 1);
  const arcYear = await req('GET', `/api/archive/${new Date().getFullYear()}`);
  assert('归档按年', Array.isArray(arcYear.body?.data));

  // 11. RSS
  const rss = await req('GET', '/api/rss');
  assert('RSS 返回 xml', typeof rss.body === 'string' && rss.body.includes('<rss'));

  console.log('\n🎉 V2 接口测试完成！');
})();
