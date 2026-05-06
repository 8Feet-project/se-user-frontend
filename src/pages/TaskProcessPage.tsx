import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  FileSearch,
  GitBranch,
  Info,
  ListChecks,
  PlayCircle,
  RefreshCcw,
  Shield,
  Sparkles,
  Workflow,
} from 'lucide-react';
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
      return 'border-amber-500/30 bg-amber-500/12 text-amber-100';
    case 'failed':
    case 'cancelled':
      return 'border-rose-500/30 bg-rose-500/10 text-rose-100';
    case 'skipped':
      return 'border-slate-500/20 bg-slate-500/10 text-slate-300';
    default:
      return 'border-white/10 bg-white/[0.06] text-slate-300';
  }
}

function eventMeta(level?: TaskEvent['level']) {
  switch (level) {
    case 'success':
      return {
        icon: CheckCircle2,
        label: '成功',
        markerClass: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
        panelClass: 'border-emerald-500/20 bg-emerald-500/[0.06]',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        label: '告警',
        markerClass: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
        panelClass: 'border-amber-500/20 bg-amber-500/[0.06]',
      };
    case 'error':
      return {
        icon: AlertTriangle,
        label: '异常',
        markerClass: 'border-rose-500/30 bg-rose-500/15 text-rose-300',
        panelClass: 'border-rose-500/20 bg-rose-500/[0.06]',
      };
    default:
      return {
        icon: Info,
        label: '信息',
        markerClass: 'border-sky-500/30 bg-sky-500/15 text-sky-300',
        panelClass: 'border-white/10 bg-white/[0.04]',
      };
  }
}

function formatTime(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
}

