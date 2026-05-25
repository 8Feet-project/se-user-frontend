import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, RefreshCw, Search } from 'lucide-react';
import {
  exportAdminLogs,
  getAdminLogDetail,
  getAdminLogExportStatus,
  getAdminLogs,
  getAdminModels,
} from '../api/client';
import { buildApiUrl } from '../api/http';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { MultiSelect } from '../components/ui/multi-select';
import { Select } from '../components/ui/select';
import type { AdminLogDetail, AdminLogLevel, AdminLogListItem, AdminModelItem } from '../types';

const fixedLogLevels: Array<{ label: string; value: AdminLogLevel }> = [
  { label: 'debug', value: 'debug' },
  { label: 'info', value: 'info' },
  { label: 'warning', value: 'warning' },
  { label: 'error', value: 'error' },
];

const fixedObjectTypes = [
  { label: '公司', value: 'company' },
  { label: '股票', value: 'stock' },
  { label: '商品', value: 'commodity' },
];

const fixedModules = [
  { label: '模型管理', value: 'admin.model' },
  { label: '调研任务', value: 'research.task' },
  { label: '模型调用', value: 'model_usage' },
  { label: '系统运行', value: 'system' },
];

type TimeMode = 'point' | 'range';

interface LogFilterState {
  levels: AdminLogLevel[];
  users: string[];
  modelIds: string[];
  modules: string[];
  objectTypes: Array<'company' | 'stock' | 'commodity'>;
  timeMode: TimeMode;
  pointDate: string;
  rangeStartDate: string;
  rangeEndDate: string;
}

const defaultPageSize = 10;

