import { useEffect, useState } from 'react';
import {
  getResearchHistory,
  getResearchHistoryDetail,
  reloadResearchHistory,
} from '../api/client';
import { Button } from '../components/ui/button';
import { PageShell } from '../components/common/PageShell';
import { Card } from '../components/ui/card';
import type { HistoryTaskItem, ResearchHistoryDetail, ResearchHistoryReloadResponse } from '../types';

function objectTypeLabel(type: HistoryTaskItem['object_type']) {
  if (type === 'company') return '公司对象';
  if (type === 'stock') return '股票对象';
  return '商品对象';
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

  return (
    <PageShell title="历史与收藏" subtitle="对齐 /api/v1/research/history 历史任务数据结构。">
      <div className="grid gap-8">
        <Card className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-950">调研历史</h2>
            <p className="text-sm leading-7 text-slate-600">展示字段：task_id、object_name、object_type、status、created_at。</p>
          </div>

          <div className="grid gap-4">
            {tasks.map((task) => (
              <div key={task.task_id} className="rounded-[28px] border border-slate-200/80 bg-slate-50 px-5 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{task.object_name}</p>
                    <p className="text-sm text-slate-600">{objectTypeLabel(task.object_type)}</p>
                    <p className="text-xs text-slate-500">task_id: {task.task_id}</p>
                  </div>
                  <span className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-600">
                    {task.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">提交时间：{task.created_at}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLoadDetail(task.task_id)}
                    disabled={submittingTaskId === task.task_id}
                  >
                    历史详情
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReloadTask(task.task_id)}
                    disabled={submittingTaskId === task.task_id}
                  >
                    重载结果
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {selectedDetail ? (
            <div className="rounded-[28px] border border-slate-200/80 bg-white px-5 py-5">
              <p className="text-sm font-semibold text-slate-950">历史详情（/research/history/{'{task_id}'})</p>
              <p className="mt-2 text-sm text-slate-700">object_name: {selectedDetail.object_name}</p>
              <p className="text-sm text-slate-700">status: {selectedDetail.status}</p>
              <p className="text-sm text-slate-700">fact_dataset: {selectedDetail.fact_dataset}</p>
            </div>
          ) : null}

          {reloadResult ? (
            <div className="rounded-[28px] border border-slate-200/80 bg-white px-5 py-5">
              <p className="text-sm font-semibold text-slate-950">重载结果（/research/history/{'{task_id}'}/reload）</p>
              <p className="mt-2 text-sm text-slate-700">task_id: {reloadResult.task_id}</p>
              <p className="text-sm text-slate-700">report_id: {reloadResult.report_id ?? '-'}</p>
              <p className="text-sm text-slate-700">redirect_url: {reloadResult.redirect_url}</p>
            </div>
          ) : null}
        </Card>
      </div>
    </PageShell>
  );
}
