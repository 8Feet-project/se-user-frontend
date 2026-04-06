import { useEffect, useState } from 'react';
import { getReportDetail } from '../api/client';
import { PageShell } from '../components/common/PageShell';
import { Card } from '../components/ui/card';
import type { ReportDetail } from '../types';

export function ReportPreviewPage() {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const detail = await getReportDetail('report-001');
        setReport(detail);
      } catch (error) {
        const reason = error instanceof Error ? error.message : '加载报告失败';
        setMessage(reason);
      }
    };

    void loadData();
  }, []);

  return (
    <PageShell title="报告预览" subtitle="对齐 /api/v1/reports/{report_id} 与引用字段结构。">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-7">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-950">{report?.title ?? '自动生成报告'}</h2>
            <p className="text-sm leading-7 text-slate-600">
              展示字段：report_id、task_id、title、content、citations、created_at。
            </p>
          </section>

          {report ? (
            <div className="rounded-[28px] border border-slate-200/80 bg-slate-50 px-6 py-5">
              <p className="text-sm text-slate-600">report_id: {report.report_id}</p>
              <p className="text-sm text-slate-600">task_id: {report.task_id}</p>
              <p className="mt-3 text-sm text-slate-700">{report.content}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">{message || '暂无报告内容'}</p>
          )}
        </Card>

        <Card className="space-y-5 bg-slate-950 text-white">
          <h3 className="text-xl font-semibold">引用信息</h3>
          <div className="space-y-4 text-sm leading-7 text-slate-300">
            {report?.citations.map((citation) => (
              <div key={citation.citation_id} className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <p>{citation.source_title}</p>
                <p className="mt-1 text-xs text-slate-400">{citation.source_url}</p>
              </div>
            ))}
          </div>
          {report ? <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{report.created_at}</p> : null}
        </Card>
      </div>
    </PageShell>
  );
}
