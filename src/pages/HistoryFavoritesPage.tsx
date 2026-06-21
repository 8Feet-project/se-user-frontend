import { Clock3, Cpu, FileSearch, Filter, History, RotateCcw, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createFavoriteItem,
  deleteFavoriteItem,
  findFavoriteItem,
  getFavoriteItems,
  getModelsAvailable,
  getResearchHistory,
  getResearchHistoryDetail,
  reloadResearchHistory,
} from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import type { FavoriteItem, HistoryTaskItem, ModelAvailableItem, ObjectType, ResearchHistoryDetail } from '@/types';

type ObjectTypeFilter = ObjectType | 'all';

const objectTypeOptions: Array<{ value: ObjectTypeFilter; label: string }> = [
  { value: 'all', label: '全部类型' },
  { value: 'company', label: '公司' },
  { value: 'stock', label: '股票' },
  { value: 'commodity', label: '商品' },
];

function objectTypeLabel(type: HistoryTaskItem['object_type']) {
  if (type === 'company') return '公司';
  if (type === 'stock') return '股票';
  return '商品';
}

function formatDateTime(value?: string | null) {
  if (!value) return '未知';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// 把任意时间值转成 <input type="date"> 用的 YYYY-MM-DD
function toDateInputValue(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function HistoryFavoritesPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<HistoryTaskItem[]>([]);
  const [models, setModels] = useState<ModelAvailableItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<ResearchHistoryDetail | null>(null);
  const [favoriteReportItems, setFavoriteReportItems] = useState<FavoriteItem[]>([]);
  const [message, setMessage] = useState('');
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [favoritingTaskId, setFavoritingTaskId] = useState<string | null>(null);
  const [reloadingTaskId, setReloadingTaskId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // 筛选条件：默认时间区间为「有数据那天 ~ 今天」
  const todayValue = toDateInputValue(new Date());
  const [objectType, setObjectType] = useState<ObjectTypeFilter>('all');
  const [modelId, setModelId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todayValue);
  const [dataStartDate, setDataStartDate] = useState('');
  const rangeInitialized = useRef(false);

  const hasActiveFilters =
    objectType !== 'all' ||
    Boolean(modelId) ||
    (Boolean(startDate) && startDate !== dataStartDate) ||
    endDate !== todayValue;

  // 初次加载：模型列表 + 收藏列表（用于收藏星标状态）
  useEffect(() => {
    const loadAux = async () => {
      const [modelsResult, favoritesResult] = await Promise.allSettled([
        getModelsAvailable(),
        getFavoriteItems({ favorite_type: 'report', page: 1, page_size: 200 }),
      ]);
      if (modelsResult.status === 'fulfilled') setModels(modelsResult.value.models);
      if (favoritesResult.status === 'fulfilled') setFavoriteReportItems(favoritesResult.value.list);
    };
    void loadAux();
  }, []);

  // 筛选条件变化时实时刷新列表；带竞态保护，避免先发请求覆盖后发结果
  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const history = await getResearchHistory({
          page: 1,
          page_size: 200,
          object_type: objectType === 'all' ? undefined : objectType,
          model_id: modelId || undefined,
          start_time: startDate || undefined,
          end_time: endDate || undefined,
        });
        if (!active) return;
        // 首次加载后，把开始日期默认到最早一条记录那天（结束日期默认今天）
        if (!rangeInitialized.current) {
          rangeInitialized.current = true;
          const earliest = history.list.reduce<string>(
            (min, task) => (!min || task.created_at < min ? task.created_at : min),
            ''
          );
          const earliestValue = earliest ? toDateInputValue(earliest) : todayValue;
          setDataStartDate(earliestValue);
          setStartDate(earliestValue);
        }
        setTasks(history.list);
        setLoadError(false);
        setMessage('');
      } catch (error) {
        if (!active) return;
        setTasks([]);
        setLoadError(true);
        setMessage(error instanceof Error ? error.message : '加载历史失败');
      } finally {
        if (active) setLoaded(true);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [objectType, modelId, startDate, endDate]);

  const handleClearFilters = () => {
    setObjectType('all');
    setModelId('');
    setStartDate(dataStartDate);
    setEndDate(todayValue);
  };

  const handleLoadDetail = async (taskId: string) => {
    try {
      setSubmittingTaskId(taskId);
      const detail = await getResearchHistoryDetail(taskId);
      setSelectedDetail(detail);
      setMessage('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '加载历史详情失败';
      setMessage(reason);
    } finally {
      setSubmittingTaskId(null);
    }
  };

  // 复现历史报告：重新加载当时的信息源、分析结果与完整报告
  const handleReloadReport = async (task: HistoryTaskItem | ResearchHistoryDetail) => {
    try {
      setReloadingTaskId(task.task_id);
      const result = await reloadResearchHistory(task.task_id);
      navigate(result.redirect_url);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '复现历史报告失败';
      setMessage(reason);
    } finally {
      setReloadingTaskId(null);
    }
  };

  const handleFavoriteReport = async (task: HistoryTaskItem | ResearchHistoryDetail) => {
    if (!task.report_id) {
      setMessage('当前任务还没有可收藏的报告。');
      return;
    }

    try {
      setFavoritingTaskId(task.task_id);
      const existing = findFavoriteItem(favoriteReportItems, 'report', task.report_id);
      if (existing) {
        await deleteFavoriteItem(existing.favorite_id);
        setFavoriteReportItems((prev) => prev.filter((item) => item.favorite_id !== existing.favorite_id));
        setMessage('已取消收藏。');
        return;
      }

      const response = await createFavoriteItem({
        favorite_type: 'report',
        target_id: task.report_id,
        remark: `${task.object_name} 报告`,
      });
      const created: FavoriteItem = {
        favorite_id: response.favorite_id,
        favorite_type: 'report',
        target_id: task.report_id,
        remark: `${task.object_name} 报告`,
      };
      setFavoriteReportItems((prev) => [...prev.filter((item) => item.target_id !== task.report_id), created]);
      setMessage('报告已收藏。');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '更新收藏失败';
      setMessage(reason);
    } finally {
      setFavoritingTaskId(null);
    }
  };

  const completedCount = useMemo(() => tasks.filter((task) => task.status === 'completed').length, [tasks]);
  const selectedDetailReportFavorited = Boolean(findFavoriteItem(favoriteReportItems, 'report', selectedDetail?.report_id));

  return (
    <PageShell title="历史记录">
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
        <Card className="flex flex-col gap-6 xl:max-h-[calc(100vh-15rem)] xl:overflow-hidden">
          <div className="flex flex-wrap gap-2">
            <span className="data-pill">
              <History size={14} className="text-[#63cab7]" />
              历史任务 {tasks.length}
            </span>
            <span className="data-pill">
              <Sparkles size={14} className="text-[#63cab7]" />
              已完成 {completedCount}
            </span>
          </div>

          <div className="space-y-2">
            <p className="page-kicker">历史记录</p>
            <h2 className="text-2xl font-semibold text-slate-100">调研历史</h2>
          </div>

          {/* 筛选控件：对象类型 / 模型 / 时间区间 */}
          <div className="panel-subtle space-y-3 rounded-[24px] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Filter size={13} className="text-[#63cab7]" />
              筛选条件
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="grid gap-1">
                <label className="text-xs text-slate-500" htmlFor="history-object-type">对象类型</label>
                <Select
                  id="history-object-type"
                  value={objectType}
                  onChange={(event) => setObjectType(event.target.value as ObjectTypeFilter)}
                >
                  {objectTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-slate-500" htmlFor="history-model">使用的模型</label>
                <Select id="history-model" value={modelId} onChange={(event) => setModelId(event.target.value)}>
                  <option value="">全部模型</option>
                  {models.map((model) => (
                    <option key={model.model_id} value={model.model_id}>
                      {model.model_name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-slate-500" htmlFor="history-start">开始日期</label>
                <Input
                  id="history-start"
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-slate-500" htmlFor="history-end">结束日期</label>
                <Input
                  id="history-end"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </div>
            {hasActiveFilters ? (
              <div className="flex justify-end">
                <Button size="sm" variant="secondary" onClick={handleClearFilters}>
                  <RotateCcw size={13} />
                  清空筛选条件
                </Button>
              </div>
            ) : null}
          </div>

          <div className="space-y-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-1">
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const isReportFavorited = Boolean(findFavoriteItem(favoriteReportItems, 'report', task.report_id));
                return (
                  <div
                    key={task.task_id}
                    className="panel-subtle cursor-pointer rounded-[28px] px-5 py-5 transition hover:border-[rgba(99,202,183,0.18)]"
                    role="button"
                    tabIndex={0}
                    onClick={() => void handleReloadReport(task)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        void handleReloadReport(task);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-100">{task.object_name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                          <span>{objectTypeLabel(task.object_type)}</span>
                          {task.model_name ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <Cpu size={12} />
                              {task.model_name}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 size={12} />
                      调研时间：{formatDateTime(task.created_at)}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleLoadDetail(task.task_id);
                        }}
                        disabled={submittingTaskId === task.task_id}
                      >
                        查看详情
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleReloadReport(task);
                        }}
                        disabled={reloadingTaskId === task.task_id}
                      >
                        {reloadingTaskId === task.task_id ? '复现中...' : '复现报告'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/process?task_id=${task.task_id}`);
                        }}
                      >
                        查看流程
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleFavoriteReport(task);
                        }}
                        disabled={favoritingTaskId === task.task_id || !task.report_id}
                        aria-label={isReportFavorited ? `取消收藏 ${task.object_name} 报告` : `收藏 ${task.object_name} 报告`}
                      >
                        <Star size={14} fill={isReportFavorited ? 'currentColor' : 'none'} />
                        {favoritingTaskId === task.task_id ? '更新中...' : isReportFavorited ? '已收藏' : '收藏报告'}
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : loadError ? (
              <div className="panel-subtle p-5 text-sm text-slate-500">
                加载历史记录失败，请稍后重试。
              </div>
            ) : loaded && hasActiveFilters ? (
              <div className="panel-subtle flex flex-col items-center gap-3 p-8 text-center text-sm text-slate-500">
                <FileSearch size={28} className="text-slate-600" />
                <p>没有符合当前筛选条件的调研记录。</p>
                <Button size="sm" variant="secondary" onClick={handleClearFilters}>
                  <RotateCcw size={13} />
                  清空筛选条件
                </Button>
              </div>
            ) : loaded ? (
              <div className="panel-subtle p-5 text-sm text-slate-500">
                当前暂无历史任务。待完成一次调研后，这里会显示可复查、可跳转的任务记录。
              </div>
            ) : null}
          </div>
        </Card>

        <div>
          <Card variant="glow" className="space-y-5">
            <div className="flex items-center gap-2">
              <FileSearch size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">任务详情</h3>
            </div>
            {selectedDetail ? (
              <div className="panel-subtle space-y-3 p-4 text-sm text-slate-300">
                <p>
                  <span className="text-slate-500">调研对象：</span>
                  {selectedDetail.object_name}
                </p>
                {selectedDetail.model_name ? (
                  <p>
                    <span className="text-slate-500">使用模型：</span>
                    {selectedDetail.model_name}
                    {selectedDetail.model_provider ? `（${selectedDetail.model_provider}）` : ''}
                  </p>
                ) : null}
                <p className="flex items-center gap-2">
                  <span className="text-slate-500">状态：</span>
                  <StatusBadge status={selectedDetail.status} />
                </p>
                <p>
                  <span className="text-slate-500">调研时间：</span>
                  {formatDateTime(selectedDetail.created_at)}
                </p>
                <p>
                  <span className="text-slate-500">数据集：</span>
                  {selectedDetail.fact_dataset}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => void handleReloadReport(selectedDetail)}
                    disabled={reloadingTaskId === selectedDetail.task_id}
                  >
                    {reloadingTaskId === selectedDetail.task_id ? '复现中...' : '复现报告'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/process?task_id=${selectedDetail.task_id}`)}>
                    查看流程
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void handleFavoriteReport(selectedDetail)}
                    disabled={favoritingTaskId === selectedDetail.task_id || !selectedDetail.report_id}
                    aria-label={selectedDetailReportFavorited ? `取消收藏 ${selectedDetail.object_name} 报告` : `收藏 ${selectedDetail.object_name} 报告`}
                  >
                    <Star size={14} fill={selectedDetailReportFavorited ? 'currentColor' : 'none'} />
                    {favoritingTaskId === selectedDetail.task_id ? '更新中...' : selectedDetailReportFavorited ? '已收藏' : '收藏报告'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="panel-subtle p-4 text-sm text-slate-500">从左侧选择一条历史任务查看详情。</div>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
