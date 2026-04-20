import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { exportAdminLogs, getAdminLogDetail, getAdminLogs, getAdminModels } from '../api/client';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import type { AdminLogDetail, AdminLogLevel, AdminLogListItem, AdminModelItem } from '../types';

const logLevels: Array<{ label: string; value: '' | AdminLogLevel }> = [
  { label: '全部级别', value: '' },
  { label: 'debug', value: 'debug' },
  { label: 'info', value: 'info' },
  { label: 'warning', value: 'warning' },
  { label: 'error', value: 'error' },
];

const objectTypes = [
  { label: '全部对象', value: '' },
  { label: '公司', value: 'company' },
  { label: '股票', value: 'stock' },
  { label: '商品', value: 'commodity' },
];

export function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLogListItem[]>([]);
  const [models, setModels] = useState<AdminModelItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<AdminLogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [level, setLevel] = useState<'' | AdminLogLevel>('');
  const [userKeyword, setUserKeyword] = useState('');
  const [modelId, setModelId] = useState('');
  const [moduleKeyword, setModuleKeyword] = useState('');
  const [objectType, setObjectType] = useState('');

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [logsResponse, modelsResponse] = await Promise.all([getAdminLogs(), getAdminModels()]);
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

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchesLevel = !level || item.level === level;
      const matchesUser = !userKeyword || item.user_keyword.toLowerCase().includes(userKeyword.toLowerCase());
      const matchesModel = !modelId || item.model_id === modelId;
      const matchesModule = !moduleKeyword || item.module.toLowerCase().includes(moduleKeyword.toLowerCase());
      const matchesObject = !objectType || item.object_type === objectType;
      return matchesLevel && matchesUser && matchesModel && matchesModule && matchesObject;
    });
  }, [level, logs, modelId, moduleKeyword, objectType, userKeyword]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAdminLogs({
        level: level || undefined,
        object_type: objectType ? (objectType as 'company' | 'stock' | 'commodity') : undefined,
        module: moduleKeyword || undefined,
        start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date().toISOString(),
        format: 'csv',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 text-slate-100">
      <header className="flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-900/60 p-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">System Logs</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">全链路日志可视化排查</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            落实 FR-SJGL-0004，提供日志级别、操作人、大模型、模块、对象类型等多重检索条件，并支持右侧详情侧边栏查看完整排障链路。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void loadBaseData()} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200">
            <RefreshCw className="mr-2 h-4 w-4" />
            {loading ? '刷新中...' : '刷新日志'}
          </Button>
          <Button onClick={() => void handleExport()} className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400">
            {exporting ? '导出中...' : '导出筛选结果'}
          </Button>
        </div>
      </header>

      <Card className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <Label htmlFor="admin-log-level" className="text-slate-300">日志级别</Label>
            <Select id="admin-log-level" value={level} onChange={(event) => setLevel(event.target.value as '' | AdminLogLevel)}>
              {logLevels.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="admin-log-user" className="text-slate-300">操作人</Label>
            <Input
              id="admin-log-user"
              value={userKeyword}
              onChange={(event) => setUserKeyword(event.target.value)}
              placeholder="输入用户名关键词"
              className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100"
            />
          </div>
          <div>
            <Label htmlFor="admin-log-model" className="text-slate-300">大模型</Label>
            <Select id="admin-log-model" value={modelId} onChange={(event) => setModelId(event.target.value)}>
              <option value="">全部模型</option>
              {models.map((item) => (
                <option key={item.model_id} value={item.model_id}>
                  {item.model_name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="admin-log-module" className="text-slate-300">模块</Label>
            <Input
              id="admin-log-module"
              value={moduleKeyword}
              onChange={(event) => setModuleKeyword(event.target.value)}
              placeholder="如 research.analysis"
              className="h-12 rounded-2xl border-slate-700 bg-slate-950/80 px-4 text-slate-100"
            />
          </div>
          <div>
            <Label htmlFor="admin-log-object-type" className="text-slate-300">对象类型</Label>
            <Select id="admin-log-object-type" value={objectType} onChange={(event) => setObjectType(event.target.value)}>
              {objectTypes.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="min-h-0 rounded-[28px] border border-slate-800 bg-slate-900/70 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between px-2">
            <div>
              <h2 className="text-lg font-semibold text-white">日志列表</h2>
              <p className="mt-1 text-sm text-slate-400">当前命中 {filteredLogs.length} 条记录</p>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              Multi Filters
            </Badge>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            {filteredLogs.map((item) => {
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

            {filteredLogs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-10 text-center text-sm text-slate-500">
                未找到符合条件的日志，请调整筛选条件后重试。
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="min-h-0 rounded-[28px] border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">排查详情侧边栏</h2>
              <p className="mt-1 text-sm text-slate-400">展示用户动作、意图、Agent 轨迹、原始提示词与返回结果。</p>
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