export function AdminLogsPage() {
  const today = getTodayDate();
  const [logs, setLogs] = useState<AdminLogListItem[]>([]);
  const [models, setModels] = useState<AdminModelItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<AdminLogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportStatusText, setExportStatusText] = useState('');
  const [exportDownloadUrl, setExportDownloadUrl] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const hasLoadedLogs = useRef(false);
  const [filters, setFilters] = useState<LogFilterState>({
    levels: [],
    users: [],
    modelIds: [],
    modules: [],
    objectTypes: [],
    timeMode: 'point',
    pointDate: today,
    rangeStartDate: today,
    rangeEndDate: today,
  });

  const timeRange = useMemo(() => {
    if (filters.timeMode === 'point') {
      const date = filters.pointDate || today;
      return { start: startOfDayIso(date), end: endOfDayIso(date) };
    }
    const startDate = filters.rangeStartDate || today;
    const endDate = filters.rangeEndDate || startDate;
    return { start: startOfDayIso(startDate), end: endOfDayIso(endDate) };
  }, [filters.pointDate, filters.rangeEndDate, filters.rangeStartDate, filters.timeMode, today]);

  const userOptions = useMemo(() => {
    const unique = Array.from(new Set([...filters.users, ...logs.map((item) => item.user_keyword).filter(Boolean)]));
    return unique.map((item) => ({ label: item, value: item }));
  }, [filters.users, logs]);

  const modelOptions = useMemo(() => {
    const options = new Map<string, { label: string; value: string }>();
    models.forEach((item) => {
      options.set(item.model_id, { label: `${item.model_name} (${item.provider})`, value: item.model_id });
    });
    logs.forEach((item) => {
      if (item.model_id && !options.has(item.model_id)) {
        options.set(item.model_id, {
          label: `${item.model_name || `模型 ${item.model_id}`}（历史）`,
          value: item.model_id,
        });
      }
    });
    return Array.from(options.values());
  }, [logs, models]);

  const levelOptions = useMemo(() => fixedLogLevels.map((item) => ({ label: item.label, value: item.value })), []);
  const objectTypeOptions = useMemo(() => fixedObjectTypes.map((item) => ({ label: item.label, value: item.value })), []);

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [logsResponse, modelsResponse] = await Promise.all([
        getAdminLogs(buildLogQueryParams(1, 200)),
        getAdminModels(),
      ]);
      setLogs(logsResponse.list);
      setModels(modelsResponse.list);
      if (logsResponse.list[0]) {
        void handleSelectLog(logsResponse.list[0].log_id);
      } else {
        setSelectedLog(null);
      }
    } finally {
      hasLoadedLogs.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBaseData();
  }, []);

  const handleSelectLog = async (logId: string) => {
    setDetailLoading(true);
    try {
      setSelectedLog(await getAdminLogDetail(logId));
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const createdAt = new Date(item.created_at).getTime();
      const rangeStart = new Date(timeRange.start).getTime();
      const rangeEnd = new Date(timeRange.end).getTime();
      if (Number.isFinite(rangeStart) && Number.isFinite(rangeEnd) && (createdAt < rangeStart || createdAt > rangeEnd)) {
        return false;
      }
      if (filters.levels.length > 0 && !filters.levels.includes(item.level)) {
        return false;
      }
      if (filters.users.length > 0 && !filters.users.includes(item.user_keyword)) {
        return false;
      }
      if (filters.modelIds.length > 0 && (!item.model_id || !filters.modelIds.includes(item.model_id))) {
        return false;
      }
      if (filters.modules.length > 0 && !filters.modules.includes(item.module)) {
        return false;
      }
      if (filters.objectTypes.length > 0 && (!item.object_type || !filters.objectTypes.includes(item.object_type))) {
        return false;
      }
      return true;
    });
  }, [filters, logs, timeRange.end, timeRange.start]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredLogs.length / pageSize)), [filteredLogs.length, pageSize]);
  const pagedLogs = useMemo(() => filteredLogs.slice((page - 1) * pageSize, page * pageSize), [filteredLogs, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!selectedLog || !pagedLogs.some((item) => item.log_id === selectedLog.log_id)) {
      if (pagedLogs[0]) {
        void handleSelectLog(pagedLogs[0].log_id);
      } else {
        setSelectedLog(null);
      }
    }
  }, [pagedLogs, selectedLog]);

  const handlePresetRange = (preset: 'today' | '7d' | '30d') => {
    const end = new Date();
    const endStr = formatDateInput(end);
    if (preset === 'today') {
      setFilters((prev) => ({ ...prev, timeMode: 'point', pointDate: endStr, rangeStartDate: endStr, rangeEndDate: endStr }));
      return;
    }
    const days = preset === '7d' ? 6 : 29;
    const start = new Date();
    start.setDate(end.getDate() - days);
    setFilters((prev) => ({ ...prev, timeMode: 'range', rangeStartDate: formatDateInput(start), rangeEndDate: endStr }));
  };

  const invalidRange = filters.timeMode === 'range' && filters.rangeStartDate && filters.rangeEndDate && filters.rangeStartDate > filters.rangeEndDate;

  const buildLogQueryParams = (targetPage = 1, targetPageSize = 200) => ({
    level: filters.levels.join(',') || undefined,
    user_keyword: filters.users.join(',') || undefined,
    model_id: filters.modelIds.join(',') || undefined,
    module: filters.modules.join(',') || undefined,
    object_type: filters.objectTypes.join(',') || undefined,
    start_time: timeRange.start,
    end_time: timeRange.end,
    page: targetPage,
    page_size: targetPageSize,
  });

  const handleSearch = async () => {
    setSearching(true);
    setExportStatusText('');
    setExportDownloadUrl('');
    setFeedback(null);
    setPage(1);

    if (invalidRange) {
      setSearching(false);
      setFeedback({ tone: 'error', text: '开始时间不能晚于结束时间。' });
      return;
    }

    try {
      const response = await getAdminLogs(buildLogQueryParams(1, 200));
      setLogs(response.list);
      setFeedback({ tone: 'success', text: '查询完成，日志列表已刷新。' });
    } catch (error) {
      setFeedback({ tone: 'error', text: error instanceof Error ? error.message : '查询失败' });
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!hasLoadedLogs.current) {
      return;
    }
    void handleSearch();
  }, [timeRange.start, timeRange.end]);

  const handleExport = async () => {
    if (invalidRange) {
      setFeedback({ tone: 'error', text: '开始时间不能晚于结束时间。' });
      return;
    }

    setExporting(true);
    setExportStatusText('');
    setExportDownloadUrl('');
    try {
      const response = await exportAdminLogs({
        level: filters.levels.join(',') || undefined,
        user_keyword: filters.users.join(',') || undefined,
        model_id: filters.modelIds.join(',') || undefined,
        object_type: filters.objectTypes.join(',') || undefined,
        module: filters.modules.join(',') || undefined,
        start_time: timeRange.start,
        end_time: timeRange.end,
        format: 'csv',
      });
      setExportStatusText(`导出任务已创建：${response.export_id}，状态 ${response.status}。`);

      for (let i = 0; i < 6; i += 1) {
        const status = await getAdminLogExportStatus(response.export_id);
        if (status.status === 'completed') {
          setExportDownloadUrl(status.download_url || '');
          setExportStatusText(status.download_url ? '导出完成，可以下载 CSV 文件。' : '导出完成，请稍后刷新查看下载链接。');
          setFeedback({ tone: 'success', text: '导出成功。' });
          return;
        }
        if (status.status === 'failed') {
          setFeedback({ tone: 'error', text: status.error_message || '导出失败。' });
          return;
        }
        setExportStatusText(`导出处理中：${status.status}`);
      }
    } catch (error) {
      setFeedback({ tone: 'error', text: error instanceof Error ? error.message : '导出失败' });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadExport = async () => {
    if (!exportDownloadUrl) {
      return;
    }
    try {
      const response = await fetch(buildApiUrl(exportDownloadUrl), {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}` },
      });
      if (!response.ok) {
        throw new Error(`下载失败：${response.status}`);
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = resolveDownloadFilename(response.headers.get('content-disposition')) || 'admin-logs.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setFeedback({ tone: 'error', text: error instanceof Error ? error.message : '下载失败' });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 text-slate-100">
      <header className="flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-900/60 p-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">System Logs</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">系统日志排查</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">按时间、级别、操作人、模型、模块或对象类型筛选日志。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void loadBaseData()} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200">
            <RefreshCw className="mr-2 h-4 w-4" />
            {loading ? '刷新中...' : '刷新日志'}
          </Button>
          <Button onClick={() => void handleSearch()} className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" disabled={searching}>
            {searching ? '查询中...' : '查询'}
          </Button>
          <Button onClick={() => void handleExport()} className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400" disabled={exporting}>
            {exporting ? '导出中...' : '导出筛选结果'}
          </Button>
        </div>
      </header>

      {feedback ? <Feedback tone={feedback.tone} text={feedback.text} /> : null}
      {exportStatusText ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
          <span>{exportStatusText}</span>
          {exportDownloadUrl ? (
            <Button size="sm" variant="secondary" className="rounded-xl bg-slate-800 text-slate-100" onClick={() => void handleDownloadExport()}>
              <Download className="mr-2 h-4 w-4" />
              下载 CSV
            </Button>
          ) : null}
        </div>
      ) : null}

      <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
        <div className="grid items-start gap-4 xl:grid-cols-4">
          <FilterDateControls filters={filters} setFilters={setFilters} handlePresetRange={handlePresetRange} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FilterSelect label="日志级别" options={levelOptions} value={filters.levels} onValueChange={(values) => setFilters((prev) => ({ ...prev, levels: values as AdminLogLevel[] }))} placeholder="选择日志级别" />
          <FilterSelect label="操作人" options={userOptions} value={filters.users} onValueChange={(values) => setFilters((prev) => ({ ...prev, users: values }))} placeholder="选择操作人" />
          <FilterSelect label="大模型" options={modelOptions} value={filters.modelIds} onValueChange={(values) => setFilters((prev) => ({ ...prev, modelIds: values }))} placeholder="选择模型" />
          <FilterSelect label="模块" options={fixedModules} value={filters.modules} onValueChange={(values) => setFilters((prev) => ({ ...prev, modules: values }))} placeholder="选择模块" />
          <FilterSelect label="对象类型" options={objectTypeOptions} value={filters.objectTypes} onValueChange={(values) => setFilters((prev) => ({ ...prev, objectTypes: values as Array<'company' | 'stock' | 'commodity'> }))} placeholder="选择对象类型" />
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-xs leading-6 text-slate-400">
            模型调用、模型管理操作和调研失败步骤都会进入该日志视图；删除模型后，历史调用仍显示快照名称。
          </div>
        </div>
      </Card>

      <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="min-h-0 rounded-[28px] border border-slate-800 bg-slate-900/70 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between px-2">
            <div>
              <h2 className="text-lg font-semibold text-white">日志列表</h2>
              <p className="mt-1 text-sm text-slate-400">当前命中 {filteredLogs.length} 条记录，分页显示 {pagedLogs.length} 条</p>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">Multi Filters</Badge>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 365px)' }}>
            {pagedLogs.map((item) => (
              <LogListItem key={item.log_id} item={item} active={selectedLog?.log_id === item.log_id} onClick={() => void handleSelectLog(item.log_id)} />
            ))}
            {pagedLogs.length === 0 ? <EmptyLogs /> : null}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
            <span>第 {page} / {totalPages} 页</span>
            <div className="flex items-center gap-2">
              <Select value={String(pageSize)} onChange={(event) => setPageSize(Number(event.target.value))}>
                <option value="10">每页 10 条</option>
                <option value="20">每页 20 条</option>
                <option value="50">每页 50 条</option>
              </Select>
              <Button size="sm" variant="secondary" className="rounded-xl bg-slate-800 text-slate-200" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>上一页</Button>
              <Button size="sm" variant="secondary" className="rounded-xl bg-slate-800 text-slate-200" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>下一页</Button>
            </div>
          </div>
        </Card>

        <Card className="min-h-0 rounded-[28px] border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">排查详情</h2>
              <p className="mt-1 text-sm text-slate-400">查看日志上下文、提示词、模型返回和错误信息。</p>
            </div>
            <Search className="h-5 w-5 text-slate-500" />
          </div>

          <div className="mt-5 space-y-5 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            {detailLoading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-400">正在加载日志详情...</div>
            ) : selectedLog ? (
              <>
                <DetailSection title="用户动作" content={selectedLog.user_action} />
                <DetailSection title="检索意图" content={selectedLog.search_intent} />
                <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                  <h3 className="text-sm font-semibold text-white">Agent Trace</h3>
                  <div className="mt-4 space-y-3">
                    {selectedLog.agent_trace.map((item, index) => (
                      <div key={`${item.step}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                        <div className="text-sm font-medium text-sky-300">{item.step}</div>
                        <div className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</div>
                      </div>
                    ))}
                  </div>
                </section>
                <DetailSection title="原始 Prompt" content={selectedLog.prompt_raw} code />
                <DetailSection title="模型返回" content={selectedLog.response_raw} code />
                {selectedLog.error_stack ? <DetailSection title="错误信息" content={selectedLog.error_stack} code tone="error" /> : null}
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-10 text-center text-sm text-slate-500">请选择左侧日志查看详情。</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function FilterDateControls({ filters, setFilters, handlePresetRange }: { filters: LogFilterState; setFilters: React.Dispatch<React.SetStateAction<LogFilterState>>; handlePresetRange: (preset: 'today' | '7d' | '30d') => void }) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label className="text-slate-300">时间查询模式</Label>
        <Select value={filters.timeMode} onChange={(event) => setFilters((prev) => ({ ...prev, timeMode: event.target.value as TimeMode }))}>
          <option value="point">按时间点</option>
          <option value="range">按时间段</option>
        </Select>
      </div>
      {filters.timeMode === 'point' ? (
        <div className="flex flex-col gap-2">
          <Label className="text-slate-300">时间点</Label>
          <input type="date" value={filters.pointDate} onChange={(event) => setFilters((prev) => ({ ...prev, pointDate: event.target.value }))} className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 text-slate-100" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Label className="text-slate-300">开始日期</Label>
            <input type="date" value={filters.rangeStartDate} onChange={(event) => setFilters((prev) => ({ ...prev, rangeStartDate: event.target.value }))} className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 text-slate-100" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-slate-300">结束日期</Label>
            <input type="date" value={filters.rangeEndDate} onChange={(event) => setFilters((prev) => ({ ...prev, rangeEndDate: event.target.value }))} className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 text-slate-100" />
          </div>
        </>
      )}
      <div className="flex flex-col gap-2">
        <Label className="text-slate-300">快捷时间</Label>
        <div className="flex min-h-12 flex-wrap items-stretch gap-2">
          <RangeButton text="今日" onClick={() => handlePresetRange('today')} />
          <RangeButton text="近 7 日" onClick={() => handlePresetRange('7d')} />
          <RangeButton text="近 30 日" onClick={() => handlePresetRange('30d')} />
        </div>
      </div>
    </>
  );
}

