import { useEffect, useState } from 'react';
import { getReportDetail, getResearchHistory } from '../api/client';
import { PageShell } from '../components/common/PageShell';
import { Card } from '../components/ui/card';
import type { HistoryTaskItem, ReportDetail } from '../types';

function objectTypeLabel(type: HistoryTaskItem['object_type']) {
  if (type === 'company') return '公司对象';
  if (type === 'stock') return '股票对象';
  return '商品对象';
}

export function HistoryFavoritesPage() {
  const [tasks, setTasks] = useState<HistoryTaskItem[]>([]);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const history = await getResearchHistory({ page: 1, page_size: 10 });
        setTasks(history.list);
        if (history.list[0]?.report_id) {
          const reportDetail = await getReportDetail(history.list[0].report_id);
          setReport(reportDetail);
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : '加载历史失败';
        setMessage(reason);
      }
    };

    void loadData();
  }, []);

  return (
    <PageShell title="历史与收藏" subtitle="对齐 /api/v1/research/history 与 /api/v1/reports/{report_id} 数据结构。">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.95fr]">
        <Card className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-950">调研历史</h2>
            <p className="text-sm leading-7 text-slate-600">展示字段：task_id、object_name、object_type、status、created_at。</p>
          </div>

          <div className="grid gap-4">
            {tasks.map((task) => (
              <div key={task.task_id} className="rounded-[28px] border border-slate-200/80 bg-slate-50 px-5 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{task.object_name}</p>
                    <p className="text-sm text-slate-600">{objectTypeLabel(task.object_type)}</p>
                    <p className="text-xs text-slate-500">task_id: {task.task_id}</p>
                  </div>
                  <span className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-600">
                    {task.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">提交时间：{task.created_at}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-6 bg-slate-950 text-white">
          <div>
            <h3 className="text-xl font-semibold">报告收藏</h3>
            <p className="mt-2 text-sm text-slate-300">展示 /api/v1/reports/{'{report_id}'} 返回内容与引用摘要。</p>
          </div>
          {report ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <p className="font-semibold text-white">{report.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{report.content}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">{report.created_at}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <p className="font-semibold text-white">引用来源</p>
                <div className="mt-3 space-y-2">
                  {report.citations.map((citation) => (
                    <p key={citation.citation_id} className="text-sm text-slate-300">
                      {citation.source_title}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-300">{message || '暂无报告数据'}</p>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