function formatDuration(durationMs?: number) {
  if (!durationMs || durationMs <= 0) return '--';
  if (durationMs < 1000) return `${durationMs} ms`;

  const seconds = Math.round(durationMs / 1000);
  if (seconds < 60) return `${seconds} 秒`;

  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  if (minutes < 60) {
    return remainSeconds > 0 ? `${minutes} 分 ${remainSeconds} 秒` : `${minutes} 分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return remainMinutes > 0 ? `${hours} 小时 ${remainMinutes} 分` : `${hours} 小时`;
}

function nodeTypeText(nodeType?: string) {
  switch (nodeType) {
    case 'ingest':
      return '任务接入';
    case 'retrieval':
      return '数据检索';
    case 'analysis':
      return '结构化分析';
    case 'report':
      return '报告生成';
    default:
      return nodeType ?? '流程节点';
  }
}

function interventionActionText(action: TaskInterventionAction) {
  switch (action) {
    case 'confirm_continue':
      return '确认后继续执行';
    case 'update_rules':
      return '调整规则并重试';
    case 'skip_intervention':
      return '跳过该次介入';
    default:
      return action;
  }
}

function crossValidationStatusText(status?: CrossValidationResultResponse['status'] | TriggerCrossValidationResponse['status']) {
  switch (status) {
    case 'queued':
      return '排队中';
    case 'running':
      return '运行中';
    case 'completed':
      return '已完成';
    case 'failed':
      return '失败';
    default:
      return '未触发';
  }
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

  const handleRefreshTaskData = async () => {
    if (!taskId) {
      setMessage('请先选择任务。');
      return;
    }
    try {
      setSubmitting(true);
      await Promise.all([loadTaskCandidates(), loadTaskData(taskId)]);
      setMessage('流程数据已刷新。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '刷新流程失败');
    } finally {
      setSubmitting(false);
    }
  };

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
      setMessage(`交叉验证已触发，当前状态：${crossValidationStatusText(result.status)}`);
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
  const completedCount = workflowNodes.filter((node) => node.node_status === 'completed').length;
  const waitingCount = workflowNodes.filter((node) => node.node_status === 'waiting_user').length;
  const failedCount = workflowNodes.filter((node) => node.node_status === 'failed').length;
  const sortedEvents = useMemo(
    () => [...events].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()),
    [events]
  );
  const latestEvent = sortedEvents[0] ?? null;
  const sortedSources = useMemo(
    () => [...(facts?.sources ?? [])].sort((left, right) => right.count - left.count),
    [facts]
  );
  const maxSourceCount = sortedSources[0]?.count ?? 1;
  const hasCrossValidationResult = Boolean(
    crossValidationResult &&
      (crossValidationResult.consensus_points.length > 0 ||
        crossValidationResult.difference_points.length > 0 ||
        crossValidationResult.model_outputs.length > 0 ||
        crossValidationResult.used_models.length > 0)
  );
  const nextNodeById = useMemo(() => {
    const nodeMap = new Map(workflowNodes.map((node) => [node.node_id, node]));
    return new Map((workflow?.edges ?? []).map((edge) => [edge.from, nodeMap.get(edge.to) ?? null]));
  }, [workflow, workflowNodes]);

  return (
    <PageShell
      title="调研流程"
      subtitle="围绕当前任务、异常节点与事件回放组织的实时流程监控界面。先看系统卡在哪里，再决定是否介入、重试或继续生成报告。"
      action={
        <div className="flex flex-wrap gap-2">
          {waitingNode ? (
            <Button size="sm" onClick={() => handleOpenIntervention(waitingNode)} disabled={submitting || !taskId}>
              <AlertTriangle size={14} />
              处理待介入节点
            </Button>
          ) : null}
          <Button size="sm" variant="secondary" onClick={handleRefreshTaskData} disabled={submitting || !taskId}>
            <RefreshCcw size={14} />
            刷新流程
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/report?task_id=${taskId}`)} disabled={!taskId}>
            <FileSearch size={14} />
            查看报告
          </Button>
        </div>
      }
    >
      {message ? <div className="message-strip mb-6">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <div className="space-y-6">
          <Card variant="glow" className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Workflow size={16} className="text-[#63cab7]" />
                  <p className="page-kicker">Live Workflow</p>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-100">
                  {currentTask?.object_name ?? status?.object_name ?? '请选择一个调研任务'}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                  {!taskId
                    ? '先选择一个任务，界面会自动加载节点进度、过程事件和介入入口。'
                    : status?.hint ?? '系统正在持续同步流程状态。'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-sm font-medium ${statusTone(status?.status)}`}>
                  {taskId ? statusText(status?.status) : '未选择任务'}
                </span>
                {status?.waiting_intervention ? <span className="data-pill">等待人工决策</span> : null}
                {currentTask?.object_type ?? status?.object_type ? (
                  <span className="data-pill">{currentTask?.object_type ?? status?.object_type}</span>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
              <div className="rounded-[28px] border border-[rgba(99,202,183,0.2)] bg-[rgba(7,17,31,0.54)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_40px_rgba(0,0,0,0.18)]">
                <div className="max-w-xl">
                  <Label htmlFor="process-task-id">当前任务</Label>
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

                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-slate-500">阶段</span>
                  <span className="font-semibold text-slate-100">{status?.current_stage ?? '--'}</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="text-slate-500">节点</span>
                  <span className="font-semibold text-slate-100">
                    {status?.current_node_name ?? activeNode?.node_name ?? '--'}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Process completion</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-100">{progress}%</p>
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      <p>{completedCount}/{workflowNodes.length || 0} 节点已完成</p>
                      <p className="mt-1">最后同步：{latestEvent ? formatTime(latestEvent.timestamp) : '--'}</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/[0.06]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#63cab7] via-[#7dd8c9] to-sky-400 shadow-[0_0_24px_rgba(99,202,183,0.26)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="data-pill">待人工 {waitingCount}</span>
                    <span className="data-pill">失败节点 {failedCount}</span>
                    <span className="data-pill">事件 {sortedEvents.length}</span>
                    {facts ? <span className="data-pill">事实 {facts.fact_count}</span> : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="panel-subtle p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">当前节点</p>
                  <p className="mt-3 text-lg font-semibold text-slate-100">
                    {status?.current_node_name ?? activeNode?.node_name ?? '--'}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {activeNode?.summary ?? activeNode?.description ?? '当前尚未返回节点摘要。'}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-4 ${
                    waitingNode
                      ? 'border-amber-500/25 bg-amber-500/[0.08] shadow-[0_0_24px_rgba(245,158,11,0.08)]'
                      : 'border-white/10 bg-white/[0.04]'
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {waitingNode ? '当前阻塞点' : '系统建议'}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-100">
                    {waitingNode ? '需要人工确认后再继续' : '当前流程可自动推进'}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {waitingNode
                      ? waitingNode.summary ?? waitingNode.description ?? '该节点正在等待人工决策。'
                      : latestEvent?.message ?? '当前没有阻塞事件，建议继续观察节点执行结果。'}
                  </p>
                  {waitingNode ? (
                    <Button size="sm" className="mt-4" onClick={() => handleOpenIntervention(waitingNode)} disabled={submitting || !taskId}>
                      立即处理该节点
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="panel-subtle p-4">
                <p className="text-sm text-slate-500">任务 ID</p>
                <p className="mt-2 truncate text-base font-semibold text-slate-100">
                  {status?.task_id ?? taskId ?? '--'}
                </p>
              </div>
              <div className="panel-subtle p-4">
                <p className="text-sm text-slate-500">当前阶段</p>
                <p className="mt-2 text-base font-semibold text-slate-100">{status?.current_stage ?? '--'}</p>
              </div>
              <div className="panel-subtle p-4">
                <p className="text-sm text-slate-500">可用动作</p>
                <p className="mt-2 text-base font-semibold text-slate-100">{status?.available_actions?.length ?? 0}</p>
              </div>
              <div className="panel-subtle p-4">
                <p className="text-sm text-slate-500">最新事件时间</p>
                <p className="mt-2 text-base font-semibold text-slate-100">{latestEvent ? formatTime(latestEvent.timestamp) : '--'}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <GitBranch size={16} className="text-[#63cab7]" />
                  <h3 className="text-xl font-semibold text-slate-100">流程时间线</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  以节点为单位查看任务当前走到哪里、下一步去哪里，以及哪里需要人工判断。
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="data-pill">已完成 {completedCount}</span>
                <span className="data-pill">待人工 {waitingCount}</span>
                <span className="data-pill">异常 {failedCount}</span>
              </div>
            </div>

            {!taskId ? (
              <div className="panel-subtle p-6 text-sm text-slate-500">
                暂未选中任务，无法展示流程时间线。请先从顶部任务下拉框中选择一个调研任务。
              </div>
            ) : workflowNodes.length > 0 ? (
              <div className="space-y-4">
                {workflowNodes.map((step, index) => {
                  const isCurrent = workflow?.current_node === step.node_id;
                  const isWaiting = step.node_id === workflow?.waiting_intervention_node_id;
                  const nextNode = nextNodeById.get(step.node_id);
                  const markerClass =
                    step.node_status === 'completed'
                      ? 'border-emerald-500/30 bg-emerald-500/14 text-emerald-300'
                      : isWaiting
                        ? 'border-amber-500/30 bg-amber-500/14 text-amber-300'
                        : isCurrent
                          ? 'border-sky-500/30 bg-sky-500/14 text-sky-300'
                          : 'border-white/10 bg-white/[0.05] text-slate-300';

                  return (
                    <div key={step.node_id} className="relative pl-12">
                      {index < workflowNodes.length - 1 ? (
                        <span className="absolute left-[19px] top-11 bottom-[-1rem] w-px bg-gradient-to-b from-[rgba(99,202,183,0.35)] via-white/10 to-transparent" />
                      ) : null}

                      <div className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border ${markerClass}`}>
                        {step.node_status === 'completed' ? (
                          <CheckCircle2 size={18} />
                        ) : isWaiting ? (
                          <AlertTriangle size={18} />
                        ) : isCurrent ? (
                          <PlayCircle size={18} />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>

                      <div
                        className={`max-h-[30rem] overflow-hidden rounded-[28px] border p-5 transition-all ${
                          isWaiting
                            ? 'border-amber-400/30 bg-amber-500/[0.08] shadow-[0_0_28px_rgba(245,158,11,0.08)]'
                            : isCurrent
                              ? 'border-sky-400/25 bg-sky-500/[0.06] shadow-[0_0_28px_rgba(56,189,248,0.08)]'
                              : 'border-white/10 bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex max-h-[calc(30rem-2.5rem)] flex-col gap-4 overflow-y-auto pr-1 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-lg font-semibold text-slate-100">{step.node_name}</p>
                              <StatusBadge status={step.node_status} />
                              {step.node_type ? <span className="data-pill">{nodeTypeText(step.node_type)}</span> : null}
                              {isCurrent ? <span className="data-pill">当前节点</span> : null}
                              {isWaiting ? <span className="data-pill">等待人工</span> : null}
                            </div>

                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
                              {step.summary ?? step.description ?? '该节点尚未返回更多说明。'}
                            </p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">时间信息</p>
                                <p className="mt-2 text-sm text-slate-300">开始：{formatTime(step.started_at)}</p>
                                <p className="mt-1 text-sm text-slate-300">结束：{formatTime(step.finished_at)}</p>
                                <p className="mt-1 text-sm text-slate-300">耗时：{formatDuration(step.duration_ms)}</p>
                              </div>

                              <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">流程连接</p>
                                <p className="mt-2 text-sm text-slate-300">节点 ID：{step.node_id}</p>
                                <p className="mt-1 text-sm text-slate-300">下一步：{nextNode?.node_name ?? '流程结束'}</p>
                                <p className="mt-1 text-sm text-slate-300">最后更新：{formatTime(step.updated_at)}</p>
                              </div>

                              <div className="rounded-2xl border border-white/8 bg-black/10 p-3 sm:col-span-2 xl:col-span-1">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">节点说明</p>
                                <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-300">
                                  {step.description ?? '该节点暂无额外的流程描述。'}
                                </p>
                              </div>
                            </div>

                            {step.metrics?.length ? (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {step.metrics.map((metric) => (
                                  <span key={`${step.node_id}-${metric.label}`} className="data-pill">
                                    {metric.label}：{metric.value}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          {step.can_intervene ? (
                            <div className="lg:ml-4 lg:w-[180px]">
                              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">人工介入</p>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                  {isWaiting ? '该节点已暂停，等待人工确认后继续。' : '该节点支持人工打开更多介入选项。'}
                                </p>
                                <Button
                                  size="sm"
                                  variant={isWaiting ? 'default' : 'secondary'}
                                  onClick={() => handleOpenIntervention(step)}
                                  className="mt-4 w-full"
                                >
                                  {isWaiting ? '立即处理' : '查看介入选项'}
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="panel-subtle p-5 text-sm text-slate-500">
                当前任务暂无流程节点数据，可能尚未启动分析或接口暂未返回工作流详情。
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant={waitingNode ? 'glow' : 'default'} className="space-y-5">
            <div className="flex items-center gap-2">
              {waitingNode ? <AlertTriangle size={16} className="text-amber-300" /> : <Sparkles size={16} className="text-[#63cab7]" />}
              <h3 className="text-xl font-semibold text-slate-100">当前判断</h3>
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                waitingNode
                  ? 'border-amber-500/25 bg-amber-500/[0.08]'
                  : 'border-[rgba(99,202,183,0.16)] bg-[rgba(99,202,183,0.06)]'
              }`}
            >
              <p className="text-sm font-semibold text-slate-100">
                {waitingNode ? '系统已在当前节点暂停' : '流程当前处于自动执行窗口'}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {waitingNode
                  ? interventionDetail?.reason ?? waitingNode.summary ?? waitingNode.description ?? '当前节点正在等待人工决策。'
                  : status?.hint ?? latestEvent?.message ?? '当前没有明显阻塞信号，可以继续观察后续节点。'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="panel-subtle p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">对象</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">
                  {status?.object_name ?? currentTask?.object_name ?? '--'}
                </p>
                <p className="mt-1 text-sm text-slate-400">{status?.object_type ?? currentTask?.object_type ?? '--'}</p>
              </div>
              <div className="panel-subtle p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">当前节点</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">
                  {status?.current_node_name ?? activeNode?.node_name ?? '--'}
                </p>
                <p className="mt-1 text-sm text-slate-400">{status?.current_stage ?? '--'}</p>
              </div>
            </div>

            {waitingNode ? (
              <Button size="sm" onClick={() => handleOpenIntervention(waitingNode)} disabled={submitting || !taskId}>
                进入人工处理
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={handleRefreshTaskData} disabled={submitting || !taskId}>
                <RefreshCcw size={14} />
                刷新最新状态
              </Button>
            )}
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">实时事件</h3>
            </div>

            {sortedEvents.length > 0 ? (
              <div className="space-y-4">
                {sortedEvents.map((event, index) => {
                  const meta = eventMeta(event.level);
                  const EventIcon = meta.icon;

                  return (
                    <div key={event.event_id ?? `${event.node_id}-${event.timestamp}`} className="relative pl-8">
                      {index < sortedEvents.length - 1 ? (
                        <span className="absolute left-[9px] top-6 bottom-[-1rem] w-px bg-gradient-to-b from-white/20 to-transparent" />
                      ) : null}
                      <div className={`absolute left-0 top-0 flex h-5 w-5 items-center justify-center rounded-full border ${meta.markerClass}`}>
                        <EventIcon size={12} />
                      </div>
                      <div className={`rounded-2xl border p-4 ${meta.panelClass}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-100">{event.title ?? event.node_name}</p>
                          <span className="data-pill">{meta.label}</span>
                          <StatusBadge status={event.node_status} />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {event.message ?? '该事件暂无附加说明。'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="data-pill">节点：{event.node_name}</span>
                          <span className="data-pill">时间：{formatTime(event.timestamp)}</span>
                        </div>
                        {Object.keys(event.metrics).length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(event.metrics).map(([key, value]) => (
                              <span key={`${event.event_id ?? event.timestamp}-${key}`} className="data-pill">
                                {key}：{value}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="panel-subtle p-4 text-sm text-slate-500">当前没有可展示的过程事件。</div>
            )}
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">事实与来源</h3>
            </div>

            {facts ? (
              <div className="space-y-4">
                <div className="panel-subtle p-4 text-sm text-slate-300">
                  <p><span className="text-slate-500">数据条目：</span>{facts.fact_count}</p>
                  <p><span className="text-slate-500">数据版本：</span>{facts.dataset_version}</p>
                  <p><span className="text-slate-500">关键实体：</span>{facts.top_entities.join('、') || '暂无'}</p>
                </div>

                {sortedSources.length > 0 ? (
                  <div className="space-y-3">
                    {sortedSources.map((source) => (
                      <div key={source.source_name} className="panel-subtle p-3">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                          <span>{source.source_name}</span>
                          <span className="font-medium text-slate-100">{source.count}</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/[0.06]">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#63cab7] to-sky-400"
                            style={{ width: `${Math.max(12, (source.count / maxSourceCount) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="panel-subtle p-4 text-sm text-slate-500">暂无来源分布数据。</div>
                )}
              </div>
            ) : (
              <div className="panel-subtle p-4 text-sm text-slate-500">暂无事实层数据。</div>
            )}
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">交叉验证</h3>
            </div>

            <div className="panel-subtle p-4 text-sm text-slate-300">
              <div className="flex flex-wrap items-center gap-2">
                <span className="data-pill">
                  状态：{crossValidationStatusText(crossValidationResult?.status ?? crossValidationTrigger?.status)}
                </span>
                {crossValidationResult?.updated_at ? (
                  <span className="data-pill">更新时间：{formatTime(crossValidationResult.updated_at)}</span>
                ) : null}
              </div>

              {loadingCrossValidationResult ? <p className="mt-3 text-slate-400">正在刷新交叉验证结果...</p> : null}

              {hasCrossValidationResult && crossValidationResult ? (
                <div className="mt-4 space-y-4">
                  {crossValidationResult.consensus_score !== null && crossValidationResult.consensus_score !== undefined ? (
                    <div className="rounded-2xl border border-[rgba(99,202,183,0.18)] bg-[rgba(99,202,183,0.06)] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Consensus score</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-100">{crossValidationResult.consensus_score}</p>
                    </div>
                  ) : null}

                  {crossValidationResult.used_models.length > 0 ? (
                    <div>
                      <p className="text-slate-500">参与模型</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {crossValidationResult.used_models.map((item) => (
                          <span key={item} className="data-pill">{item}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {crossValidationResult.consensus_summary ? (
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">结论摘要</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{crossValidationResult.consensus_summary}</p>
                    </div>
                  ) : null}

                  {crossValidationResult.consensus_points.length > 0 ? (
                    <div>
                      <p className="text-slate-500">共识观点</p>
                      <div className="mt-2 space-y-2">
                        {crossValidationResult.consensus_points.map((item) => (
                          <div key={item} className="panel-solid flex items-start gap-2 p-3 text-xs leading-6 text-slate-300">
                            <CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-300" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {crossValidationResult.difference_points.length > 0 ? (
                    <div>
                      <p className="text-slate-500">差异点</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {crossValidationResult.difference_points.map((item) => (
                          <span key={item} className="data-pill">{item}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {crossValidationResult.model_outputs.length > 0 ? (
                    <div className="space-y-2 border-t border-white/8 pt-3">
                      {crossValidationResult.model_outputs.map((item) => (
                        <div key={item.model_id} className="panel-solid p-3 text-xs leading-6 text-slate-300">
                          <p className="font-medium text-slate-100">{item.model_id}</p>
                          <p className="mt-1">{item.summary}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                !loadingCrossValidationResult && <p className="mt-3 text-slate-500">暂无交叉验证结果。</p>
              )}
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <ListChecks size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">流程操作</h3>
            </div>
            <p className="text-sm leading-6 text-slate-400">
              这些操作会改变当前任务执行状态，适合在判断流程卡住、需要重试或准备补充验证时使用。
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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
                {loadingCrossValidationResult ? '刷新中...' : '刷新验证结果'}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleCancelTask} disabled={submitting || !taskId}>
                取消任务
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate(`/report?task_id=${taskId}`)} disabled={!taskId}>
                查看报告
              </Button>
            </div>

            {analyzeResult || retryResult ? (
              <div className="panel-subtle p-4 text-sm text-slate-300">
                {analyzeResult ? <p>最近启动分析：{statusText(analyzeResult.status)}</p> : null}
                {retryResult ? <p className={analyzeResult ? 'mt-1' : ''}>最近重试结果：{statusText(retryResult.status)}</p> : null}
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      {interventionNode ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/60 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-8">
          <div className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center">
            <div className="glass-card flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:max-h-[calc(100vh-4rem)] sm:p-8">
              <div className="flex flex-col gap-4 border-b border-[rgba(99,202,183,0.1)] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Human review</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-100">
                    {interventionDetail?.node_name ?? interventionNode.node_name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    task_id：{taskId} · node_id：{interventionNode.node_id}
                  </p>
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
                    <div className="panel-subtle p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">节点类型</p>
                      <p className="mt-2 text-sm font-semibold text-slate-100">
                        {interventionDetail?.intervention_type ?? 'manual_review'}
                      </p>
                    </div>
                    <div className="panel-subtle p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">建议动作</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {interventionDetail?.suggested_action ?? '暂无建议。'}
                      </p>
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
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">当前判断</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {status?.waiting_intervention
                          ? '该节点已暂停，提交决策后流程会继续推进。'
                          : '该节点支持人工打开更多选项，但当前未阻塞整个流程。'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>当前规则参数</Label>
                      <div className="panel-solid mt-2 overflow-x-auto p-4">
                        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-300">
                          {JSON.stringify(interventionDetail?.current_params ?? {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <Label>影响预览</Label>
                      <div className="panel-solid mt-2 overflow-x-auto p-4">
                        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-300">
                          {JSON.stringify(interventionDetail?.preview_data ?? {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="intervention-action">处理动作</Label>
                      <Select
                        id="intervention-action"
                        value={interventionAction}
                        onChange={(event) => setInterventionAction(event.target.value as TaskInterventionAction)}
                      >
                        <option value="confirm_continue">{interventionActionText('confirm_continue')}</option>
                        <option value="update_rules">{interventionActionText('update_rules')}</option>
                        <option value="skip_intervention">{interventionActionText('skip_intervention')}</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="intervention-comment">处理备注</Label>
                      <Input
                        id="intervention-comment"
                        value={interventionComment}
                        onChange={(event) => setInterventionComment(event.target.value)}
                        placeholder="说明这次人工判断的依据"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="intervention-rule-changes">规则调整</Label>
                    <Textarea
                      id="intervention-rule-changes"
                      value={ruleChanges}
                      onChange={(event) => setRuleChanges(event.target.value)}
                      placeholder="当选择“调整规则并重试”时，可填写规则变更 JSON 或说明文本"
                      rows={5}
                      disabled={interventionAction !== 'update_rules'}
                      className="font-mono text-xs leading-6"
                    />
                    {interventionAction !== 'update_rules' ? (
                      <p className="mt-2 text-xs text-slate-500">当前动作不会写入规则调整内容。</p>
                    ) : null}
                  </div>

                  {interventionResult ? (
                    <div className="panel-subtle p-4 text-sm text-slate-300">
                      <p>处理结果：{interventionResult.result}</p>
                      <p className="mt-1">审计日志：{interventionResult.audit_log_id}</p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCloseIntervention}
                      disabled={submittingIntervention}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/report?task_id=${taskId}`)}
                      disabled={!taskId}
                    >
                      查看报告
                    </Button>
                    <Button size="sm" onClick={handleSubmitIntervention} disabled={submittingIntervention}>
                      {submittingIntervention ? '提交中...' : '提交人工介入'}
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
