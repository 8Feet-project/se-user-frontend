import { PageShell } from '../components/common/PageShell';
import { Card } from '../components/ui/card';
import { mockTasks, mockReports } from '../api/mock';

export function HistoryFavoritesPage() {
  return (
    <PageShell title="历史与收藏" subtitle="回溯已完成任务与报告，快速访问常用调研模板与结果。">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.95fr]">
        <Card className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-950">调研历史</h2>
            <p className="text-sm leading-7 text-slate-600">通过历史记录快速复用已完成任务，并保持数据可追溯。</p>
          </div>

          <div className="grid gap-4">
            {mockTasks.map((task) => (
              <div key={task.id} className="rounded-[28px] border border-slate-200/80 bg-slate-50 px-5 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{task.title}</p>
                    <p className="text-sm text-slate-600">{task.objectType === 'company' ? '公司对象' : task.objectType === 'stock' ? '股票对象' : '产品对象'}</p>
                  </div>
                  <span className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-600">
                    {task.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">提交时间：{task.requestedAt}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-6 bg-slate-950 text-white">
          <div>
            <h3 className="text-xl font-semibold">报告收藏</h3>
            <p className="mt-2 text-sm text-slate-300">保存重要报告摘要，便于后续快速查阅。</p>
          </div>
          <div className="space-y-4">
            {mockReports.map((report) => (
              <div key={report.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <p className="font-semibold text-white">{report.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{report.summary}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">{report.createdAt}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
