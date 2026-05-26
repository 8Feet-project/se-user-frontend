import { Clock3, FileSearch, History, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createFavoriteItem,
  deleteFavoriteItem,
  findFavoriteItem,
  getFavoriteItems,
  getResearchHistory,
  getResearchHistoryDetail,
} from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import type { FavoriteItem, HistoryTaskItem, ResearchHistoryDetail } from '@/types';

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

export function HistoryFavoritesPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<HistoryTaskItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<ResearchHistoryDetail | null>(null);
  const [favoriteReportItems, setFavoriteReportItems] = useState<FavoriteItem[]>([]);
  const [message, setMessage] = useState('');
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [favoritingTaskId, setFavoritingTaskId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadData = async () => {
    try {
      const [history, favorites] = await Promise.all([
        getResearchHistory({ page: 1, page_size: 10 }),
        getFavoriteItems({ favorite_type: 'report', page: 1, page_size: 200 }),
      ]);
      setTasks(history.list);
      setFavoriteReportItems(favorites.list);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '加载历史失败';
      setMessage(reason);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

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

  const handleOpenHistoryItem = (task: HistoryTaskItem) => {
    if (task.report_id && task.status === 'completed') {
      navigate(`/report?report_id=${task.report_id}`);
      return;
    }

    navigate(`/process?task_id=${task.task_id}`);
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
    <PageShell
      title="历史记录"
    >
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
                    onClick={() => handleOpenHistoryItem(task)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleOpenHistoryItem(task);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-100">{task.object_name}</p>
                        <p className="mt-1 text-sm text-slate-400">{objectTypeLabel(task.object_type)}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 size={12} />
                      创建时间：{formatDateTime(task.created_at)}
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
                          if (task.report_id) {
                            navigate(`/report?report_id=${task.report_id}`);
                          } else {
                            navigate(`/report?task_id=${task.task_id}`);
                          }
                        }}
                      >
                        查看报告
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
                <p className="flex items-center gap-2">
                  <span className="text-slate-500">状态：</span>
                  <StatusBadge status={selectedDetail.status} />
                </p>
                <p>
                  <span className="text-slate-500">数据集：</span>
                  {selectedDetail.fact_dataset}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/process?task_id=${selectedDetail.task_id}`)}>
                    恢复任务
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate(selectedDetail.report_id ? `/report?report_id=${selectedDetail.report_id}` : `/report?task_id=${selectedDetail.task_id}`)
                    }
                  >
                    打开报告
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
