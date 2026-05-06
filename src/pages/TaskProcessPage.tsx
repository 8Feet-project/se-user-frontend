import { Activity, Bot, ListChecks, Shield, Workflow } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  WorkflowNodeStatus,
} from '@/types';

function statusText(status?: WorkflowNodeStatus | ResearchTaskStatusResponse['status']) {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'running':
      return '执行中';
    case 'waiting_user':
      return '等待人工';
    case 'failed':
      return '失败';
    case 'skipped':
      return '已跳过';
    case 'pending':
      return '待开始';
    case 'searching':
      return '检索中';
    case 'data_ready':
      return '数据就绪';
    case 'analyzing':
      return '分析中';
    case 'cancelled':
      return '已取消';
    default:
      return '处理中';
  }
}

function statusTone(status?: WorkflowNodeStatus | ResearchTaskStatusResponse['status']) {
  switch (status) {
    case 'completed':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100';
    case 'running':
    case 'searching':
    case 'analyzing':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-100';
    case 'waiting_user':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
    case 'failed':
    case 'cancelled':
      return 'border-rose-500/30 bg-rose-500/10 text-rose-100';
    default:
      return 'border-white/10 bg-white/[0.06] text-slate-300';
  }
}

function eventTone(level?: TaskEvent['level']) {
  switch (level) {
    case 'success':
      return 'border-emerald-500/30 bg-emerald-500/10';
    case 'warning':
      return 'border-amber-500/30 bg-amber-500/10';
    case 'error':
      return 'border-rose-500/30 bg-rose-500/10';
    default:
      return 'border-white/10 bg-white/[0.05]';
  }
}

