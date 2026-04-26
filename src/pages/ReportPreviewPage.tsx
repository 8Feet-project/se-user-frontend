import { Download, FileText, MessageSquareMore, Quote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { appendReportQa, createReportQa, getReportDetail, getReportQa, getReports } from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { downloadReport } from '@/lib/exportReport';
import type { ReportDetail, ReportListItem, ReportQaItem } from '@/types';

const isValidReportId = (value: string | null | undefined) => Boolean(value && /^\d+$/.test(value));

export function ReportPreviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialReportId = searchParams.get('report_id');
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [reportId, setReportId] = useState(isValidReportId(initialReportId) ? initialReportId ?? '' : '');
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [qaList, setQaList] = useState<ReportQaItem[]>([]);
  const [qaQuestion, setQaQuestion] = useState('');
  const [appendInputs, setAppendInputs] = useState<Record<string, string>>({});
  const [submittingQa, setSubmittingQa] = useState(false);
  const [appendingQaId, setAppendingQaId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'md' | 'html'>('pdf');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await getReports({ page: 1, page_size: 50 });
        setReports(response.list);

        const reportIdFromUrl = searchParams.get('report_id');
        const validReportIdFromUrl = isValidReportId(reportIdFromUrl) ? reportIdFromUrl ?? '' : '';
        if (validReportIdFromUrl) {
          setReportId(validReportIdFromUrl);
          return;
        }

        const fallbackId = response.list.find((item) => isValidReportId(item.report_id))?.report_id ?? '';
        setReportId(fallbackId);
        if (fallbackId) {
          setSearchParams({ report_id: fallbackId }, { replace: true });
        } else if (reportIdFromUrl) {
          setSearchParams({}, { replace: true });
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : '加载报告列表失败';
        setMessage(reason);
      }
    };

    void loadReports();
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!reportId) {
      setReport(null);
      setQaList([]);
      return;
    }

    const loadData = async () => {
      try {
        const [detail, qaResponse] = await Promise.all([getReportDetail(reportId), getReportQa(reportId)]);
        setReport(detail);
        setQaList(qaResponse.list);
      } catch (error) {
        const reason = error instanceof Error ? error.message : '加载报告失败';
        setMessage(reason);
      }
    };

    void loadData();
  }, [reportId]);

  const handleChangeReport = (nextReportId: string) => {
    if (nextReportId && !isValidReportId(nextReportId)) {
      setMessage('报告 ID 无效，请重新选择报告。');
      return;
    }

    setReportId(nextReportId);
    setQaQuestion('');
    setAppendInputs({});
    if (nextReportId) {
      setSearchParams({ report_id: nextReportId }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleCreateQa = async () => {
    const question = qaQuestion.trim();
    if (!question || !reportId) {
      setMessage('请选择报告并输入追问内容。');
      return;
    }

    setSubmittingQa(true);
    setMessage('');
    try {
      const response = await createReportQa(reportId, { question });
      setQaList((prev) => [response.qa, ...prev]);
      setQaQuestion('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '提交追问失败';
      setMessage(reason);
    } finally {
      setSubmittingQa(false);
    }
  };

  const handleAppendQa = async (qaId: string) => {
    const appendText = (appendInputs[qaId] ?? '').trim();
    if (!appendText || !reportId) {
      setMessage('请选择报告并输入追加追问内容。');
      return;
    }

    setAppendingQaId(qaId);
    setMessage('');
    try {
      const response = await appendReportQa(reportId, qaId, { append_text: appendText });
      setQaList((prev) => prev.map((item) => (item.qa_id === qaId ? response.qa : item)));
      setAppendInputs((prev) => ({ ...prev, [qaId]: '' }));
    } catch (error) {
      const reason = error instanceof Error ? error.message : '追加追问失败';
      setMessage(reason);
    } finally {
      setAppendingQaId(null);
    }
  };

  const handleExportReport = () => {
    if (!report) {
      setMessage('请先选择报告。');
      return;
    }

    setExporting(true);
    setMessage('');
    try {
      downloadReport(report, exportFormat);
      if (exportFormat !== 'pdf') {
        setMessage('报告导出成功，下载已开始。');
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : '报告导出失败';
      setMessage(reason);
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageShell
      title="调研报告"
      subtitle="查看、导出和继续追问 AI 生成的调研报告，引用区与追问流全部按 8Feet 的卡片层级重新组织。"
      action={
        <Button variant="secondary" disabled={exporting || !reportId} onClick={handleExportReport}>
          <Download size={16} />
          {exporting ? '导出中...' : '导出当前报告'}
        </Button>
      }
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="space-y-8">
          <Card className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_140px_auto] lg:items-end">
              <div>
                <Label htmlFor="report-selector">切换报告</Label>
                <Select id="report-selector" value={reportId} onChange={(event) => handleChangeReport(event.target.value)} disabled={reports.length === 0}>
                  {reports.length === 0 ? <option value="">暂无报告</option> : null}
                  {reports.map((item) => (
                    <option key={item.report_id} value={item.report_id}>
                      {item.title} ({item.report_id})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="report-export-format">导出格式</Label>
                <Select id="report-export-format" value={exportFormat} onChange={(event) => setExportFormat(event.target.value as 'pdf' | 'md' | 'html')} size="sm" disabled={exporting}>
                  <option value="pdf">PDF</option>
                  <option value="md">Markdown</option>
                  <option value="html">HTML</option>
                </Select>
              </div>
              <Button type="button" variant="secondary" onClick={handleExportReport} disabled={exporting || !reportId}>
                {exporting ? '导出中...' : '下载报告'}
              </Button>
            </div>

            <div className="space-y-3">
              <p className="page-kicker">Report Preview</p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-100">{report?.title ?? '调研报告'}</h2>
              {report ? (
                <div className="flex flex-wrap gap-2">
                  <span className="data-pill">报告 ID：{report.report_id}</span>
                  <span className="data-pill">来源任务：{report.task_id}</span>
                  <span className="data-pill">创建时间：{report.created_at}</span>
                </div>
              ) : null}
            </div>

            {report ? (
              <div className="panel-subtle px-6 py-5">
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                  <FileText size={16} className="text-[#63cab7]" />
                  正文内容
                </div>
                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{report.content}</div>
              </div>
            ) : (
              <div className="panel-subtle p-5 text-sm text-slate-500">{message || '暂无报告内容，请先从任务流程或历史记录进入具体报告。'}</div>
            )}
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <MessageSquareMore size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">报告深度追问</h3>
            </div>

            <div className="space-y-3">
              <Textarea value={qaQuestion} onChange={(event) => setQaQuestion(event.target.value)} placeholder="请输入你希望继续追问的内容，例如：请拆解该公司下一阶段的增长驱动因素。" className="min-h-[110px]" />
              <div className="flex justify-end">
                <Button type="button" onClick={() => void handleCreateQa()} disabled={submittingQa || !reportId}>
                  {submittingQa ? '提交中...' : '提交追问'}
                </Button>
              </div>
            </div>

            {qaList.length > 0 ? (
              <div className="space-y-4">
                {qaList.map((qa) => (
                  <div key={qa.qa_id} className="panel-subtle p-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-semibold text-slate-100">Q: {qa.question}</p>
                      <StatusBadge status={qa.status} />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">A: {qa.answer}</p>
                    <p className="mt-3 text-xs text-slate-500">更新时间：{qa.updated_at}</p>
                    <div className="mt-4 space-y-2">
                      <Textarea
                        value={appendInputs[qa.qa_id] ?? ''}
                        onChange={(event) =>
                          setAppendInputs((prev) => ({
                            ...prev,
                            [qa.qa_id]: event.target.value,
                          }))
                        }
                        placeholder="继续补充这个问题的范围、约束或你最关心的视角。"
                        className="min-h-[88px]"
                      />
                      <div className="flex justify-end">
                        <Button type="button" size="sm" variant="secondary" disabled={appendingQaId === qa.qa_id || !reportId} onClick={() => void handleAppendQa(qa.qa_id)}>
                          {appendingQaId === qa.qa_id ? '追加中...' : '追加追问'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel-subtle p-5 text-sm text-slate-500">暂时没有追问记录。</div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="glow" className="space-y-5">
            <div className="flex items-center gap-2">
              <Quote size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">引用信息</h3>
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-400">
              {report?.citations.length ? (
                report.citations.map((citation) => (
                  <div key={citation.citation_id} className="panel-subtle p-4">
                    <p className="font-medium text-slate-100">{citation.source_title}</p>
                    <p className="mt-2 break-all text-xs text-[#63cab7]/80">{citation.source_url}</p>
                  </div>
                ))
              ) : (
                <div className="panel-subtle p-4 text-sm text-slate-500">当前报告暂无引用信息。</div>
              )}
            </div>
          </Card>


        </div>
      </div>

      {message ? <div className="message-strip mt-6">{message}</div> : null}
    </PageShell>
  );
}
