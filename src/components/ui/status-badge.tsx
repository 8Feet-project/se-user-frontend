import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; className: string }> = {
  completed: {
    label: '已完成',
    className: 'border-emerald-700/40 bg-emerald-900/30 text-emerald-400',
  },
  analyzing: {
    label: '分析中',
    className: 'border-blue-700/40 bg-blue-900/30 text-blue-400 animate-pulse',
  },
  searching: {
    label: '检索中',
    className: 'border-sky-700/40 bg-sky-900/30 text-sky-400 animate-pulse',
  },
  data_ready: {
    label: '数据就绪',
    className: 'border-teal-700/40 bg-teal-900/30 text-teal-400',
  },
  pending: {
    label: '待处理',
    className: 'border-slate-700 bg-slate-800 text-slate-400',
  },
  failed: {
    label: '失败',
    className: 'border-red-700/40 bg-red-900/30 text-red-400',
  },
  cancelled: {
    label: '已取消',
    className: 'border-slate-700 bg-slate-800 text-slate-500',
  },
  running: {
    label: '进行中',
    className: 'border-blue-700/40 bg-blue-900/30 text-blue-400 animate-pulse',
  },
  enabled: {
    label: '已启用',
    className: 'border-emerald-700/40 bg-emerald-900/30 text-emerald-400',
  },
  disabled: {
    label: '已禁用',
    className: 'border-slate-700 bg-slate-800 text-slate-500',
  },
  read: {
    label: '已读',
    className: 'border-slate-700 bg-slate-800 text-slate-500',
  },
  unread: {
    label: '未读',
    className: 'border-[rgba(99,202,183,0.3)] bg-[rgba(99,202,183,0.12)] text-[#63cab7]',
  },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusMap[status] ?? {
    label: status,
    className: 'border-slate-700 bg-slate-800 text-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
