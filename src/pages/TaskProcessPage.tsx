import { useEffect, useState } from 'react';
import { getResearchTaskStatus, getResearchTaskWorkflow } from '../api/client';
import { PageShell } from '../components/common/PageShell';
import { Card } from '../components/ui/card';
import type { ResearchTaskStatusResponse, TaskWorkflowResponse, WorkflowNode } from '../types';

function nodeStatusLabel(status: WorkflowNode['node_status']) {
  if (status === 'completed') return '已完成';
  if (status === 'running') return '进行中';
  if (status === 'failed') return '失败';
  return '待处理';
}

export function TaskProcessPage() {
  const [status, setStatus] = useState<ResearchTaskStatusResponse | null>(null);
  const [workflow, setWorkflow] = useState<TaskWorkflowResponse | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const taskId = 'task-002';
    const loadData = async () => {
      try {
        const [statusResult, workflowResult] = await Promise.all([
          getResearchTaskStatus(taskId),
          getResearchTaskWorkflow(taskId),
        ]);
        setStatus(statusResult);
        setWorkflow(workflowResult);
      } catch (error) {
        const reason = error instanceof Error ? error.message : '加载任务流程失败';
        setMessage(reason);
      }
    };

    void loadData();
  }, []);

  return (
    <PageShell title="调研流程" subtitle="对齐 /api/v1/research/tasks/{task_id}/status 与 /workflow 接口。">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-7">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-950">当前任务进度</h2>
            <p className="text-sm leading-7 text-slate-600">流程节点字段：node_id、node_name、node_status。</p>
          </section>

          <div className="space-y-5">
            {workflow?.nodes.map((step, index) => (
              <div key={step.node_id} className="flex items-center gap-5 rounded-[28px] border border-slate-200/80 bg-slate-50 px-5 py-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-900">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-950">{step.node_name}</p>
                  <p className="text-sm text-slate-600">{nodeStatusLabel(step.node_status)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5 bg-slate-950 text-white">
          <h3 className="text-xl font-semibold">任务摘要</h3>
          {status ? (
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <p>task_id: {status.task_id}</p>
              <p>status: {status.status}</p>
              <p>current_stage: {status.current_stage}</p>
              <p>progress: {status.progress}%</p>
              <p>hint: {status.hint}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-300">{message || '暂无任务状态数据'}</p>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