function FilterSelect({ label, options, value, onValueChange, placeholder }: { label: string; options: Array<{ label: string; value: string }>; value: string[]; onValueChange: (values: string[]) => void; placeholder: string }) {
  return (
    <div>
      <Label className="text-slate-300">{label}</Label>
      <div className="mt-2">
        <MultiSelect options={options} value={value} onValueChange={onValueChange} placeholder={placeholder} className="h-auto min-h-12 rounded-2xl border-slate-700 bg-slate-950/80 text-slate-100" />
      </div>
    </div>
  );
}

function LogListItem({ item, active, onClick }: { item: AdminLogListItem; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`w-full rounded-3xl border p-4 text-left transition ${active ? 'border-sky-500/50 bg-sky-500/10 shadow-lg shadow-sky-950/20' : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-950'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <LevelBadge level={item.level} />
        <Badge variant="secondary" className="bg-slate-800 text-slate-200">{item.module}</Badge>
        {item.model_name || item.model_id ? <Badge variant="secondary" className="bg-slate-800 text-slate-200">{item.model_name || `模型 ${item.model_id}`}</Badge> : null}
      </div>
      <h3 className="mt-3 text-base font-semibold text-white">{item.action_summary}</h3>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
        <span>操作人：{item.user_keyword || '系统'}</span>
        <span>对象：{item.object_type || '未标记'}</span>
        <span>时间：{new Date(item.created_at).toLocaleString()}</span>
      </div>
    </button>
  );
}

function Feedback({ tone, text }: { tone: 'success' | 'error'; text: string }) {
  return (
    <div className={`rounded-3xl border px-4 py-3 text-sm ${tone === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100' : 'border-rose-500/30 bg-rose-500/10 text-rose-100'}`}>
      {text}
    </div>
  );
}

function RangeButton({ text, onClick }: { text: string; onClick: () => void }) {
  return <Button size="sm" variant="secondary" className="h-12 rounded-2xl border border-slate-700 bg-slate-800 px-4 text-slate-200" onClick={onClick}>{text}</Button>;
}

function EmptyLogs() {
  return <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-10 text-center text-sm text-slate-500">所选时间范围和筛选条件下暂无日志。</div>;
}

function getTodayDate() {
  return formatDateInput(new Date());
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDayIso(date: string) {
  return `${date}T00:00:00.000`;
}

function endOfDayIso(date: string) {
  return `${date}T23:59:59.999`;
}

function resolveDownloadFilename(contentDisposition: string | null) {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1];
}

function LevelBadge({ level }: { level: AdminLogListItem['level'] }) {
  const className =
    level === 'error'
      ? 'bg-rose-500/15 text-rose-200'
      : level === 'warning'
        ? 'bg-amber-500/15 text-amber-200'
        : level === 'info'
          ? 'bg-sky-500/15 text-sky-200'
          : 'bg-slate-700 text-slate-200';
  return <Badge className={className}>{level}</Badge>;
}

function DetailSection({ title, content, code = false, tone = 'default' }: { title: string; content: string; code?: boolean; tone?: 'default' | 'error' }) {
  return (
    <section className={`rounded-3xl border p-5 ${tone === 'error' ? 'border-rose-500/30 bg-rose-500/5' : 'border-slate-800 bg-slate-950/70'}`}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <pre className={`mt-4 whitespace-pre-wrap break-words text-sm leading-6 ${code ? 'font-mono' : ''} ${tone === 'error' ? 'text-rose-200' : 'text-slate-300'}`}>
        {content || '无'}
      </pre>
    </section>
  );
}