function formatTime(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

export function TaskProcessPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTaskId = searchParams.get('task_id') ?? '';

  const [taskId, setTaskId] = useState(queryTaskId);
  const [tasks, setTasks] = useState<ResearchTaskListItem[]>([]);
  const [status, setStatus] = useState<ResearchTaskStatusResponse | null>(null);
  const [workflow, setWorkflow] = useState<TaskWorkflowResponse | null>(null);
  const [facts, setFacts] = useState<TaskFactsResponse | null>(null);
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeTaskResponse | null>(null);
  const [retryResult, setRetryResult] = useState<RetryAnalysisResponse | null>(null);
  const [crossValidationTrigger, setCrossValidationTrigger] =
    useState<TriggerCrossValidationResponse | null>(null);
  const [crossValidationResult, setCrossValidationResult] =
    useState<CrossValidationResultResponse | null>(null);
  const [loadingCrossValidationResult, setLoadingCrossValidationResult] = useState(false);
  const [interventionNode, setInterventionNode] = useState<WorkflowNode | null>(null);
  const [interventionDetail, setInterventionDetail] =
    useState<TaskInterventionDetailResponse | null>(null);
  const [interventionAction, setInterventionAction] =
    useState<TaskInterventionAction>('confirm_continue');
  const [ruleChanges, setRuleChanges] = useState('');
  const [interventionComment, setInterventionComment] = useState('');
  const [interventionResult, setInterventionResult] =
    useState<SubmitTaskInterventionResponse | null>(null);
  const [loadingIntervention, setLoadingIntervention] = useState(false);
  const [submittingIntervention, setSubmittingIntervention] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const replaceTaskParam = (nextTaskId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const currentTaskId = nextParams.get('task_id') ?? '';

    if (nextTaskId) {
      if (currentTaskId === nextTaskId) {
        return;
      }
      nextParams.set('task_id', nextTaskId);
    } else if (!currentTaskId) {
      return;
    } else {
      nextParams.delete('task_id');
    }

    setSearchParams(nextParams, { replace: true });
  };

  const loadTaskCandidates = async () => {
    const response = await getResearchTasks({ page: 1, page_size: 20 });
    setTasks(response.list);
    return response.list;
  };

  const loadTaskData = async (targetTaskId: string) => {
    const [statusResult, workflowResult, factsResult, eventsResult] = await Promise.all([
      getResearchTaskStatus(targetTaskId),
      getResearchTaskWorkflow(targetTaskId),
      getTaskFacts(targetTaskId),
      getTaskEvents(targetTaskId),
    ]);

    setStatus(statusResult);
    setWorkflow(workflowResult);
    setFacts(factsResult);
    setEvents(eventsResult);

    try {
      setLoadingCrossValidationResult(true);
      const cvResult = await getCrossValidationResult(targetTaskId);
      setCrossValidationResult(cvResult);
    } catch {
      setCrossValidationResult(null);
    } finally {
      setLoadingCrossValidationResult(false);
    }
  };

  useEffect(() => {
    if (!queryTaskId) {
      return;
    }
    setTaskId(queryTaskId);
  }, [queryTaskId]);

  useEffect(() => {
    const initializeTasks = async () => {
      try {
        const list = await loadTaskCandidates();
        if (queryTaskId) {
          setTaskId(queryTaskId);
          return;
        }

        const runningTask = list.find((item) =>
          ['pending', 'searching', 'data_ready', 'analyzing', 'waiting_user'].includes(item.status)
        );
        const nextTaskId = runningTask?.task_id ?? list[0]?.task_id ?? '';
        setTaskId(nextTaskId);
        if (nextTaskId) {
          replaceTaskParam(nextTaskId);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '加载任务列表失败');
      }
    };

    void initializeTasks();
  }, []);

  useEffect(() => {
    if (!queryTaskId || queryTaskId === taskId) {
      return;
    }

    setTaskId(queryTaskId);
  }, [queryTaskId, taskId]);

  useEffect(() => {
    if (!taskId) {
      setStatus(null);
      setWorkflow(null);
      setFacts(null);
      setEvents([]);
      setInterventionNode(null);
      setInterventionDetail(null);
      setInterventionResult(null);
      setCrossValidationTrigger(null);
      setCrossValidationResult(null);
      return;
    }

    const loadData = async () => {
      try {
        await loadTaskData(taskId);
        setMessage('');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '加载任务执行态失败');
      }
    };

    void loadData();
  }, [taskId]);

  const waitingNode = useMemo(
    () => workflow?.nodes.find((node) => node.node_id === workflow.waiting_intervention_node_id) ?? null,
    [workflow]
  );

  const activeNode = useMemo(
    () => workflow?.nodes.find((node) => node.node_id === workflow.current_node) ?? null,
    [workflow]
  );

  const handleCancelTask = async () => {
    if (!taskId) {
      setMessage('请先选择任务。');
      return;
    }
    try {
      setSubmitting(true);
      const result = await cancelResearchTask(taskId);
      await Promise.all([loadTaskCandidates(), loadTaskData(taskId)]);
      setMessage(`任务已更新为${statusText(result.status)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '取消任务失败');
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
      await Promise.all([loadTaskCandidates(), loadTaskData(taskId)]);
      setMessage(`分析任务已启动，当前状态：${statusText(result.status)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '启动分析失败');
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
      await Promise.all([loadTaskCandidates(), loadTaskData(taskId)]);
      setMessage(`已发起重试，当前状态：${statusText(result.status)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '重试分析失败');
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
      await Promise.all([loadTaskCandidates(), loadTaskData(taskId)]);
      setMessage(`交叉验证已触发，当前状态：${result.status}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '启动交叉验证失败');
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
      setMessage('已刷新交叉验证结果。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '刷新交叉验证结果失败');
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
      setInterventionAction('confirm_continue');
      setRuleChanges('');
      setInterventionComment('');
      setInterventionResult(null);
      setLoadingIntervention(true);
      const detail = await getTaskIntervention(taskId, node.node_id);
      setInterventionDetail(detail);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '加载人工介入详情失败');
    } finally {
      setLoadingIntervention(false);
    }
  };

  const handleCloseIntervention = () => {
    setInterventionNode(null);
    setInterventionDetail(null);
    setInterventionAction('confirm_continue');
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
      await Promise.all([loadTaskCandidates(), loadTaskData(taskId)]);
      setMessage(`人工介入已提交，结果：${result.result}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '提交人工介入失败');
    } finally {
      setSubmittingIntervention(false);
    }
  };

  const currentTask = useMemo(() => tasks.find((item) => item.task_id === taskId) ?? null, [tasks, taskId]);
  const workflowNodes = workflow?.nodes ?? [];
  const progress = Math.max(0, Math.min(100, status?.progress ?? 0));
  const hasCrossValidationResult = Boolean(
    crossValidationResult &&
      (crossValidationResult.consensus_points.length > 0 ||
        crossValidationResult.difference_points.length > 0 ||
        crossValidationResult.model_outputs.length > 0 ||
        crossValidationResult.used_models.length > 0)
  );

  return (
    <PageShell
      title="调研流程"
      subtitle="实时监控任务节点、事件流与交叉验证结果。页面结构参考 8Feet UI Kit，并把摘要、事件、介入入口拆成了更清晰的层级。"
      action={
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={handleAnalyzeTask} disabled={submitting || !taskId}>
            启动分析
          </Button>
          <Button size="sm" variant="secondary" onClick={handleRetryAnalysis} disabled={submitting || !taskId}>
            重试分析
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleTriggerCrossValidation}
            disabled={submitting || !taskId}
          >
            启动交叉验证
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRefreshCrossValidationResult}
            disabled={loadingCrossValidationResult || !taskId}
          >
            {loadingCrossValidationResult ? '刷新中...' : '刷新结果'}
          </Button>
          <Button size="sm" variant="secondary" onClick={handleCancelTask} disabled={submitting || !taskId}>
            取消任务
          </Button>
        </div>
      }
    >
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <div className="space-y-6">
          <Card className="space-y-7">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Workflow size={16} className="text-[#63cab7]" />
                <p className="page-kicker">Workflow Monitor</p>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-100">当前任务进度</h2>
              <p className="text-sm leading-7 text-slate-400">
                选择任务后自动加载节点进度、任务摘要和实时事件流，确保流程可见、可追踪、可介入。
              </p>
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
                <div className="max-w-xl">
                  <Label htmlFor="process-task-id">选择任务</Label>
                  <Select
                    id="process-task-id"
                    value={taskId}
                    onChange={(event) => {
                      const nextTaskId = event.target.value;
                      setTaskId(nextTaskId);
                      replaceTaskParam(nextTaskId);
                    }}
                  >
                    <option value="">请选择任务</option>
                    {tasks.map((task) => (
                      <option key={task.task_id} value={task.task_id}>
                        {task.object_name} / {task.task_id} / {statusText(task.status)}
                      </option>
                    ))}
                  </Select>
                  {tasks.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">当前暂无任务，可先从发起页创建新的调研任务。</p>
                  ) : null}
                </div>

                <div className="panel-subtle p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">当前状态</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-sm font-medium ${statusTone(status?.status)}`}>
                      {taskId ? statusText(status?.status) : '未选择任务'}
                    </span>
                    <span className="text-sm text-slate-500">进度 {status?.progress ?? 0}%</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    {taskId ? status?.hint ?? '暂无任务提示信息。' : '请选择一个任务以查看执行状态。'}
                  </p>
                </div>

                <div className="panel-subtle p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">当前节点</p>
                  <p className="mt-3 text-lg font-semibold text-slate-100">
                    {taskId ? status?.current_node_name ?? activeNode?.node_name ?? '--' : '--'}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">阶段：{taskId ? status?.current_stage ?? '--' : '--'}</p>
                  {status?.waiting_intervention ? (
                    <p className="mt-2 text-sm font-medium text-amber-400">系统正等待人工决策。</p>
                  ) : null}
                </div>
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
                <div
                  className="h-2 rounded-full bg-[#63cab7] shadow-[0_0_16px_rgba(99,202,183,0.24)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="data-pill">进度 {progress}%</span>
                {status?.hint ? <span className="data-pill">提示：{status.hint}</span> : null}
                {status?.status === 'waiting_user' ? <span className="data-pill">等待人工处理</span> : null}
              </div>
            </div>

            {status?.metrics_summary?.length ? (
              <div className="grid gap-3 md:grid-cols-3">
                {status.metrics_summary.map((metric) => (
                  <div key={metric.label} className="panel-subtle p-4">
                    <p className="text-sm text-slate-500">{metric.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-100">{metric.value}</p>
                  </div>
                ))}
              </div>
            ) : !taskId ? (
              <div className="panel-subtle p-5 text-sm text-slate-500">
                选择任务后，这里会展示抓取量、分析耗时、引用条数等过程指标。
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {waitingNode ? (
                <Button size="sm" onClick={() => handleOpenIntervention(waitingNode)} disabled={submitting || !taskId}>
                  处理待介入节点
                </Button>
              ) : null}
              <Button size="sm" variant="secondary" onClick={() => navigate(`/report?task_id=${taskId}`)} disabled={!taskId}>
                查看报告
              </Button>
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">流程节点</h3>
            </div>
            <div className="space-y-4">
              {!taskId ? (
                <div className="panel-subtle p-6 text-sm text-slate-500">
                  暂未选中任务，无法展示流程节点。请先从顶部任务下拉框中选择一个调研任务。
                </div>
              ) : workflowNodes.length > 0 ? (
                workflowNodes.map((step, index) => {
                  const isCurrent = workflow?.current_node === step.node_id;
                  const isWaiting = step.node_id === workflow?.waiting_intervention_node_id;
                  return (
                    <div
                      key={step.node_id}
                      className={`rounded-[28px] border px-5 py-5 transition-all ${
                        isWaiting
                          ? 'border-amber-300 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                          : isCurrent
                            ? 'border-[rgba(99,202,183,0.3)] bg-[rgba(99,202,183,0.07)] shadow-[0_0_20px_rgba(99,202,183,0.06)]'
                            : 'border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_28px_rgba(0,0,0,0.12)]'
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(99,202,183,0.25)] bg-[rgba(99,202,183,0.08)] text-sm font-semibold text-[#63cab7]">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-sm font-semibold text-slate-100 sm:text-base">{step.node_name}</p>
                              <StatusBadge status={step.node_status} />
                              {step.node_type ? <span className="data-pill">{step.node_type}</span> : null}
                              {isCurrent ? <span className="data-pill">当前节点</span> : null}
                              {isWaiting ? <span className="data-pill">等待人工</span> : null}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">节点 ID：{step.node_id}</p>
                            {step.description ? <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p> : null}
                            {step.summary ? <p className="mt-1 text-sm leading-6 text-slate-300">{step.summary}</p> : null}
                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                              <span>开始：{formatTime(step.started_at)}</span>
                              <span>结束：{formatTime(step.finished_at)}</span>
                              <span>更新：{formatTime(step.updated_at)}</span>
                            </div>
                            {step.metrics?.length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {step.metrics.map((metric) => (
                                  <span key={`${step.node_id}-${metric.label}`} className="data-pill">
                                    {metric.label}：{metric.value}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {step.can_intervene ? (
                          <Button
                            size="sm"
                            variant={isWaiting ? 'default' : 'secondary'}
                            onClick={() => handleOpenIntervention(step)}
                          >
                            {isWaiting ? '立即人工介入' : '查看介入选项'}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="panel-subtle p-5 text-sm text-slate-500">
                  当前任务暂无流程节点数据，可能尚未启动分析或接口暂未返回工作流详情。
                </div>
              )}
            </div>
          </Card>
        </div>

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
                  <p><span className="text-slate-500">对象：</span>{status.object_name ?? '--'} / {status.object_type ?? '--'}</p>
                  <p><span className="text-slate-500">状态：</span>{statusText(status.status)}</p>
                  <p><span className="text-slate-500">当前阶段：</span>{status.current_stage}</p>
                  <p><span className="text-slate-500">当前节点：</span>{status.current_node_name ?? activeNode?.node_name ?? '--'}</p>
                  <p><span className="text-slate-500">进度：</span>{progress}%</p>
                </div>
                {analyzeResult ? (
                  <div className="panel-subtle p-4">
                    <p><span className="text-slate-500">分析已启动：</span>{statusText(analyzeResult.status)}</p>
                    {analyzeResult.report_id ? <p><span className="text-slate-500">关联报告：</span>{analyzeResult.report_id}</p> : null}
                  </div>
                ) : null}
                {retryResult ? (
                  <div className="panel-subtle p-4">
                    <p><span className="text-slate-500">重试状态：</span>{statusText(retryResult.status)}</p>
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
              <Shield size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">多模型交叉验证</h3>
            </div>
            <div className="panel-subtle p-4 text-sm text-slate-300">
              {crossValidationTrigger ? <p><span className="text-slate-500">触发状态：</span>{crossValidationTrigger.status}</p> : null}
              {loadingCrossValidationResult ? <p className="text-slate-400">正在刷新交叉验证结果...</p> : null}
              {hasCrossValidationResult && crossValidationResult ? (
                <div className="space-y-3">
                  {crossValidationResult.used_models.length > 0 ? (
                    <div>
                      <p className="text-slate-500">有效模型：</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {crossValidationResult.used_models.map((item) => (
                          <span key={item} className="data-pill">{item}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {crossValidationResult.consensus_score !== null && crossValidationResult.consensus_score !== undefined ? (
                    <p><span className="text-slate-500">一致性得分：</span>{crossValidationResult.consensus_score}</p>
                  ) : null}
                  {crossValidationResult.consensus_summary ? (
                    <p><span className="text-slate-500">结论摘要：</span>{crossValidationResult.consensus_summary}</p>
                  ) : null}
                  {crossValidationResult.consensus_points.length > 0 ? (
                    <div>
                      <p className="text-slate-500">共识观点：</p>
                      <div className="mt-2 space-y-2">
                        {crossValidationResult.consensus_points.map((item) => (
                          <div key={item} className="panel-solid p-3 text-xs leading-6 text-slate-300">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {crossValidationResult.difference_points.length > 0 ? (
                    <div>
                      <p className="text-slate-500">差异观点：</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {crossValidationResult.difference_points.map((item) => (
                          <span key={item} className="data-pill">{item}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="space-y-2 border-t border-white/8 pt-3">
                    {crossValidationResult.model_outputs.map((item) => (
                      <div key={item.model_id} className="panel-solid p-3 text-xs leading-6 text-slate-300">
                        <p className="font-medium text-slate-100">{item.model_id}</p>
                        <p className="mt-1">{item.summary}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">更新时间：{formatTime(crossValidationResult.updated_at)}</p>
                </div>
              ) : (
                !loadingCrossValidationResult && <p className="text-slate-500">暂无交叉验证结果。</p>
              )}
            </div>
          </Card>


        </div>
      </div>

      {interventionNode ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/60 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-8">
          <div className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center">
            <div className="glass-card flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:max-h-[calc(100vh-4rem)] sm:p-8">
              <div className="flex flex-col gap-4 border-b border-[rgba(99,202,183,0.1)] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Human in the loop</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-100">
                    {interventionDetail?.node_name ?? interventionNode.node_name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">task_id：{taskId} · node_id：{interventionNode.node_id}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={handleCloseIntervention}>
                  关闭
                </Button>
              </div>

              {loadingIntervention ? (
                <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-2">
                  <p className="text-sm text-slate-400">正在加载人工介入详情...</p>
                </div>
              ) : (
                <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 sm:pr-2">
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="panel-subtle p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">触发原因</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {interventionDetail?.reason ?? '暂无原因说明。'}
                      </p>
                    </div>
                    <div className="panel-subtle p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">建议动作</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {interventionDetail?.suggested_action ?? '暂无建议。'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>current_params</Label>
                    <Textarea
                      value={JSON.stringify(interventionDetail?.current_params ?? {}, null, 2)}
                      readOnly
                      rows={4}
                      className="font-mono text-xs leading-6"
                    />
                  </div>

                  <div>
                    <Label>preview_data</Label>
                    <Textarea
                      value={JSON.stringify(interventionDetail?.preview_data ?? {}, null, 2)}
                      readOnly
                      rows={4}
                      className="font-mono text-xs leading-6"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="intervention-action">action</Label>
                      <Select
                        id="intervention-action"
                        value={interventionAction}
                        onChange={(event) => setInterventionAction(event.target.value as TaskInterventionAction)}
                      >
                        <option value="confirm_continue">confirm_continue</option>
                        <option value="update_rules">update_rules</option>
                        <option value="skip_intervention">skip_intervention</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="intervention-comment">comment（可选）</Label>
                      <Input
                        id="intervention-comment"
                        value={interventionComment}
                        onChange={(event) => setInterventionComment(event.target.value)}
                        placeholder="填写操作说明"
                      />
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
                      disabled={interventionAction !== 'update_rules'}
                      className="font-mono text-xs leading-6"
                    />
                  </div>

                  {interventionResult ? (
                    <div className="panel-subtle p-4 text-sm text-slate-300">
                      <p>结果：{interventionResult.result}</p>
                      <p>审计日志：{interventionResult.audit_log_id}</p>
                    </div>
                  ) : null}

                  <div className="flex justify-end gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCloseIntervention}
                      disabled={submittingIntervention}
                    >
                      取消
                    </Button>
                    <Button size="sm" onClick={handleSubmitIntervention} disabled={submittingIntervention}>
                      {submittingIntervention ? '提交中...' : '提交人工介入'}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/report?task_id=${taskId}`)}
                      disabled={!taskId}
                    >
                      查看报告
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
