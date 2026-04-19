import { useEffect, useState } from 'react';
import {
  getResearchHistory,
  getResearchHistoryDetail,
  reloadResearchHistory,
} from '../api/client';
import { Button } from '../components/ui/button';
import { PageShell } from '../components/common/PageShell';
import { Card } from '../components/ui/card';
import { StatusBadge } from '../components/ui/status-badge';
import type { HistoryTaskItem, ResearchHistoryDetail, ResearchHistoryReloadResponse } from '../types';

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

  return (
    <PageShell title="历史记录" subtitle="回溯历史调研任务，重载已完成任务的分析结果。">
      <div className="grid gap-8">
        <Card className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-slate-100">调研历史</h2>
            <p className="text-sm text-slate-500">共 {tasks.length} 条记录</p>
          </div>

          <div className="grid gap-4">
            {tasks.map((task) => (
              <div key={task.task_id} className="rounded-[28px] border border-white/8 bg-white/4 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-200">{task.object_name}</p>
                    <p className="mt-0.5 text-sm text-slate-400">{objectTypeLabel(task.object_type)}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{task.task_id}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <p className="mt-3 text-xs text-slate-500">提交时间：{task.created_at}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLoadDetail(task.task_id)}
                    disabled={submittingTaskId === task.task_id}
                  >
                    查看详情
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
            <div className="rounded-[28px] border border-[rgba(99,202,183,0.2)] bg-white/4 px-5 py-5">
              <p className="text-sm font-semibold text-slate-200">任务详情</p>
              <div className="mt-3 space-y-1.5 text-sm text-slate-300">
                <p><span className="text-slate-500">调研对象：</span>{selectedDetail.object_name}</p>
                <p className="flex items-center gap-2"><span className="text-slate-500">状态：</span><StatusBadge status={selectedDetail.status} /></p>
                <p><span className="text-slate-500">数据集：</span>{selectedDetail.fact_dataset}</p>
              </div>
            </div>
          ) : null}

          {reloadResult ? (
            <div className="rounded-[28px] border border-[rgba(99,202,183,0.2)] bg-white/4 px-5 py-5">
              <p className="text-sm font-semibold text-slate-200">重载完成</p>
              <div className="mt-3 space-y-1.5 text-sm text-slate-300">
                <p><span className="text-slate-500">任务 ID：</span>{reloadResult.task_id}</p>
                <p><span className="text-slate-500">报告 ID：</span>{reloadResult.report_id ?? '待生成'}</p>
                {reloadResult.redirect_url ? (
                  <p><span className="text-slate-500">跳转链接：</span>{reloadResult.redirect_url}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {message ? <p className="text-sm text-slate-400">{message}</p> : null}
        </Card>
      </div>
    </PageShell>
  );
}
