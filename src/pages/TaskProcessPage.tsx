import { useEffect, useState } from 'react';
import {
  analyzeTask,
  cancelResearchTask,
  getCrossValidationResult,
  getResearchTasks,
  getResearchTaskStatus,
  getResearchTaskWorkflow,
  getTaskIntervention,
  getTaskEvents,
  getTaskFacts,
  retryAnalysis,
  submitTaskIntervention,
  triggerCrossValidation,
} from '../api/client';
import { Button } from '../components/ui/button';
import { PageShell } from '../components/common/PageShell';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { StatusBadge } from '../components/ui/status-badge';
import type {
  AnalyzeTaskResponse,
  CrossValidationResultResponse,
  ResearchTaskListItem,
  RetryAnalysisResponse,
  ResearchTaskStatusResponse,
  SubmitTaskInterventionResponse,
  TaskEvent,
  TaskFactsResponse,
  TaskInterventionAction,
  TaskInterventionDetailResponse,
  TriggerCrossValidationResponse,
  TaskWorkflowResponse,
  WorkflowNode,
} from '../types';

function nodeStatusLabel(status: WorkflowNode['node_status']) {
  if (status === 'completed') return '已完成';
  if (status === 'running') return '进行中';
  if (status === 'failed') return '失败';
  return '待处理';
}

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
        const runningTask = response.list.find((item) =>
          ['pending', 'searching', 'data_ready', 'analyzing'].includes(item.status)
        );
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
      const reason = error instanceof Error ? error.message : '查询多模型交叉验证结果失败';
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

  return (
    <PageShell title="调研流程" subtitle="实时监控分析进度，查看工作流节点状态，支持人工介入与交叉验证。">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-7">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-100">当前任务进度</h2>
            <p className="text-sm leading-7 text-slate-400">选择任务后自动加载分析流程各节点的实时状态。</p>
            <div className="max-w-sm">
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

          <div className="space-y-5">
            {workflow?.nodes.map((step, index) => (
              <div key={step.node_id} className="flex items-center gap-5 rounded-[28px] border border-white/8 bg-white/4 px-5 py-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(99,202,183,0.25)] bg-[rgba(99,202,183,0.07)] text-sm font-semibold text-[#63cab7]">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">{step.node_name}</p>
                  <div className="mt-1">
                    <StatusBadge status={step.node_status} />
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleOpenIntervention(step)}>
                  人工介入
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={handleCancelTask} disabled={submitting}>
              取消任务
            </Button>
            <Button size="sm" variant="secondary" onClick={handleAnalyzeTask} disabled={submitting}>
              启动分析
            </Button>
            <Button size="sm" variant="secondary" onClick={handleRetryAnalysis} disabled={submitting}>
              重试分析
            </Button>
            <Button size="sm" variant="secondary" onClick={handleTriggerCrossValidation} disabled={submitting}>
              启动交叉验证
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRefreshCrossValidationResult}
              disabled={loadingCrossValidationResult}
            >
              查询交叉验证结果
            </Button>
          </div>
        </Card>

        <Card className="space-y-5 border-[rgba(99,202,183,0.25)]">
          <h3 className="text-xl font-semibold text-slate-100">任务摘要</h3>
          {status ? (
            <div className="space-y-2 text-sm leading-7 text-slate-300">
              <p><span className="text-slate-500">任务 ID：</span>{status.task_id}</p>
              <p><span className="text-slate-500">状态：</span>{status.status}</p>
              <p><span className="text-slate-500">当前阶段：</span>{status.current_stage}</p>
              <p><span className="text-slate-500">分析进度：</span>{status.progress}%</p>
              {status.hint ? <p><span className="text-slate-500">进度提示：</span>{status.hint}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-slate-400">{message || '暂无任务状态数据'}</p>
          )}
          {facts ? (
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
              <p><span className="text-slate-500">数据条目：</span>{facts.fact_count}</p>
              <p><span className="text-slate-500">数据版本：</span>{facts.dataset_version}</p>
              <p><span className="text-slate-500">关键实体：</span>{facts.top_entities.join('、')}</p>
            </div>
          ) : null}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
            <p className="font-semibold text-[#63cab7]">实时事件流</p>
            <div className="mt-2 space-y-1">
              {events.map((event) => (
                <p key={`${event.node_id}-${event.timestamp}`}>
                  {event.timestamp} / {event.node_name} / {event.node_status}
                </p>
              ))}
            </div>
          </div>
          {analyzeResult ? (
            <p className="text-sm text-slate-300">
              <span className="text-slate-500">分析已启动：</span>{analyzeResult.status}{analyzeResult.report_id ? ` · 报告 ${analyzeResult.report_id}` : ''}
            </p>
          ) : null}
          {retryResult ? (
            <p className="text-sm text-slate-300">
              <span className="text-slate-500">重试分析：</span>{retryResult.status}
            </p>
          ) : null}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-slate-300">
            <p className="font-semibold text-[#63cab7]">多模型交叉验证</p>
            {crossValidationTrigger ? (
              <p className="mt-2 text-slate-400">
                已触发 · {crossValidationTrigger.status}
              </p>
            ) : null}
            {loadingCrossValidationResult ? <p className="mt-2 text-slate-400">加载中...</p> : null}
            {crossValidationResult ? (
              <div className="mt-2 space-y-1.5">
                <p><span className="text-slate-500">验证状态：</span>{crossValidationResult.status}</p>
                {crossValidationResult.consensus_score != null && (
                  <p><span className="text-slate-500">共识评分：</span>{crossValidationResult.consensus_score}</p>
                )}
                {crossValidationResult.consensus_summary && (
                  <p><span className="text-slate-500">结论摘要：</span>{crossValidationResult.consensus_summary}</p>
                )}
                <div className="mt-2 space-y-1 border-t border-white/8 pt-2">
                  {crossValidationResult.results.map((item) => (
                    <p key={item.model_id} className="text-xs">
                      <span className="text-slate-400">{item.model_id}：</span>{item.conclusion}
                      {item.confidence != null ? `（置信度 ${item.confidence}）` : ''}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-slate-500">暂无交叉验证结果</p>
            )}
          </div>
          {message ? <p className="text-sm text-slate-400">{message}</p> : null}
        </Card>
      </div>
      {interventionNode ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-[rgba(99,202,183,0.25)] bg-[#0f1f35] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-100">人工介入</h3>
                <p className="mt-1 text-sm text-slate-500">
                  任务 {taskId} · 节点 {interventionNode.node_id}
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={handleCloseIntervention}>
                关闭
              </Button>
            </div>

            {loadingIntervention ? (
              <p className="mt-6 text-sm text-slate-400">加载人工介入详情中...</p>
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
                  <Textarea value={JSON.stringify(interventionDetail?.current_params ?? {}, null, 2)} readOnly rows={4} />
                </div>
                <div>
                  <Label>preview_data</Label>
                  <Textarea value={JSON.stringify(interventionDetail?.preview_data ?? {}, null, 2)} readOnly rows={4} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="intervention-action">action</Label>
                    <Select
                      id="intervention-action"
                      value={interventionAction}
                      onChange={(event) => setInterventionAction(event.target.value as TaskInterventionAction)}
                    >
                      <option value="confirm">confirm</option>
                      <option value="update_rule">update_rule</option>
                      <option value="skip">skip</option>
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
                    placeholder="可填写规则调整 JSON 或文本说明"
                    rows={4}
                    disabled={interventionAction !== 'update_rule'}
                  />
                </div>

                {interventionResult ? (
                  <div className="rounded-2xl border border-[rgba(99,202,183,0.2)] bg-white/4 p-4 text-sm text-slate-300">
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
