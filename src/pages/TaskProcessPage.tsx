import { Activity, Bot, ListChecks, Shield, Sparkles, Workflow } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  analyzeTask,
  cancelResearchTask,
  getCrossValidationResult,
  getResearchTaskStatus,
  getResearchTaskWorkflow,
  getResearchTasks,
  getTaskEvents,
  getTaskFacts,
  getTaskIntervention,
  retryAnalysis,
  submitTaskIntervention,
  triggerCrossValidation,
} from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import type {
  AnalyzeTaskResponse,
  CrossValidationResultResponse,
  ResearchTaskListItem,
  ResearchTaskStatusResponse,
  RetryAnalysisResponse,
  SubmitTaskInterventionResponse,
  TaskEvent,
  TaskFactsResponse,
  TaskInterventionAction,
  TaskInterventionDetailResponse,
  TaskWorkflowResponse,
  TriggerCrossValidationResponse,
  WorkflowNode,
} from '@/types';

export function TaskProcessPage() {
  const [taskId, setTaskId] = useState('');
  const [tasks, setTasks] = useState<ResearchTaskListItem[]>([]);
  const [status, setStatus] = useState<ResearchTaskStatusResponse | null>(null);
  const [workflow, setWorkflow] = useState<TaskWorkflowResponse | null>(null);
  const [facts, setFacts] = useState<TaskFactsResponse | null>(null);
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeTaskResponse | null>(null);
  const [retryResult, setRetryResult] = useState<RetryAnalysisResponse | null>(null);
  const [crossValidationTrigger, setCrossValidationTrigger] = useState<TriggerCrossValidationResponse | null>(null);
  const [crossValidationResult, setCrossValidationResult] = useState<CrossValidationResultResponse | null>(null);
  const [loadingCrossValidationResult, setLoadingCrossValidationResult] = useState(false);
  const [interventionNode, setInterventionNode] = useState<WorkflowNode | null>(null);
  const [interventionDetail, setInterventionDetail] = useState<TaskInterventionDetailResponse | null>(null);
  const [interventionAction, setInterventionAction] = useState<TaskInterventionAction>('confirm');
  const [ruleChanges, setRuleChanges] = useState('');
  const [interventionComment, setInterventionComment] = useState('');
  const [interventionResult, setInterventionResult] = useState<SubmitTaskInterventionResponse | null>(null);
  const [loadingIntervention, setLoadingIntervention] = useState(false);
  const [submittingIntervention, setSubmittingIntervention] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTaskCandidates = async () => {
      try {
        const response = await getResearchTasks({ page: 1, page_size: 20 });
        setTasks(response.list);
        const runningTask = response.list.find((item) => ['pending', 'searching', 'data_ready', 'analyzing'].includes(item.status));
        setTaskId(runningTask?.task_id ?? response.list[0]?.task_id ?? '');
      } catch (error) {
        const reason = error instanceof Error ? error.message : '加载任务列表失败';
        setMessage(reason);
      }
    };

    void loadTaskCandidates();
  }, []);

  useEffect(() => {
    if (!taskId) {
      setStatus(null);
      setWorkflow(null);
      setFacts(null);
      setEvents([]);
      setCrossValidationTrigger(null);
      setCrossValidationResult(null);
      setInterventionNode(null);
      setInterventionDetail(null);
      setInterventionResult(null);
      return;
    }

    const loadData = async () => {
      try {
        const [statusResult, workflowResult, factsResult, eventsResult] = await Promise.all([
          getResearchTaskStatus(taskId),
          getResearchTaskWorkflow(taskId),
          getTaskFacts(taskId),
          getTaskEvents(taskId),
        ]);
        setStatus(statusResult);
        setWorkflow(workflowResult);
        setFacts(factsResult);
        setEvents(eventsResult);
        setMessage('');
        try {
          setLoadingCrossValidationResult(true);
          const cvResult = await getCrossValidationResult(taskId);
          setCrossValidationResult(cvResult);
        } catch {
          setCrossValidationResult(null);
        } finally {
          setLoadingCrossValidationResult(false);
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : '加载任务流程失败';
        setMessage(reason);
      }
    };

    void loadData();
  }, [taskId]);

  const handleCancelTask = async () => {
    if (!taskId) {
      setMessage('请先选择任务。');
      return;
    }
    try {
      setSubmitting(true);
      const result = await cancelResearchTask(taskId);
      setMessage(`任务取消结果：${result.status}`);
      setStatus((prev) => (prev ? { ...prev, status: result.status } : prev));
    } catch (error) {
      const reason = error instanceof Error ? error.message : '取消任务失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnalyzeTask = async () => {
    if (!taskId) {
      setMessage('请先选择任务。');
      return;
    }
    try {
      setSubmitting(true);
      const result = await analyzeTask(taskId, {
        model_id: 'model-deepseek-v3',
        report_mode: 'full',
      });
      setAnalyzeResult(result);
      setMessage(`分析已启动：${result.status}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '启动分析失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryAnalysis = async () => {
    if (!taskId) {
      setMessage('请先选择任务。');
      return;
    }
    try {
      setSubmitting(true);
      const result = await retryAnalysis(taskId, { model_id: 'model-gpt-4.1' });
      setRetryResult(result);
      setMessage(`重试分析状态：${result.status}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '重试分析失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerCrossValidation = async () => {
    if (!taskId) {
      setMessage('请先选择任务。');
      return;
    }
    try {
      setSubmitting(true);
      const result = await triggerCrossValidation(taskId);
      setCrossValidationTrigger(result);
      setMessage(`多模型交叉验证已启动：${result.status}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '启动多模型交叉验证失败';
      setMessage(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshCrossValidationResult = async () => {
    if (!taskId) {
      setMessage('请先选择任务。');
      return;
    }
    try {
      setLoadingCrossValidationResult(true);
      const result = await getCrossValidationResult(taskId);
      setCrossValidationResult(result);
      setMessage('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '查询交叉验证结果失败';
      setMessage(reason);
    } finally {
      setLoadingCrossValidationResult(false);
    }
  };

  const handleOpenIntervention = async (node: WorkflowNode) => {
    if (!taskId) {
      setMessage('请先选择任务。');
      return;
    }
    try {
      setInterventionNode(node);
      setInterventionAction('confirm');
      setRuleChanges('');
      setInterventionComment('');
      setInterventionResult(null);
      setLoadingIntervention(true);
      const detail = await getTaskIntervention(taskId, node.node_id);
      setInterventionDetail(detail);
      setMessage('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '加载人工介入详情失败';
      setMessage(reason);
    } finally {
      setLoadingIntervention(false);
    }
  };

  const handleCloseIntervention = () => {
    setInterventionNode(null);
    setInterventionDetail(null);
    setInterventionAction('confirm');
    setRuleChanges('');
    setInterventionComment('');
    setInterventionResult(null);
    setLoadingIntervention(false);
    setSubmittingIntervention(false);
  };

  const handleSubmitIntervention = async () => {
    if (!taskId || !interventionNode) {
      setMessage('请先选择任务和节点。');
      return;
    }
    try {
      setSubmittingIntervention(true);
      const result = await submitTaskIntervention(taskId, interventionNode.node_id, {
        action: interventionAction,
        rule_changes: ruleChanges.trim() || undefined,
        comment: interventionComment.trim() || undefined,
      });
      setInterventionResult(result);
      setMessage(`人工介入提交成功：${result.result}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '提交人工介入失败';
      setMessage(reason);
    } finally {
      setSubmittingIntervention(false);
    }
  };

  const currentTask = useMemo(() => tasks.find((item) => item.task_id === taskId) ?? null, [tasks, taskId]);
  const workflowNodes = workflow?.nodes ?? [];
  const progress = Math.max(0, Math.min(100, status?.progress ?? 0));

  return (
    <PageShell
      title="调研流程"
      subtitle="实时监控任务节点、事件流与交叉验证结果。页面结构参考 8Feet UI Kit，并把摘要、事件、介入入口拆成了更清晰的层级。"
      action={
        <Button variant="secondary" onClick={handleRefreshCrossValidationResult} disabled={loadingCrossValidationResult || !taskId}>
          {loadingCrossValidationResult ? '刷新中...' : '刷新结果'}
        </Button>
      }
    >
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <Card className="space-y-7">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Workflow size={16} className="text-[#63cab7]" />
              <p className="page-kicker">Workflow Monitor</p>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-100">当前任务进度</h2>
            <p className="text-sm leading-7 text-slate-400">选择任务后自动加载节点进度、任务摘要和实时事件流，确保流程可见、可追踪、可介入。</p>
            <div className="max-w-xl">
              <Label htmlFor="process-task-id">选择任务</Label>
              <Select id="process-task-id" value={taskId} onChange={(event) => setTaskId(event.target.value)}>
                <option value="">请选择任务</option>
                {tasks.map((task) => (
                  <option key={task.task_id} value={task.task_id}>
                    {task.task_id} / {task.object_name} / {task.status}
                  </option>
                ))}
              </Select>
            </div>
          </section>

          <div className="panel-subtle p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">{currentTask?.object_name ?? '未选择任务'}</p>
                <p className="mt-1 text-sm text-slate-400">{status?.current_stage ?? '等待任务加载'}</p>
              </div>
              {status ? <StatusBadge status={status.status} /> : null}
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/[0.06]">
              <div className="h-2 rounded-full bg-[#63cab7] shadow-[0_0_16px_rgba(99,202,183,0.24)]" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="data-pill">进度 {progress}%</span>
              {status?.hint ? <span className="data-pill">提示：{status.hint}</span> : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={handleCancelTask} disabled={submitting || !taskId}>
              取消任务
            </Button>
            <Button size="sm" variant="secondary" onClick={handleAnalyzeTask} disabled={submitting || !taskId}>
              启动分析
            </Button>
            <Button size="sm" variant="secondary" onClick={handleRetryAnalysis} disabled={submitting || !taskId}>
              重试分析
            </Button>
            <Button size="sm" variant="secondary" onClick={handleTriggerCrossValidation} disabled={submitting || !taskId}>
              启动交叉验证
            </Button>
          </div>

          <div className="space-y-4">
            {workflowNodes.length > 0 ? (
              workflowNodes.map((step, index) => {
                const isCurrent = workflow?.current_node === step.node_id;
                return (
                  <div
                    key={step.node_id}
                    className={`rounded-[28px] border px-5 py-5 transition-all ${
                      isCurrent
                        ? 'border-[rgba(99,202,183,0.3)] bg-[rgba(99,202,183,0.07)] shadow-[0_0_20px_rgba(99,202,183,0.06)]'
                        : 'border-white/8 bg-white/4'
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(99,202,183,0.25)] bg-[rgba(99,202,183,0.08)] text-sm font-semibold text-[#63cab7]">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-sm font-semibold text-slate-100 sm:text-base">{step.node_name}</p>
                          <StatusBadge status={step.node_status} />
                          {isCurrent ? <span className="data-pill">当前节点</span> : null}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-400">节点 ID：{step.node_id}</p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => handleOpenIntervention(step)}>
                        人工介入
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="panel-subtle p-5 text-sm text-slate-500">当前没有可展示的流程节点。</div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card variant="glow" className="space-y-5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">任务摘要</h3>
            </div>
            {status ? (
              <div className="space-y-3 text-sm leading-7 text-slate-300">
                <div className="panel-subtle p-4">
                  <p><span className="text-slate-500">任务 ID：</span>{status.task_id}</p>
                  <p><span className="text-slate-500">状态：</span>{status.status}</p>
                  <p><span className="text-slate-500">当前阶段：</span>{status.current_stage}</p>
                  <p><span className="text-slate-500">进度：</span>{progress}%</p>
                </div>
                {analyzeResult ? (
                  <div className="panel-subtle p-4">
                    <p><span className="text-slate-500">分析已启动：</span>{analyzeResult.status}</p>
                    {analyzeResult.report_id ? <p><span className="text-slate-500">关联报告：</span>{analyzeResult.report_id}</p> : null}
                  </div>
                ) : null}
                {retryResult ? (
                  <div className="panel-subtle p-4">
                    <p><span className="text-slate-500">重试状态：</span>{retryResult.status}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="panel-subtle p-4 text-sm text-slate-500">暂无任务状态数据。</div>
            )}
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">数据事实层</h3>
            </div>
            {facts ? (
              <div className="space-y-4">
                <div className="panel-subtle p-4 text-sm text-slate-300">
                  <p><span className="text-slate-500">数据条目：</span>{facts.fact_count}</p>
                  <p><span className="text-slate-500">数据版本：</span>{facts.dataset_version}</p>
                  <p><span className="text-slate-500">关键实体：</span>{facts.top_entities.join('、') || '暂无'}</p>
                </div>
                <div className="space-y-2">
                  {facts.sources.map((source) => (
                    <div key={source.source_name} className="panel-subtle flex items-center justify-between p-3 text-sm text-slate-300">
                      <span>{source.source_name}</span>
                      <span className="text-slate-500">{source.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="panel-subtle p-4 text-sm text-slate-500">暂无事实层数据。</div>
            )}
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <ListChecks size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">实时事件流</h3>
            </div>
            <div className="space-y-3">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={`${event.node_id}-${event.timestamp}`} className="panel-subtle p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{event.node_name}</p>
                        <p className="mt-1 text-xs text-slate-500">{event.timestamp}</p>
                      </div>
                      <StatusBadge status={event.node_status} />
                    </div>
                    <div className="mt-3 text-xs leading-6 text-slate-400">
                      {Object.entries(event.metrics).length > 0
                        ? Object.entries(event.metrics)
                            .map(([key, value]) => `${key}: ${String(value)}`)
                            .join(' · ')
                        : '当前事件暂无附加指标'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="panel-subtle p-4 text-sm text-slate-500">当前没有事件日志。</div>
              )}
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">多模型交叉验证</h3>
            </div>
            <div className="panel-subtle p-4 text-sm text-slate-300">
              {crossValidationTrigger ? <p><span className="text-slate-500">触发状态：</span>{crossValidationTrigger.status}</p> : null}
              {loadingCrossValidationResult ? <p className="text-slate-400">正在刷新交叉验证结果...</p> : null}
              {crossValidationResult ? (
                <div className="space-y-3">
                  <p><span className="text-slate-500">验证状态：</span>{crossValidationResult.status}</p>
                  {crossValidationResult.consensus_score != null ? <p><span className="text-slate-500">共识评分：</span>{crossValidationResult.consensus_score}</p> : null}
                  {crossValidationResult.consensus_summary ? <p><span className="text-slate-500">结论摘要：</span>{crossValidationResult.consensus_summary}</p> : null}
                  {crossValidationResult.disagreements?.length ? (
                    <div>
                      <p className="text-slate-500">分歧点：</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {crossValidationResult.disagreements.map((item) => (
                          <span key={item} className="data-pill">{item}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="space-y-2 border-t border-white/8 pt-3">
                    {crossValidationResult.results.map((item) => (
                      <div key={item.model_id} className="panel-solid p-3 text-xs leading-6 text-slate-300">
                        <p className="font-medium text-slate-100">{item.model_id}</p>
                        <p className="mt-1">{item.conclusion}</p>
                        {item.confidence != null ? <p className="mt-1 text-slate-500">置信度：{item.confidence}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                !loadingCrossValidationResult && <p className="text-slate-500">暂无交叉验证结果。</p>
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">设计落地说明</h3>
            </div>
            <p className="text-sm leading-7 text-slate-400">
              这里把流程节点、事实层、事件流、交叉验证结果拆成四张独立卡片，符合设计系统强调的“深色分层 + teal 边界 + 状态清晰”的信息结构。
            </p>
          </Card>
        </div>
      </div>

      {interventionNode ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-3xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="flex flex-col gap-4 border-b border-[rgba(99,202,183,0.1)] pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-100">人工介入</h3>
                <p className="mt-1 text-sm text-slate-400">任务 {taskId} · 节点 {interventionNode.node_id}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={handleCloseIntervention}>
                关闭
              </Button>
            </div>

            {loadingIntervention ? (
              <p className="mt-6 text-sm text-slate-400">正在加载人工介入详情...</p>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>node_name</Label>
                    <Input value={interventionDetail?.node_name ?? interventionNode.node_name} readOnly />
                  </div>
                  <div>
                    <Label>intervention_type</Label>
                    <Input value={interventionDetail?.intervention_type ?? ''} readOnly />
                  </div>
                </div>

                <div>
                  <Label>current_params</Label>
                  <Textarea value={JSON.stringify(interventionDetail?.current_params ?? {}, null, 2)} readOnly rows={4} className="font-mono text-xs leading-6" />
                </div>

                <div>
                  <Label>preview_data</Label>
                  <Textarea value={JSON.stringify(interventionDetail?.preview_data ?? {}, null, 2)} readOnly rows={4} className="font-mono text-xs leading-6" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="intervention-action">action</Label>
                    <Select id="intervention-action" value={interventionAction} onChange={(event) => setInterventionAction(event.target.value as TaskInterventionAction)}>
                      <option value="confirm">confirm</option>
                      <option value="update_rule">update_rule</option>
                      <option value="skip">skip</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="intervention-comment">comment（可选）</Label>
                    <Input id="intervention-comment" value={interventionComment} onChange={(event) => setInterventionComment(event.target.value)} placeholder="填写操作说明" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="intervention-rule-changes">rule_changes（可选）</Label>
                  <Textarea
                    id="intervention-rule-changes"
                    value={ruleChanges}
                    onChange={(event) => setRuleChanges(event.target.value)}
                    placeholder="可填写规则调整 JSON 或说明文本"
                    rows={4}
                    disabled={interventionAction !== 'update_rule'}
                    className="font-mono text-xs leading-6"
                  />
                </div>

                {interventionResult ? (
                  <div className="panel-subtle p-4 text-sm text-slate-300">
                    <p>结果：{interventionResult.result}</p>
                    <p>审计日志：{interventionResult.audit_log_id}</p>
                  </div>
                ) : null}

                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={handleCloseIntervention} disabled={submittingIntervention}>
                    取消
                  </Button>
                  <Button size="sm" onClick={handleSubmitIntervention} disabled={submittingIntervention}>
                    {submittingIntervention ? '提交中...' : '提交人工介入'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
