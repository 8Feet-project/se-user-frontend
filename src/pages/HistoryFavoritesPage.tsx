import { Clock3, FileSearch, History, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { getResearchHistory, getResearchHistoryDetail, reloadResearchHistory } from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import type { HistoryTaskItem, ResearchHistoryDetail, ResearchHistoryReloadResponse } from '@/types';

function objectTypeLabel(type: HistoryTaskItem['object_type']) {
  if (type === 'company') return '公司';
  if (type === 'stock') return '股票';
  return '商品';
}

export function HistoryFavoritesPage() {
  const [tasks, setTasks] = useState<HistoryTaskItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<ResearchHistoryDetail | null>(null);
  const [reloadResult, setReloadResult] = useState<ResearchHistoryReloadResponse | null>(null);
  const [message, setMessage] = useState('');
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const history = await getResearchHistory({ page: 1, page_size: 10 });
        setTasks(history.list);
      } catch (error) {
        const reason = error instanceof Error ? error.message : '加载历史失败';
        setMessage(reason);
      }
    };

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

  const handleReloadTask = async (taskId: string) => {
    try {
      setSubmittingTaskId(taskId);
      const result = await reloadResearchHistory(taskId);
      setReloadResult(result);
      setMessage(`重载成功：${result.task_id}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '重载历史失败';
      setMessage(reason);
    } finally {
      setSubmittingTaskId(null);
    }
  };

  const completedCount = useMemo(() => tasks.filter((task) => task.status === 'completed').length, [tasks]);

  return (
    <PageShell
      title="历史记录"
      subtitle="按 8Feet 的双栏信息结构重新组织历史调研：左侧看任务队列，右侧查看详情、数据集和重载结果。"
    >
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
        <Card className="space-y-6">
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
            <p className="page-kicker">History Stream</p>
            <h2 className="text-2xl font-semibold text-slate-100">调研历史</h2>
            <p className="text-sm leading-7 text-slate-400">把过去的任务保留成可回溯的资产，你可以重新查看详情，也可以把结果重新载入到当前工作流。</p>
          </div>

          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.task_id} className="panel-subtle rounded-[28px] px-5 py-5 transition hover:border-[rgba(99,202,183,0.18)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-100">{task.object_name}</p>
                      <p className="mt-1 text-sm text-slate-400">{objectTypeLabel(task.object_type)}</p>
                      <p className="mt-1 text-xs text-slate-500">{task.task_id}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <Clock3 size={12} />
                    创建时间：{task.created_at}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleLoadDetail(task.task_id)} disabled={submittingTaskId === task.task_id}>
                      查看详情
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleReloadTask(task.task_id)} disabled={submittingTaskId === task.task_id}>
                      重载结果
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="panel-subtle p-5 text-sm text-slate-500">暂时没有历史任务。</div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card variant="glow" className="space-y-5">
            <div className="flex items-center gap-2">
              <FileSearch size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">任务详情</h3>
            </div>
            {selectedDetail ? (
              <div className="panel-subtle space-y-3 p-4 text-sm text-slate-300">
                <p><span className="text-slate-500">调研对象：</span>{selectedDetail.object_name}</p>
                <p className="flex items-center gap-2"><span className="text-slate-500">状态：</span><StatusBadge status={selectedDetail.status} /></p>
                <p><span className="text-slate-500">数据集：</span>{selectedDetail.fact_dataset}</p>
                {selectedDetail.report_id ? <p><span className="text-slate-500">报告 ID：</span>{selectedDetail.report_id}</p> : null}
              </div>
            ) : (
              <div className="panel-subtle p-4 text-sm text-slate-500">从左侧选择一条历史任务查看详情。</div>
            )}
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">重载结果</h3>
            </div>
            {reloadResult ? (
              <div className="panel-subtle space-y-3 p-4 text-sm text-slate-300">
                <p><span className="text-slate-500">任务 ID：</span>{reloadResult.task_id}</p>
                <p><span className="text-slate-500">报告 ID：</span>{reloadResult.report_id ?? '待生成'}</p>
                {reloadResult.redirect_url ? <p><span className="text-slate-500">跳转链接：</span>{reloadResult.redirect_url}</p> : null}
              </div>
            ) : (
              <div className="panel-subtle p-4 text-sm text-slate-500">还没有执行过重载操作。</div>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
