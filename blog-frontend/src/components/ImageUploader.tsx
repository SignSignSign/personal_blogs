import { useEffect, useRef, useState } from 'react';
import { uploadApi } from '../utils/api';

/**
 * 封面图上传组件：点击上传 or 粘贴 or 拖拽图片文件
 * 成功后把返回的 url 填到 onChange
 */
export default function ImageUploader({ value, onChange, placeholder }: { value: string; onChange: (url: string) => void; placeholder?: string }) {
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setPreview(value || null); }, [value]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { alert('请选择图片'); return; }
    setBusy(true);
    try {
      const r = await uploadApi.post(file);
      onChange(r.url);
      setPreview(r.url);
    } catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed p-3 transition ${
        dragOver ? 'border-mint-400 bg-mint-50 dark:bg-mint-900/20' : 'border-mint-200 dark:border-mint-800'
      } bg-white dark:bg-slate-800`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragOver(false);
        const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
      }}
    >
      {preview ? (
        <div className="relative group">
          <img src={preview.startsWith('http') ? preview : preview} alt="封面预览"
            onError={(e) => { (e.target as HTMLImageElement).src = ''; setPreview(null); onChange(''); }}
            className="w-full h-36 object-cover rounded-lg" />
          <button
            onClick={() => { setPreview(null); onChange(''); }}
            className="absolute top-1 right-1 bg-white/90 text-xs px-2 py-1 rounded text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 transition shadow"
          >✕ 移除</button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-24 text-sage-700/60 dark:text-mint-100/50 text-sm cursor-pointer gap-1">
          <span className="text-2xl">🖼️</span>
          <span>{busy ? '上传中...' : placeholder || '点击 / 拖拽 / 粘贴上传封面图（jpg/png/webp, ≤5MB）'}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]; if (f) handleFile(f);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}

/**
 * Markdown 编辑器辅助：粘贴/拖拽图片自动上传并替换为 ![](url) 插入光标位置
 * 用法：在 textarea 的 onPaste/onDrop 中调用
 */
export async function handleMarkdownImage(
  e: React.ClipboardEvent | React.DragEvent,
  getTextarea: () => HTMLTextAreaElement | null,
  setContent: (updater: (s: string) => string) => void
): Promise<boolean> {
  let files: FileList | null = null;
  if ((e as React.ClipboardEvent).clipboardData) {
    files = (e as React.ClipboardEvent).clipboardData.files;
  } else if ((e as React.DragEvent).dataTransfer) {
    files = (e as React.DragEvent).dataTransfer.files;
  }
  if (!files || !files.length) return false;
  const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
  if (!imgs.length) return false;

  e.preventDefault();
  const ta = getTextarea(); if (!ta) return false;

  const urls: string[] = [];
  for (const f of imgs) {
    try {
      const r = await uploadApi.post(f);
      urls.push(r.url);
    } catch (e: any) {
      alert(`上传失败：${e.message}`);
    }
  }

  if (urls.length) {
    const insert = urls.map((u) => `\n![上传图片](${u})`).join('');
    const { selectionStart, selectionEnd } = ta;
    setContent((old) => old.slice(0, selectionStart) + insert + old.slice(selectionEnd));
    // 恢复光标到末尾
    requestAnimationFrame(() => {
      ta.focus();
      const pos = selectionStart + insert.length;
      ta.setSelectionRange(pos, pos);
    });
  }
  return true;
}
