interface Props {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, total, pageSize, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 rounded-lg text-sm border border-mint-200 disabled:opacity-40 hover:bg-mint-50 text-sage-700"
      >上一页</button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-sm transition ${
            p === page ? 'bg-mint-400 text-white shadow-soft' : 'border border-mint-200 text-sage-700 hover:bg-mint-50'
          }`}
        >{p}</button>
      ))}
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 rounded-lg text-sm border border-mint-200 disabled:opacity-40 hover:bg-mint-50 text-sage-700"
      >下一页</button>
    </div>
  );
}
