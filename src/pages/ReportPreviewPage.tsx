import { Download, ExternalLink, FileText, MessageSquareMore, Quote, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  appendReportQa,
  createFavoriteItem,
  createReportQa,
  exportReport,
  getReportCitationDetail,
  getReportCitations,
  getReportDetail,
  getReportExportStatus,
  getReportQa,
  getReports,
} from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { downloadReport } from '@/lib/exportReport';
import type { ReportCitation, ReportCitationDetail, ReportDetail, ReportListItem, ReportQaItem } from '@/types';

const isValidReportId = (value: string | null | undefined) => Boolean(value?.trim());
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function triggerDownload(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function ReportPreviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const reportIdFromUrl = searchParams.get('report_id');
  const taskIdFromUrl = searchParams.get('task_id');
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [reportId, setReportId] = useState(isValidReportId(reportIdFromUrl) ? reportIdFromUrl ?? '' : '');
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [citations, setCitations] = useState<ReportCitation[]>([]);
  const [citationDetail, setCitationDetail] = useState<ReportCitationDetail | null>(null);
  const [loadingCitationId, setLoadingCitationId] = useState<string | null>(null);
  const [qaList, setQaList] = useState<ReportQaItem[]>([]);
  const [qaQuestion, setQaQuestion] = useState('');
  const [appendInputs, setAppendInputs] = useState<Record<string, string>>({});
  const [submittingQa, setSubmittingQa] = useState(false);
  const [appendingQaId, setAppendingQaId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'md' | 'html'>('pdf');
  const [exporting, setExporting] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  const replaceSearchParams = (updates: Partial<Record<'report_id' | 'task_id', string | null | undefined>>) => {
    const nextParams = new URLSearchParams(searchParams);
    let changed = false;

    (Object.entries(updates) as Array<['report_id' | 'task_id', string | null | undefined]>).forEach(([key, value]) => {
      const normalizedValue = value?.trim() ?? '';
      const currentValue = nextParams.get(key) ?? '';

      if (normalizedValue) {
        if (currentValue !== normalizedValue) {
          nextParams.set(key, normalizedValue);
          changed = true;
        }
        return;
      }

      if (currentValue) {
        nextParams.delete(key);
        changed = true;
      }
    });

    if (changed) {
      setSearchParams(nextParams, { replace: true });
    }
  };

  const resetReportTransientState = () => {
    setQaQuestion('');
    setAppendInputs({});
    setCitationDetail(null);
  };

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await getReports({ page: 1, page_size: 50 });
        setReports(response.list);
      } catch (error) {
        const reason = error instanceof Error ? error.message : '加载报告列表失败';
        setMessage(reason);
      }
    };

    void loadReports();
  }, []);

  useEffect(() => {
    const validReportIdFromUrl = isValidReportId(reportIdFromUrl) ? reportIdFromUrl ?? '' : '';
    if (validReportIdFromUrl) {
      if (reportId !== validReportIdFromUrl) {
        setReportId(validReportIdFromUrl);
        resetReportTransientState();
      }
      return;
    }

    if (reports.length === 0) {
      if (reportId) {
        setReportId('');
        resetReportTransientState();
      }
      return;
    }

    const reportFromTask = taskIdFromUrl ? reports.find((item) => item.task_id === taskIdFromUrl)?.report_id ?? '' : '';
    const firstAvailableReportId = reports.find((item) => isValidReportId(item.report_id))?.report_id ?? '';
    const fallbackId = reportFromTask || firstAvailableReportId;

    if (reportId !== fallbackId) {
      setReportId(fallbackId);
      resetReportTransientState();
    }

    if (fallbackId) {
      replaceSearchParams({ report_id: fallbackId });
    } else if (reportIdFromUrl) {
      replaceSearchParams({ report_id: null });
    }
  }, [reportId, reportIdFromUrl, reports, taskIdFromUrl]);

  useEffect(() => {
    if (!reportId) {
      setReport(null);
      setQaList([]);
      setCitations([]);
      setCitationDetail(null);
      return;
    }

    const loadData = async () => {
      try {
        const [detail, qaResponse, citationResponse] = await Promise.all([
          getReportDetail(reportId),
          getReportQa(reportId),
          getReportCitations(reportId),
        ]);
        setReport(detail);
        setQaList(qaResponse.list);
        setCitations(citationResponse.list);
        setCitationDetail(null);
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
    resetReportTransientState();
    if (nextReportId) {
      const nextReport = reports.find((item) => item.report_id === nextReportId);
      replaceSearchParams({
        report_id: nextReportId,
        task_id: nextReport?.task_id ?? taskIdFromUrl ?? null,
      });
    } else {
      replaceSearchParams({ report_id: null });
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

  const handleShowCitationDetail = async (citation: ReportCitation) => {
    if (!reportId) return;
    setLoadingCitationId(citation.citation_id);
    setMessage('');
    try {
      const detail = await getReportCitationDetail(reportId, citation.citation_id);
      setCitationDetail(detail);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '加载引用详情失败';
      setMessage(reason);
    } finally {
      setLoadingCitationId(null);
    }
  };

  const handleFavoriteReport = async () => {
    if (!report) {
      setMessage('请先选择报告。');
      return;
    }
    setFavoriting(true);
    setMessage('');
    try {
      await createFavoriteItem({
        favorite_type: 'report',
        target_id: report.report_id,
        remark: report.title,
      });
      setMessage(`已收藏报告：${report.report_id}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '收藏报告失败';
      setMessage(reason);
    } finally {
      setFavoriting(false);
    }
  };

  const handleExportReport = async () => {
    if (!report) {
      setMessage('请先选择报告。');
      return;
    }

    setExporting(true);
    setMessage('');
    try {
      if (exportFormat === 'md' || exportFormat === 'html') {
        downloadReport(report, exportFormat);
        setMessage('报告导出成功，下载已开始。');
        return;
      }

      const exportTask = await exportReport(report.report_id, { format: exportFormat, include_citations: true });
      setMessage(`导出任务已创建：${exportTask.export_id}，正在生成下载链接...`);

      for (let attempt = 0; attempt < 30; attempt += 1) {
        const status = await getReportExportStatus(exportTask.export_id);
        if (status.status === 'completed') {
          if (!status.download_url) {
            throw new Error('导出完成但未返回下载链接。');
          }
          triggerDownload(status.download_url);
          setMessage(`报告导出完成，下载链接${status.expires_at ? `有效期至 ${status.expires_at}` : '已打开'}。`);
          return;
        }
        if (status.status === 'failed') {
          throw new Error(status.error_message || '报告导出失败');
        }
        await wait(1000);
      }

      throw new Error('导出仍在处理中，请稍后重试。');
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
      action={
        <Button variant="secondary" disabled={exporting || !reportId} onClick={() => void handleExportReport()}>
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
                <Select id="report-export-format" value={exportFormat} onChange={(event) => setExportFormat(event.target.value as 'pdf' | 'docx' | 'md' | 'html')} size="sm" disabled={exporting}>
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="md">Markdown</option>
                  <option value="html">HTML</option>
                </Select>
              </div>
              <Button type="button" variant="secondary" onClick={() => void handleExportReport()} disabled={exporting || !reportId}>
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
                  <Button type="button" size="sm" variant="secondary" disabled={favoriting} onClick={() => void handleFavoriteReport()}>
                    <Star size={14} />
                    {favoriting ? '收藏中...' : '收藏'}
                  </Button>
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

        </div>

        <div className="space-y-6">
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

          <Card variant="glow" className="space-y-5">
            <div className="flex items-center gap-2">
              <Quote size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">引用信息</h3>
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-400">
              {citations.length ? (
                citations.map((citation) => (
                  <div key={citation.citation_id} className="panel-subtle p-4">
                    <p className="font-medium text-slate-100">{citation.source_title}</p>
                    {citation.source_url ? (
                      <a className="mt-2 inline-flex items-center gap-1 break-all text-xs text-[#63cab7]/80 hover:text-[#63cab7]" href={citation.source_url} target="_blank" rel="noopener noreferrer">
                        {citation.source_url}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <p className="mt-2 text-xs text-amber-300">来源不足</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => void handleShowCitationDetail(citation)} disabled={loadingCitationId === citation.citation_id}>
                        {loadingCitationId === citation.citation_id ? '加载中...' : '查看详情'}
                      </Button>
                      {citation.source_url ? (
                        <Button type="button" size="sm" variant="secondary" onClick={() => triggerDownload(citation.source_url)}>
                          打开来源
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="panel-subtle p-4 text-sm text-amber-300">来源不足</div>
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">引用详情</h3>
            </div>
            {citationDetail ? (
              <div className="panel-subtle space-y-3 p-4 text-sm leading-7 text-slate-300">
                <p className="font-medium text-slate-100">{citationDetail.source_title}</p>
                <p><span className="text-slate-500">类型：</span>{citationDetail.source_type ?? '未知'}</p>
                <p><span className="text-slate-500">发布时间：</span>{citationDetail.published_at ?? '未知'}</p>
                {citationDetail.excerpt ? <p><span className="text-slate-500">摘录：</span>{citationDetail.excerpt}</p> : null}
                {citationDetail.source_url ? (
                  <a className="inline-flex items-center gap-1 break-all text-[#63cab7] hover:text-[#8ce5d6]" href={citationDetail.source_url} target="_blank" rel="noopener noreferrer">
                    打开来源链接
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <p className="text-amber-300">来源不足</p>
                )}
              </div>
            ) : (
              <div className="panel-subtle p-4 text-sm text-slate-500">选择一条引用查看详情；没有可用来源时会提示“来源不足”。</div>
            )}
          </Card>


        </div>
      </div>

      {message ? <div className="message-strip mt-6">{message}</div> : null}
    </PageShell>
  );
}
