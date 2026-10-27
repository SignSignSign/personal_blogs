import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { categoryApi, postApi, draftApi } from '../utils/api';
import type { Category, PostDetail } from '../types';
import ImageUploader, { handleMarkdownImage } from '../components/ImageUploader';

export default function WritePost() {
  const [sp] = useSearchParams();
  const editId = sp.get('id');
  const nav = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('# 开始你的创作吧\n\n');
  const [category, setCategory] = useState('随笔');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [cover, setCover] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => { });
    if (editId) {
      setLoading(true);
      postApi.detail(Number(editId)).then((p: PostDetail) => {
        setTitle(p.title);
        setContent(p.content);
        setCategory(p.category);
        setTags(p.tags);
        setCover(p.cover || '');
      }).catch((e) => alert(e.message)).finally(() => setLoading(false));
    }
  }, [editId]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const wordCount = useMemo(() => content.length, [content]);

  // ===== V2 新增：图片拖拽/粘贴上传处理 =====
  const onPaste = async (e: React.ClipboardEvent) => {
    // 只拦截图片
    if (e.clipboardData.files?.length) {
      const handled = await handleMarkdownImage(e, () => textRef.current, (updater) => setContent(updater));
      if (handled) e.preventDefault();
    }
  };
  const onDrop = async (e: React.DragEvent) => {
    if (e.dataTransfer.files?.length) {
      const handled = await handleMarkdownImage(e, () => textRef.current, (updater) => setContent(updater));
      if (handled) e.preventDefault();
    }
  };

  // ===== V2 新增：保存为草稿 / 发布 =====
  const submit = async (asDraft: boolean) => {
    if (!title.trim() || !content.trim()) return alert('标题和内容必填');
    setSubmitting(true);
    try {
      if (asDraft) {
        await draftApi.save({ id: editId ? Number(editId) : undefined, title, content, category, tags, cover });
        alert('已保存到草稿箱');
      } else {
        if (editId) {
          await postApi.update(Number(editId), { title, content, category, tags, cover, is_draft: false });
          alert('更新成功');
        } else {
          const r = await postApi.create({ title, content, category, tags, cover, is_draft: false });
          alert('发布成功');
          nav(`/post/${r.id}`);
        }
      }
    } catch (e: any) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-20 text-center text-sage-700/50 dark:text-mint-100/40">加载中...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-sage-700 dark:text-mint-100 mb-6">{editId ? '编辑文章' : '写新文章'}</h1>

      {/* 表单头部 */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div>
          <label className="block text-sm text-sage-700/70 dark:text-mint-100/60 mb-1">标题</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="给它一个好标题..." className="input" />
        </div>
        <div>
          <label className="block text-sm text-sage-700/70 dark:text-mint-100/60 mb-1">分类</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-sage-700/70 dark:text-mint-100/60 mb-1">标签（回车添加）</label>
          <div className="flex gap-2">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="如：React、读书笔记" className="input" />
            <button type="button" onClick={addTag} className="btn-ghost">添加</button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((t) => (
                <span key={t} className="tag flex items-center gap-1">
                  {t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm text-sage-700/70 dark:text-mint-100/60 mb-1">封面图</label>
          <ImageUploader value={cover} onChange={setCover} placeholder="点击 / 拖拽 / 粘贴图片上传" />
        </div>
      </div>

      {/* 双栏编辑器（支持粘贴/拖拽图片自动上传） */}
      <div className="grid gap-4 md:grid-cols-2 border border-mint-100 dark:border-mint-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
        <div className="flex flex-col border-r border-mint-100 dark:border-mint-800">
          <div className="px-4 py-2 bg-mint-50/50 dark:bg-mint-900/20 text-xs text-sage-700/60 dark:text-mint-100/50 border-b border-mint-100 dark:border-mint-800 flex justify-between">
            <span>Markdown 编辑（可直接粘贴/拖拽图片）</span>
            <span>{wordCount} 字</span>
          </div>
          <textarea
            ref={textRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={onPaste}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex-1 p-4 resize-none outline-none text-sm font-mono leading-relaxed min-h-[480px] bg-white dark:bg-slate-800 text-sage-700 dark:text-mint-50"
            placeholder="在这里写 Markdown... 图片直接粘贴即可上传"
          />
        </div>
        <div className="flex flex-col">
          <div className="px-4 py-2 bg-mint-50/50 dark:bg-mint-900/20 text-xs text-sage-700/60 dark:text-mint-100/50 border-b border-mint-100 dark:border-mint-800">实时预览</div>
          <div className="markdown-body p-4 overflow-auto min-h-[480px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* 底部按钮区（V2 新增"保存草稿"） */}
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={() => nav(-1)} className="btn-ghost">取消</button>
        <button onClick={() => submit(true)} disabled={submitting} className="btn-ghost !border-dashed">
          {submitting ? '保存中...' : '💾 保存草稿'}
        </button>
        <button onClick={() => submit(false)} disabled={submitting} className="btn-primary">
          {submitting ? '保存中...' : editId ? '🚀 发布更新' : '🚀 直接发布'}
        </button>
      </div>
    </div>
  );
}
