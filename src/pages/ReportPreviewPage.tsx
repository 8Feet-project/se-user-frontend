import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appendReportQa, createReportQa, getReportDetail, getReportQa, getReports } from '../api/client';
import { downloadReport } from '../lib/exportReport';
import { PageShell } from '../components/common/PageShell';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import type { ReportDetail, ReportListItem, ReportQaItem } from '../types';

export function ReportPreviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [reportId, setReportId] = useState(searchParams.get('report_id') ?? '');
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
        if (reportIdFromUrl) {
          setReportId(reportIdFromUrl);
          return;
        }

        const fallbackId = response.list[0]?.report_id ?? '';
        setReportId(fallbackId);
        if (fallbackId) {
          setSearchParams({ report_id: fallbackId }, { replace: true });
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
        setMessage('报告导出成功，已开始下载。');
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : '报告导出失败';
      setMessage(reason);
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageShell title="报告预览" subtitle="对齐报告、引用与深度追问接口。">
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <Card className="space-y-7">
            <section className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[80px_1fr] md:items-center">
                <p className="text-sm font-medium text-slate-700">切换报告</p>
                <Select
                  value={reportId}
                  onChange={(event) => handleChangeReport(event.target.value)}
                  disabled={reports.length === 0}
                  // className="w-50"
                >
                  {reports.length === 0 ? <option value="">暂无报告</option> : null}
                  {reports.map((item) => (
                    <option key={item.report_id} value={item.report_id}>
                      {item.title} ({item.report_id})
                    </option>
                  ))}
                </Select>
              </div>

              <h2 className="text-2xl font-semibold text-slate-950">{report?.title ?? '自动生成报告'}</h2>
              <p className="text-sm leading-7 text-slate-600">
                展示字段：report_id、task_id、title、content、citations、created_at。
              </p>

              {report ? (
                <div className="flex items-center gap-3 pt-1">
                  <Select
                    value={exportFormat}
                    onChange={(event) => setExportFormat(event.target.value as 'pdf' | 'md' | 'html')}
                    disabled={exporting}
                  >
                    <option value="pdf">PDF</option>
                    <option value="md">Markdown</option>
                    <option value="html">HTML</option>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    disabled={exporting || !reportId}
                    onClick={() => handleExportReport()}
                  >
                    {exporting ? '导出中...' : '下载报告'}
                  </Button>
                </div>
              ) : null}
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

          <Card className="space-y-5">
            <h3 className="text-xl font-semibold text-slate-950">报告深度追问</h3>
            <div className="space-y-3">
              <Textarea
                value={qaQuestion}
                onChange={(event) => setQaQuestion(event.target.value)}
                placeholder="请输入你希望进一步追问的问题"
                className="min-h-[96px]"
              />
              <div className="flex justify-end">
                <Button type="button" size="sm" disabled={submittingQa || !reportId} onClick={() => void handleCreateQa()}>
                  {submittingQa ? '提交中...' : '提交追问'}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {qaList.map((qa) => (
                <div key={qa.qa_id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Q: {qa.question}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">A: {qa.answer}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {qa.status} | {qa.updated_at}
                  </p>
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={appendInputs[qa.qa_id] ?? ''}
                      onChange={(event) =>
                        setAppendInputs((prev) => ({
                          ...prev,
                          [qa.qa_id]: event.target.value,
                        }))
                      }
                      placeholder="对这个问答继续追问"
                      className="min-h-[72px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={appendingQaId === qa.qa_id || !reportId}
                        onClick={() => void handleAppendQa(qa.qa_id)}
                      >
                        {appendingQaId === qa.qa_id ? '追加中...' : '追加追问'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {qaList.length === 0 ? <p className="text-sm text-slate-500">暂无追问记录。</p> : null}
            </div>
          </Card>
        </div>

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

      {message ? <p className="mt-4 text-sm text-red-600">{message}</p> : null}
    </PageShell>
  );
}
