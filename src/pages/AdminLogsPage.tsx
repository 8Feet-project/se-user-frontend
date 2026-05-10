import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import {
  exportAdminLogs,
  getAdminLogDetail,
  getAdminLogExportStatus,
  getAdminLogs,
  getAdminModels,
} from '../api/client';
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

type TimeMode = 'point' | 'range';

interface LogFilterState {
  levels: AdminLogLevel[];
  users: string[];
  modelIds: string[];
  modules: Array<'user_action' | 'system_auto'>;
  objectTypes: Array<'company' | 'stock' | 'commodity'>;
  timeMode: TimeMode;
  pointDate: string;
  rangeStartDate: string;
  rangeEndDate: string;
}

const defaultPageSize = 10;

export function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLogListItem[]>([]);
  const [models, setModels] = useState<AdminModelItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<AdminLogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportStatusText, setExportStatusText] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const today = getTodayDate();
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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const userOptions = useMemo(() => {
    const unique = Array.from(new Set(logs.map((item) => item.user_keyword).filter(Boolean)));
    return unique.map((item) => ({ label: item, value: item }));
  }, [logs]);

  const moduleOptions = useMemo(
    () => [
      { label: '用户操作', value: 'user_action' },
      { label: '系统自动操作', value: 'system_auto' },
    ],
    []
  );

  const modelOptions = useMemo(
    () => models.map((item) => ({ label: `${item.model_name} (${item.provider})`, value: item.model_id })),
    [models]
  );

  const levelOptions = useMemo(() => fixedLogLevels.map((item) => ({ label: item.label, value: item.value })), []);
  const objectTypeOptions = useMemo(() => fixedObjectTypes.map((item) => ({ label: item.label, value: item.value })), []);

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [logsResponse, modelsResponse] = await Promise.all([
        getAdminLogs({
          start_time: startOfDayIso(today),
          end_time: endOfDayIso(today),
          page: 1,
          page_size: 200,
        }),
        getAdminModels(),
      ]);
      setLogs(logsResponse.list);
      setModels(modelsResponse.list);
      if (logsResponse.list.length > 0) {
        void handleSelectLog(logsResponse.list[0].log_id);
      } else {
        setSelectedLog(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBaseData();
  }, []);

  const handleSelectLog = async (logId: string) => {
    setDetailLoading(true);
    try {
      const detail = await getAdminLogDetail(logId);
      setSelectedLog(detail);
    } finally {
      setDetailLoading(false);
    }
  };

  const timeRange = useMemo(() => {
    if (filters.timeMode === 'point') {
      const date = filters.pointDate || today;
      return {
        start: startOfDayIso(date),
        end: endOfDayIso(date),
      };
    }

    const startDate = filters.rangeStartDate || today;
    const endDate = filters.rangeEndDate || startDate;
    return {
      start: startOfDayIso(startDate),
      end: endOfDayIso(endDate),
    };
  }, [filters.pointDate, filters.rangeEndDate, filters.rangeStartDate, filters.timeMode, today]);

  const applyLocalFilter = (source: AdminLogListItem[]) => {
    return source.filter((item) => {
      const createdAt = new Date(item.created_at).getTime();
      const rangeStart = new Date(timeRange.start).getTime();
      const rangeEnd = new Date(timeRange.end).getTime();
      if (Number.isFinite(rangeStart) && Number.isFinite(rangeEnd)) {
        if (createdAt < rangeStart || createdAt > rangeEnd) {
          return false;
        }
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
      if (filters.modules.length > 0) {
        const operationModule = resolveOperationModule(item);
        if (!filters.modules.includes(operationModule)) {
          return false;
        }
      }
      if (filters.objectTypes.length > 0 && (!item.object_type || !filters.objectTypes.includes(item.object_type))) {
        return false;
      }
      return true;
    });
  };

  const filteredLogs = useMemo(() => applyLocalFilter(logs), [logs, filters, timeRange]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredLogs.length / pageSize)), [filteredLogs.length, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

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
      setFilters((prev) => ({
        ...prev,
        timeMode: 'point',
        pointDate: endStr,
        rangeStartDate: endStr,
        rangeEndDate: endStr,
      }));
      return;
    }

    const days = preset === '7d' ? 6 : 29;
    const start = new Date();
    start.setDate(end.getDate() - days);
    const startStr = formatDateInput(start);
    setFilters((prev) => ({
      ...prev,
      timeMode: 'range',
      rangeStartDate: startStr,
      rangeEndDate: endStr,
    }));
  };

  const handleSearch = async () => {
    setSearching(true);
    setExportStatusText('');
    setFeedback(null);
    setPage(1);

    if (filters.timeMode === 'range' && filters.rangeStartDate && filters.rangeEndDate && filters.rangeStartDate > filters.rangeEndDate) {
      setSearching(false);
      setFeedback({ tone: 'error', text: '开始时间不能晚于结束时间。' });
      return;
    }

    try {
      const response = await getAdminLogs({
        level: filters.levels.join(',') || undefined,
        user_keyword: filters.users.join(',') || undefined,
        model_id: filters.modelIds.join(',') || undefined,
        object_type: filters.objectTypes.join(',') || undefined,
        start_time: timeRange.start,
        end_time: timeRange.end,
        page: 1,
        page_size: 200,
      });
      setLogs(response.list);
      setFeedback({ tone: 'success', text: '查询完成，日志列表已刷新。' });
    } catch (error) {
      const reason = error instanceof Error ? error.message : '查询失败';
      setFeedback({ tone: 'error', text: reason });
    } finally {
      setSearching(false);
    }
  };

  const handleExport = async () => {
    if (filters.timeMode === 'range' && filters.rangeStartDate && filters.rangeEndDate && filters.rangeStartDate > filters.rangeEndDate) {
      setFeedback({ tone: 'error', text: '开始时间不能晚于结束时间。' });
      return;
    }

    const hasTimeConstraint = Boolean(timeRange.start && timeRange.end);
    const hasLevelConstraint = filters.levels.length > 0;
    if (!hasTimeConstraint && !hasLevelConstraint) {
      setFeedback({ tone: 'error', text: '查询/导出范围过大，请至少添加“时间范围”或“日志级别”进行精确限制。' });
      return;
    }

    setExporting(true);
    setExportStatusText('');
    try {
      const response = await exportAdminLogs({
        level: filters.levels.length === 1 ? filters.levels[0] : undefined,
        object_type: filters.objectTypes.length === 1 ? filters.objectTypes[0] : undefined,
        start_time: timeRange.start,
        end_time: timeRange.end,
        format: 'csv',
      });

      setExportStatusText(`导出任务已创建：${response.export_id}，状态 ${response.status}。`);

      const maxAttempts = 6;
      for (let i = 0; i < maxAttempts; i += 1) {
        const status = await getAdminLogExportStatus(response.export_id);
        if (status.status === 'completed') {
          setExportStatusText(status.download_url ? `导出完成，可下载：${status.download_url}` : '导出完成，请稍后刷新查看下载链接。');
          setFeedback({ tone: 'success', text: '导出成功。' });
          return;
        }
        if (status.status === 'failed') {
          setExportStatusText(`导出失败：${status.error_message || '未知错误'}`);
          setFeedback({ tone: 'error', text: '导出失败。' });
          return;
        }
        setExportStatusText(`导出处理中：${status.status}`);
      }

      setFeedback({ tone: 'error', text: '导出还在处理中，请稍后刷新查看。' });
    } catch (error) {
      const reason = error instanceof Error ? error.message : '导出失败';
      setFeedback({ tone: 'error', text: reason });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 text-slate-100">
      <header className="flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-900/60 p-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">System Logs</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">系统日志排查</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            按时间、级别、操作人或模型筛选日志，定位异常和关键操作。
          </p>
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

      {feedback ? (
        <div
          className={`rounded-3xl border px-4 py-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-100'
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {exportStatusText ? (
        <div className="rounded-3xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">{exportStatusText}</div>
      ) : null}

      <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
        <div className="grid gap-4 xl:grid-cols-4">
          <div>
            <Label className="text-slate-300">时间查询模式</Label>
            <Select
              value={filters.timeMode}
              onChange={(event) => setFilters((prev) => ({ ...prev, timeMode: event.target.value as TimeMode }))}
            >
              <option value="point">按时间点</option>
              <option value="range">按时间段</option>
            </Select>
          </div>

          {filters.timeMode === 'point' ? (
            <div>
              <Label className="text-slate-300">时间点</Label>
              <input
                type="date"
                value={filters.pointDate}
                onChange={(event) => setFilters((prev) => ({ ...prev, pointDate: event.target.value }))}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 text-slate-100"
              />
            </div>
          ) : (
            <>
              <div>
                <Label className="text-slate-300">开始日期</Label>
                <input
                  type="date"
                  value={filters.rangeStartDate}
                  onChange={(event) => setFilters((prev) => ({ ...prev, rangeStartDate: event.target.value }))}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 text-slate-100"
                />
              </div>
              <div>
                <Label className="text-slate-300">结束日期</Label>
                <input
                  type="date"
                  value={filters.rangeEndDate}
                  onChange={(event) => setFilters((prev) => ({ ...prev, rangeEndDate: event.target.value }))}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 text-slate-100"
                />
              </div>
            </>
          )}

          <div>
            <Label className="text-slate-300">快捷时间</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" className="rounded-xl bg-slate-800 text-slate-200" onClick={() => handlePresetRange('today')}>
                今日
              </Button>
              <Button size="sm" variant="secondary" className="rounded-xl bg-slate-800 text-slate-200" onClick={() => handlePresetRange('7d')}>
                近 7 日
              </Button>
              <Button size="sm" variant="secondary" className="rounded-xl bg-slate-800 text-slate-200" onClick={() => handlePresetRange('30d')}>
                近 30 日
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <Label className="text-slate-300">日志级别（多选）</Label>
            <div className="mt-2">
              <MultiSelect
                options={levelOptions}
                value={filters.levels}
                onValueChange={(values) => setFilters((prev) => ({ ...prev, levels: values as AdminLogLevel[] }))}
                placeholder="请选择日志级别"
                className="h-auto min-h-12 rounded-2xl border-slate-700 bg-slate-950/80 text-slate-100"
              />
            </div>
          </div>
          <div>
            <Label className="text-slate-300">操作人（多选）</Label>
            <div className="mt-2">
              <MultiSelect
                options={userOptions}
                value={filters.users}
                onValueChange={(values) => setFilters((prev) => ({ ...prev, users: values }))}
                placeholder="请选择操作人"
                className="h-auto min-h-12 rounded-2xl border-slate-700 bg-slate-950/80 text-slate-100"
              />
            </div>
          </div>
          <div>
            <Label className="text-slate-300">大模型（多选）</Label>
            <div className="mt-2">
              <MultiSelect
                options={modelOptions}
                value={filters.modelIds}
                onValueChange={(values) => setFilters((prev) => ({ ...prev, modelIds: values }))}
                placeholder="请选择模型"
                className="h-auto min-h-12 rounded-2xl border-slate-700 bg-slate-950/80 text-slate-100"
              />
            </div>
          </div>
          <div>
            <Label className="text-slate-300">操作模块（多选）</Label>
            <div className="mt-2">
              <MultiSelect
                options={moduleOptions}
                value={filters.modules}
                onValueChange={(values) =>
                  setFilters((prev) => ({ ...prev, modules: values as Array<'user_action' | 'system_auto'> }))
                }
                placeholder="请选择用户操作或系统自动操作"
                className="h-auto min-h-12 rounded-2xl border-slate-700 bg-slate-950/80 text-slate-100"
              />
            </div>
          </div>
          <div>
            <Label className="text-slate-300">对象类型（多选）</Label>
            <div className="mt-2">
              <MultiSelect
                options={objectTypeOptions}
                value={filters.objectTypes}
                onValueChange={(values) => setFilters((prev) => ({ ...prev, objectTypes: values as Array<'company' | 'stock' | 'commodity'> }))}
                placeholder="请选择对象类型"
                className="h-auto min-h-12 rounded-2xl border-slate-700 bg-slate-950/80 text-slate-100"
              />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-xs leading-6 text-slate-400">
            导出前请先缩小时间或日志级别，避免一次导出过多记录。
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
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              Multi Filters
            </Badge>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 365px)' }}>
            {pagedLogs.map((item) => {
              const active = selectedLog?.log_id === item.log_id;
              return (
                <button
                  key={item.log_id}
                  type="button"
                  onClick={() => void handleSelectLog(item.log_id)}
                  className={`w-full rounded-3xl border p-4 text-left transition ${
                    active
                      ? 'border-sky-500/50 bg-sky-500/10 shadow-lg shadow-sky-950/20'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <LevelBadge level={item.level} />
                    <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                      {item.module}
                    </Badge>
                    {item.model_id ? (
                      <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                        {item.model_id}
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white">{item.action_summary}</h3>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                    <span>操作人：{item.user_keyword}</span>
                    <span>对象：{item.object_type || '未标记'}</span>
                    <span>时间：{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </button>
              );
            })}

            {pagedLogs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-10 text-center text-sm text-slate-500">
                所选时间范围和筛选条件下暂无运行数据。
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
            <span>
              第 {page} / {totalPages} 页
            </span>
            <div className="flex items-center gap-2">
              <Select value={String(pageSize)} onChange={(event) => setPageSize(Number(event.target.value))}>
                <option value="10">每页 10 条</option>
                <option value="20">每页 20 条</option>
                <option value="50">每页 50 条</option>
              </Select>
              <Button size="sm" variant="secondary" className="rounded-xl bg-slate-800 text-slate-200" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
                上一页
              </Button>
              <Button size="sm" variant="secondary" className="rounded-xl bg-slate-800 text-slate-200" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
                下一页
              </Button>
            </div>
          </div>
        </Card>

        <Card className="min-h-0 rounded-[28px] border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">排查详情侧边栏</h2>
              <p className="mt-1 text-sm text-slate-400">查看这条日志的上下文、提示词和模型返回。</p>
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
                {selectedLog.error_stack ? <DetailSection title="错误堆栈" content={selectedLog.error_stack} code tone="error" /> : null}
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-10 text-center text-sm text-slate-500">
                请选择左侧日志查看详情。
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
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
  return `${date}T00:00:00.000Z`;
}

function endOfDayIso(date: string) {
  return `${date}T23:59:59.999Z`;
}

function resolveOperationModule(item: AdminLogListItem): 'user_action' | 'system_auto' {
  if (item.module.startsWith('auth.') || item.module.startsWith('admin.')) {
    return 'user_action';
  }
  return 'system_auto';
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

function DetailSection({
  title,
  content,
  code = false,
  tone = 'default',
}: {
  title: string;
  content: string;
  code?: boolean;
  tone?: 'default' | 'error';
}) {
  return (
    <section className={`rounded-3xl border p-5 ${tone === 'error' ? 'border-rose-500/30 bg-rose-500/5' : 'border-slate-800 bg-slate-950/70'}`}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <pre
        className={`mt-4 whitespace-pre-wrap break-words text-sm leading-6 ${code ? 'font-mono' : ''} ${tone === 'error' ? 'text-rose-200' : 'text-slate-300'}`}
      >
        {content}
      </pre>
    </section>
  );
}
