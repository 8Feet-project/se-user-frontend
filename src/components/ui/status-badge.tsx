import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; className: string }> = {
  // Task statuses
  completed:  { label: '已完成', className: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40' },
  analyzing:  { label: '分析中', className: 'bg-blue-900/30   text-blue-400   border-blue-700/40   animate-pulse' },
  searching:  { label: '检索中', className: 'bg-sky-900/30    text-sky-400    border-sky-700/40    animate-pulse' },
  data_ready: { label: '数据就绪', className: 'bg-teal-900/30  text-teal-400   border-teal-700/40' },
  pending:    { label: '待处理', className: 'bg-slate-800     text-slate-400  border-slate-700' },
  failed:     { label: '失败',   className: 'bg-red-900/30    text-red-400    border-red-700/40' },
  cancelled:  { label: '已取消', className: 'bg-slate-800     text-slate-500  border-slate-700' },
  running:    { label: '进行中', className: 'bg-blue-900/30   text-blue-400   border-blue-700/40   animate-pulse' },

  // Alert statuses
  enabled:  { label: '已启用', className: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40' },
  disabled: { label: '已禁用', className: 'bg-slate-800      text-slate-500  border-slate-700' },

  // Message statuses
  read:   { label: '已读', className: 'bg-slate-800    text-slate-500 border-slate-700' },
  unread: { label: '未读', className: 'bg-[rgba(99,202,183,0.12)] text-[#63cab7] border-[rgba(99,202,183,0.3)]' },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusMap[status] ?? {
    label: status,
    className: 'bg-slate-800 text-slate-400 border-slate-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
