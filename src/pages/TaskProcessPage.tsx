import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSearch,
  GitBranch,
  ListChecks,
  PlayCircle,
  Presentation,
  RefreshCcw,
  Shield,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  buildResearchTaskRealtimeUrl,
  cancelResearchTask,
  getCrossValidationResult,
  getResearchTaskStatus,
  getResearchTaskWorkflow,
  getResearchTasks,
  getTaskFacts,
  triggerCrossValidation,
} from '@/api/client';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import type {
  CrossValidationResultResponse,
  ResearchTaskListItem,
  ResearchTaskStatusResponse,
  SubAgentWorkflow,
  TaskFactsResponse,
  TaskRealtimeMessage,
  TaskWorkflowResponse,
  TriggerCrossValidationResponse,
  WorkflowNode,
  WorkflowNodeStatus,
  WorkflowToolCall,
} from '@/types';

const ACTIVE_TASK_STATUSES = new Set([
  'pending',
  'searching',
  'data_ready',
  'analyzing',
  'waiting_user',
]);

type RealtimeState = 'idle' | 'connecting' | 'connected' | 'polling';

function useStreamingText(text: string, active: boolean) {
  const [visibleText, setVisibleText] = useState(text);
  const previousTextRef = useRef('');

  useEffect(() => {
    const fullText = text.trim();
    if (!fullText) {
      previousTextRef.current = '';
      setVisibleText('');
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!active || prefersReducedMotion) {
      previousTextRef.current = fullText;
      setVisibleText(fullText);
      return;
    }

    const previousText = previousTextRef.current;
    const startIndex = fullText.startsWith(previousText) ? Math.min(previousText.length, fullText.length) : 0;
    previousTextRef.current = fullText;
    setVisibleText(fullText.slice(0, startIndex));

    let cursor = startIndex;
    const step = Math.max(1, Math.ceil(fullText.length / 72));
    const intervalId = window.setInterval(() => {
      cursor = Math.min(fullText.length, cursor + step);
      setVisibleText(fullText.slice(0, cursor));
      if (cursor >= fullText.length) {
        window.clearInterval(intervalId);
      }
    }, 24);

    return () => window.clearInterval(intervalId);
  }, [active, text]);

  return visibleText;
}

function formatPayloadPreview(value: unknown, maxLength = 180) {
  if (value === undefined || value === null || value === '') {
    return '暂无';
  }
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  const compact = text.replace(/\s+/g, ' ').trim();
  if (!compact) {
    return '暂无';
  }
  return compact.length > maxLength ? `${compact.slice(0, maxLength)}...` : compact;
}

function formatPayloadBlock(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return '暂无';
  }
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

function workflowNodeLiveText(node?: WorkflowNode | null) {
  if (!node) {
    return '';
  }
  const payloadText = typeof node.payload?.text === 'string' ? node.payload.text : '';
  const planningText = node.node_kind === 'agent_step' ? agentStepPlanning(node as VisibleWorkflowNode) : '';
  return String(payloadText || planningText || node.summary || node.description || node.node_name || '').trim();
}

function realtimeReasonText(reason?: string) {
  switch (reason) {
    case 'task_changed':
      return '任务状态已同步';
    case 'task_progress_changed':
      return '流程进度已同步';
    case 'step_log_created':
      return '新增过程消息';
    case 'step_log_updated':
      return '过程消息已更新';
    case 'references_changed':
      return '引用来源已更新';
    case 'cross_validation_progress_changed':
      return '交叉验证已同步';
    default:
      return reason || '';
  }
}

function LiveStreamPanel({
  title,
  text,
  meta,
  active,
  compact = false,
}: {
  title: string;
  text: string;
  meta?: string;
  active: boolean;
  compact?: boolean;
}) {
  const fallbackText = active ? '等待下一条过程消息...' : '暂无过程消息。';
  const visibleText = useStreamingText(text || fallbackText, active);

  return (
    <div
      className={`rounded-2xl border ${
        active ? 'border-sky-400/24 bg-sky-500/[0.06]' : 'border-white/10 bg-black/10'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
            active
              ? 'border-sky-400/30 bg-sky-500/12 text-sky-200'
              : 'border-white/10 bg-white/[0.05] text-slate-400'
          }`}
        >
          <Activity size={13} className={active ? 'animate-pulse' : ''} />
        </span>
        <p className="min-w-0 flex-1 text-xs uppercase tracking-[0.16em] text-slate-500">{title}</p>
        {active ? <span className="data-pill !px-2 !py-0.5 text-[10px] text-sky-200">接收中</span> : null}
      </div>
      <p
        className={`${compact ? 'mt-2 text-sm leading-6' : 'mt-3 text-sm leading-7'} text-slate-300`}
        aria-live="polite"
        aria-atomic="true"
      >
        {visibleText}
        {active ? <span aria-hidden="true" className="stream-caret" /> : null}
      </p>
      {meta ? <p className="mt-2 text-xs text-slate-500">{meta}</p> : null}
      {active ? (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <span className="stream-sweep" />
        </div>
      ) : null}
    </div>
  );
}

function toolPayloadFromNode(node: VisibleWorkflowNode) {
  if (node.node_kind !== 'tool_call') {
    return null;
  }
  if (node.payload?.hide_tool_payload || isReportToolName(node.node_name)) {
    return null;
  }

  const callNode = node.source_nodes.find((item) => item.node_kind === 'tool_call') ?? node;
  const returnNode = node.source_nodes.find((item) => item.node_kind === 'tool_return') ?? null;
  return {
    input: callNode.payload?.input,
    output: returnNode?.payload?.output,
  };
}

function ToolPayloadDisclosure({ label, value }: { label: string; value: unknown }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-black/15 px-3 py-2">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-xs text-slate-400 marker:hidden">
        <span className="shrink-0 font-medium text-slate-300">{label}</span>
        <span className="min-w-0 flex-1 truncate text-right text-slate-500 group-open:hidden">
          {formatPayloadPreview(value)}
        </span>
        <span className="shrink-0 text-slate-500">{'展开'}</span>
      </summary>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/8 bg-black/20 p-3 text-xs leading-5 text-slate-300">
        {formatPayloadBlock(value)}
      </pre>
    </details>
  );
}

function agentStepTools(node: VisibleWorkflowNode): WorkflowToolCall[] {
  if (node.node_kind !== 'agent_step') {
    return [];
  }
  return Array.isArray(node.payload?.tools) ? node.payload.tools : [];
}

function agentStepPlanning(node: VisibleWorkflowNode) {
  if (node.node_kind !== 'agent_step') {
    return '';
  }
  return String(node.payload?.planning || node.summary || node.description || '').trim();
}

function isReportToolName(toolName?: string) {
  const normalized = String(toolName ?? '').replace(/^调用工具:\s*|^工具返回:\s*/g, '').trim();
  return ['present_report', 'present_files', '生成调研报告', '展示调研报告'].includes(normalized);
}

function isReportNode(node: VisibleWorkflowNode) {
  if (node.node_kind === 'report_generation') {
    return true;
  }
  if (node.payload?.report_url || node.payload?.report_id) {
    return true;
  }
  const toolNames = node.payload?.report_tool_names ?? [];
  return toolNames.some((name) => isReportToolName(name));
}

function reportUrlFromPayload(taskId: string, payload?: { report_id?: string; report_url?: string }) {
  if (payload?.report_url) {
    return payload.report_url;
  }
  if (!taskId) {
    return '';
  }
  return payload?.report_id ? `/report?task_id=${taskId}&report_id=${payload.report_id}` : `/report?task_id=${taskId}`;
}

function SubAgentNodeCard({
  node,
  isLast,
}: {
  node: WorkflowNode;
  isLast: boolean;
}) {
  const isAgentStep = node.node_kind === 'agent_step';
  const planningText = isAgentStep
    ? String(node.payload?.planning || node.summary || node.description || '').trim()
    : '';
  const nodeTitle = isAgentStep
    ? (planningText || '子代理已执行一轮工具调用')
    : node.node_name;
  const bodyText = isAgentStep
    ? ''
    : node.summary ?? node.description ?? '';
  const tools = isAgentStep && Array.isArray(node.payload?.tools) ? node.payload.tools : [];
  const markerTone =
    node.node_status === 'completed'
      ? 'border-emerald-500/30 bg-emerald-500/14 text-emerald-300'
      : node.node_status === 'failed'
        ? 'border-rose-500/30 bg-rose-500/14 text-rose-300'
        : 'border-sky-500/30 bg-sky-500/14 text-sky-300';

  return (
    <div className="relative pl-8">
      {!isLast ? (
        <span className="absolute left-[13px] top-7 bottom-[-0.75rem] w-px bg-gradient-to-b from-[rgba(99,202,183,0.25)] via-white/5 to-transparent" />
      ) : null}
      <div className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border ${markerTone}`}>
        {node.node_status === 'completed' ? (
          <CheckCircle2 size={12} />
        ) : node.node_status === 'failed' ? (
          <AlertTriangle size={12} />
        ) : (
          <PlayCircle size={12} />
        )}
      </div>
      <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 text-xs font-medium text-slate-200">{nodeTitle}</p>
          <StatusBadge status={node.node_status} />
        </div>
        {bodyText ? (
          <p className="mt-1 text-[11px] leading-5 text-slate-400 line-clamp-2">{bodyText}</p>
        ) : null}
        {tools.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tools.map((t, ti) => (
              <span key={ti} className="rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400">
                {t.display_name || t.tool_name || `工具${ti + 1}`}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SubAgentTimeline({
  workflows,
}: {
  workflows: SubAgentWorkflow[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const current = workflows[activeIndex];
  if (!current) return null;

  const hasMultiple = workflows.length > 1;

  return (
    <div className="mt-2 rounded-xl border border-[rgba(99,202,183,0.12)] bg-black/20">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span className={`inline-flex transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight size={14} className="text-slate-400" />
        </span>
        <Bot size={14} className="shrink-0 text-[#63cab7]/70" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-300">
          {current.description || current.subagent_type || `子代理 ${activeIndex + 1}`}
        </span>
        {current.subagent_type ? (
          <span className="shrink-0 rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-500">
            {current.subagent_type}
          </span>
        ) : null}
        {hasMultiple ? (
          <span className="shrink-0 text-[10px] text-slate-500">{activeIndex + 1}/{workflows.length}</span>
        ) : null}
      </button>

      {expanded ? (
        <div className="border-t border-white/5 px-3 py-3">
          {hasMultiple ? (
            <div className="mb-3 flex items-center gap-2">
              <Button
                size="xs"
                variant="secondary"
                disabled={activeIndex === 0}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(activeIndex - 1); }}
                className="h-7 px-2 text-[11px]"
              >
                <ChevronLeft size={12} />
              </Button>
              <span className="min-w-0 flex-1 truncate text-center text-[10px] text-slate-500">
                {current.subagent_type || `子代理 ${activeIndex + 1}`}
              </span>
              <Button
                size="xs"
                variant="secondary"
                disabled={activeIndex === workflows.length - 1}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(activeIndex + 1); }}
                className="h-7 px-2 text-[11px]"
              >
                <ChevronRight size={12} />
              </Button>
            </div>
          ) : null}

          <div className="space-y-2.5">
            {current.nodes.map((node, nodeIndex) => (
              <SubAgentNodeCard
                key={node.node_id}
                node={node}
                isLast={nodeIndex === current.nodes.length - 1}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function isWorkflowToolRunning(tool: WorkflowToolCall) {
  const normalizedStatus = String(tool.status || '').toLowerCase();
  return normalizedStatus === 'running' || (!tool.finished_at && normalizedStatus !== 'completed' && normalizedStatus !== 'failed');
}

function ToolCallCard({
  tool,
  index,
  taskId,
  onOpenReport,
}: {
  tool: WorkflowToolCall;
  index: number;
  taskId: string;
  onOpenReport: (url: string) => void;
}) {
  const toolTitle = tool.display_name || tool.tool_name || `工具 ${index + 1}`;
  const statusLine = tool.status_text || (tool.finished_at ? '工具已完成' : '工具执行中');
  const hidePayload = Boolean(tool.hide_payload || isReportToolName(tool.tool_name));
  const reportUrl = reportUrlFromPayload(taskId, tool);
  const hasSubAgents = Boolean(tool.subagent_workflows && tool.subagent_workflows.length > 0);
  const toolRunning = isWorkflowToolRunning(tool);

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/12 p-3 transition-colors duration-200 hover:border-[rgba(99,202,183,0.28)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100">{toolTitle}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{statusLine}</p>
          {tool.tool_name && tool.tool_name !== toolTitle ? (
            <p className="mt-1 break-all text-[11px] leading-4 text-slate-600">{tool.tool_name}</p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">{tool.finished_at ? formatTime(tool.finished_at) : '执行中'}</p>
        </div>
        <StatusBadge status={(tool.status as WorkflowNodeStatus) || 'running'} />
      </div>

      {toolRunning ? (
        <div className="mt-3 rounded-xl border border-sky-400/16 bg-sky-500/[0.05] px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-sky-200">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.8)] animate-pulse" />
            <span>正在接收工具结果</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <span className="stream-sweep" />
          </div>
        </div>
      ) : null}

      {hasSubAgents ? (
        <SubAgentTimeline workflows={tool.subagent_workflows!} />
      ) : null}

      {hasSubAgents ? null : hidePayload ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="data-pill">报告内容已省略</span>
          {reportUrl ? (
            <Button size="xs" variant="secondary" onClick={() => onOpenReport(reportUrl)}>
              <FileSearch size={12} />
              查看报告
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <ToolPayloadDisclosure label="输入" value={tool.input} />
          <ToolPayloadDisclosure label="输出" value={tool.output} />
        </div>
      )}
    </div>
  );
}

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

function formatTime(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleString('zh-CN', { hour12: false });
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

function realtimeStateText(state: RealtimeState) {
  switch (state) {
    case 'connecting':
      return '连接中';
    case 'connected':
      return '实时同步';
    case 'polling':
      return '轮询同步';
    default:
      return '未连接';
  }
}

function realtimeStateTone(state: RealtimeState) {
  switch (state) {
    case 'connected':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100';
    case 'connecting':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-100';
    case 'polling':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
    default:
      return 'border-white/10 bg-white/[0.06] text-slate-300';
  }
}

function deriveWorkflowProgress(
  nodes: WorkflowNode[],
  taskStatus?: ResearchTaskStatusResponse['status']
) {
  if (nodes.length === 0) {
    return 0;
  }

  if (taskStatus === 'completed') {
    return 100;
  }

  const completedWeight = 1;
  const activeWeight = 0.82;
  const pendingWeight = 0;

  let weightedProgress = 0;

  for (const node of nodes) {
    switch (node.node_status) {
      case 'completed':
      case 'skipped':
        weightedProgress += completedWeight;
        break;
      case 'running':
      case 'waiting_user':
        weightedProgress += activeWeight;
        break;
      case 'failed':
        weightedProgress += activeWeight;
        break;
      case 'pending':
      default:
        weightedProgress += pendingWeight;
        break;
    }
  }

  return Math.max(0, Math.min(100, Math.round((weightedProgress / nodes.length) * 100)));
}

type VisibleWorkflowNode = WorkflowNode & {
  source_node_ids: string[];
  source_nodes: WorkflowNode[];
};

function mergeWorkflowNodes(nodes: WorkflowNode[]) {
  const visibleNodes: VisibleWorkflowNode[] = [];
  const hiddenNodeIds = new Set<string>();

  for (const node of nodes) {
    if (hiddenNodeIds.has(node.node_id)) {
      continue;
    }

    const isToolCall = node.node_kind === "tool_call";
    const pairId = node.paired_node_id ?? null;
    const pairNode = pairId ? nodes.find((candidate) => candidate.node_id === pairId) ?? null : null;
    const canMergePair =
      isToolCall &&
      pairNode &&
      pairNode.node_kind === "tool_return" &&
      pairNode.execution_id &&
      pairNode.execution_id === node.execution_id;

    if (canMergePair && pairNode) {
      hiddenNodeIds.add(pairNode.node_id);

      const mergedStatus: WorkflowNodeStatus =
        pairNode.node_status === "failed"
          ? "failed"
          : pairNode.node_status === "completed"
            ? "completed"
            : node.node_status;
      const toolName =
        node.node_name.replace(/^调用工具:\s*/, "").trim() ||
        pairNode.node_name.replace(/^工具返回:\s*/, "").trim() ||
        "未知工具";
      const mergedSummary =
        pairNode.summary ||
        `工具 ${toolName} 已返回结果。`;
      const mergedDescription =
        pairNode.description || node.description;
      const mergedMetrics = [...(node.metrics ?? []), ...(pairNode.metrics ?? [])];

      visibleNodes.push({
        ...node,
        node_name: `工具执行: ${toolName}`,
        node_status: mergedStatus,
        summary: mergedSummary,
        description: mergedDescription,
        finished_at: pairNode.finished_at ?? pairNode.updated_at ?? node.finished_at,
        updated_at: pairNode.updated_at ?? node.updated_at,
        metrics: mergedMetrics,
        source_node_ids: [node.node_id, pairNode.node_id],
        source_nodes: [node, pairNode],
      });
      continue;
    }

    visibleNodes.push({
      ...node,
      source_node_ids: node.payload?.source_node_ids?.length ? node.payload.source_node_ids : [node.node_id],
      source_nodes: [node],
    });
  }

  return visibleNodes;
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
  const [crossValidationTrigger, setCrossValidationTrigger] =
    useState<TriggerCrossValidationResponse | null>(null);
  const [crossValidationResult, setCrossValidationResult] =
    useState<CrossValidationResultResponse | null>(null);
  const [loadingCrossValidationResult, setLoadingCrossValidationResult] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [realtimeState, setRealtimeState] = useState<RealtimeState>('idle');
  const [lastRealtimeMessage, setLastRealtimeMessage] = useState<TaskRealtimeMessage | null>(null);
  const realtimeRefreshTimerRef = useRef<number | null>(null);
  const realtimeRefreshInFlightRef = useRef(false);
  const realtimeRefreshQueuedRef = useRef(false);

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

  const loadTaskCandidates = useCallback(async () => {
    const response = await getResearchTasks({ page: 1, page_size: 20 });
    setTasks(response.list);
    return response.list;
  }, []);

  const loadTaskData = useCallback(async (targetTaskId: string) => {
    const [statusResult, workflowResult, factsResult] = await Promise.all([
      getResearchTaskStatus(targetTaskId),
      getResearchTaskWorkflow(targetTaskId),
      getTaskFacts(targetTaskId),
    ]);

    setStatus(statusResult);
    setWorkflow(workflowResult);
    setFacts(factsResult);

    try {
      setLoadingCrossValidationResult(true);
      const cvResult = await getCrossValidationResult(targetTaskId);
      setCrossValidationResult(cvResult);
    } catch {
      setCrossValidationResult(null);
    } finally {
      setLoadingCrossValidationResult(false);
    }
  }, []);

  const refreshTaskSnapshot = useCallback(async (targetTaskId: string, includeCandidates = false) => {
    if (!targetTaskId) {
      return;
    }
    if (realtimeRefreshInFlightRef.current) {
      realtimeRefreshQueuedRef.current = true;
      return;
    }

    realtimeRefreshInFlightRef.current = true;
    try {
      if (includeCandidates) {
        await Promise.all([loadTaskCandidates(), loadTaskData(targetTaskId)]);
      } else {
        await loadTaskData(targetTaskId);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '同步任务进展失败');
    } finally {
      realtimeRefreshInFlightRef.current = false;
      if (realtimeRefreshQueuedRef.current) {
        realtimeRefreshQueuedRef.current = false;
        void refreshTaskSnapshot(targetTaskId, includeCandidates);
      }
    }
  }, [loadTaskCandidates, loadTaskData]);

  const scheduleRealtimeRefresh = useCallback((targetTaskId: string, includeCandidates = false) => {
    if (realtimeRefreshTimerRef.current !== null) {
      window.clearTimeout(realtimeRefreshTimerRef.current);
    }

    realtimeRefreshTimerRef.current = window.setTimeout(() => {
      realtimeRefreshTimerRef.current = null;
      void refreshTaskSnapshot(targetTaskId, includeCandidates);
    }, 350);
  }, [refreshTaskSnapshot]);

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
      setCrossValidationTrigger(null);
      setCrossValidationResult(null);
      setLastRealtimeMessage(null);
      return;
    }

    const loadData = async () => {
      try {
        setLastRealtimeMessage(null);
        await loadTaskData(taskId);
        setMessage('');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '加载任务执行态失败');
      }
    };

    void loadData();
  }, [loadTaskData, taskId]);

  useEffect(() => () => {
    if (realtimeRefreshTimerRef.current !== null) {
      window.clearTimeout(realtimeRefreshTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!taskId) {
      setRealtimeState('idle');
      return;
    }

    const realtimeUrl = buildResearchTaskRealtimeUrl(taskId);
    if (!realtimeUrl) {
      setRealtimeState('polling');
      return;
    }

    let closedByEffect = false;
    const socket = new WebSocket(realtimeUrl);
    setRealtimeState('connecting');

    socket.onopen = () => {
      if (!closedByEffect) {
        setRealtimeState('connected');
      }
    };

    socket.onmessage = (event) => {
      let payload: TaskRealtimeMessage | null = null;
      try {
        payload = JSON.parse(String(event.data)) as TaskRealtimeMessage;
      } catch {
        payload = null;
      }
      if (payload?.task_id && payload.task_id !== taskId) {
        return;
      }
      if (payload?.type === 'connection_ack' || payload?.type === 'pong') {
        return;
      }
      setLastRealtimeMessage(payload);
      scheduleRealtimeRefresh(taskId, payload?.reason !== 'references_changed');
    };

    socket.onerror = () => {
      if (!closedByEffect) {
        setRealtimeState('polling');
      }
    };

    socket.onclose = () => {
      if (!closedByEffect) {
        setRealtimeState('polling');
      }
    };

    return () => {
      closedByEffect = true;
      socket.close();
    };
  }, [scheduleRealtimeRefresh, taskId]);

  useEffect(() => {
    if (!taskId || realtimeState === 'connected') {
      return;
    }
    if (status && !ACTIVE_TASK_STATUSES.has(status.status)) {
      return;
    }

    const intervalId = window.setInterval(() => {
      scheduleRealtimeRefresh(taskId, true);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [realtimeState, scheduleRealtimeRefresh, status, taskId]);

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

  const currentTask = useMemo(() => tasks.find((item) => item.task_id === taskId) ?? null, [tasks, taskId]);
  const workflowNodes = workflow?.nodes ?? [];
  const timelineNodes = useMemo(
    () => mergeWorkflowNodes(workflowNodes),
    [workflowNodes]
  );
  const latestWorkflowNode = timelineNodes.length > 0 ? timelineNodes[timelineNodes.length - 1] : null;
  const latestWorkflowTime = latestWorkflowNode?.updated_at;
  const isTaskActive = Boolean(status && ACTIVE_TASK_STATUSES.has(status.status));
  const liveSourceNode = waitingNode ?? activeNode ?? latestWorkflowNode;
  const liveText = workflowNodeLiveText(liveSourceNode) || status?.hint || '';
  const isLiveStreaming = Boolean(isTaskActive && !waitingNode && liveSourceNode && realtimeState !== 'idle');
  const lastRealtimePayload = lastRealtimeMessage?.payload ?? {};
  const lastRealtimeStepName = typeof lastRealtimePayload.step_name === 'string' ? lastRealtimePayload.step_name : '';
  const liveMeta = [
    realtimeReasonText(lastRealtimeMessage?.reason),
    lastRealtimeStepName,
    lastRealtimeMessage?.timestamp ? formatTime(lastRealtimeMessage.timestamp) : latestWorkflowTime ? formatTime(latestWorkflowTime) : '',
  ].filter(Boolean).join(' · ');
  const stageItems = status?.progress_model?.stages ?? [];
  const completedCount = stageItems.length > 0
    ? stageItems.filter((stage) => stage.status === 'completed' || stage.status === 'skipped').length
    : timelineNodes.filter((node) => node.node_status === 'completed').length;
  const waitingCount = stageItems.length > 0
    ? stageItems.filter((stage) => stage.status === 'waiting_user').length
    : timelineNodes.filter((node) => node.node_status === 'waiting_user').length;
  const failedCount = stageItems.length > 0
    ? stageItems.filter((stage) => stage.status === 'failed').length
    : timelineNodes.filter((node) => node.node_status === 'failed').length;
  const workflowDerivedProgress = useMemo(
    () => deriveWorkflowProgress(timelineNodes, status?.status),
    [timelineNodes, status?.status]
  );
  const progress = typeof status?.progress_model?.percent === 'number'
    ? Math.max(0, Math.min(100, status.progress_model.percent))
    : timelineNodes.length > 0
      ? workflowDerivedProgress
      : Math.max(0, Math.min(100, status?.progress ?? 0));
  const sortedSources = useMemo(
    () => [...(facts?.sources ?? [])].sort((left, right) => right.count - left.count),
    [facts]
  );
  const sortedReferences = useMemo(
    () => [...(facts?.references ?? [])].sort((left, right) => (left.index_number ?? 0) - (right.index_number ?? 0)),
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
  return (
    <PageShell
      title="调研流程"
      subtitle="查看当前任务状态、流程节点、参考信息和可执行操作。"
      action={
        <div className="flex flex-wrap gap-2">
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

      <div className="space-y-6">
        <Card variant="glow" className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Workflow size={16} className="text-[#63cab7]" />
                <p className="page-kicker">任务状态</p>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
                    {currentTask?.object_name ?? status?.object_name ?? '请选择一个调研任务'}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                    {!taskId
                      ? '先选择一个任务，界面会自动加载当前节点、过程事件与介入入口。'
                      : status?.hint ?? '系统正在持续同步流程状态。'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-sm font-medium ${statusTone(status?.status)}`}>
                    {taskId ? statusText(status?.status) : '未选择任务'}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-sm font-medium ${realtimeStateTone(realtimeState)}`}>
                    {realtimeStateText(realtimeState)}
                  </span>
                  {status?.waiting_intervention ? <span className="data-pill">等待人工决策</span> : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="panel-subtle p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">当前任务</p>
                  <div className="mt-3">
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
                          {task.object_name} / {statusText(task.status)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="panel-subtle p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">当前阶段</p>
                  <p className="mt-3 text-lg font-semibold text-slate-100">{status?.current_stage ?? '--'}</p>
                  <p className="mt-1 text-sm text-slate-400">{status?.current_node_name ?? activeNode?.node_name ?? '--'}</p>
                </div>
                <div className="panel-subtle p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">流程进度</p>
                  <p className="mt-3 text-lg font-semibold text-slate-100">{progress}%</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {completedCount}/{stageItems.length || timelineNodes.length || 0} 阶段完成
                  </p>
                </div>
                <div className="panel-subtle p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">过程信号</p>
                  <p className="mt-3 text-lg font-semibold text-slate-100">{timelineNodes.length}</p>
                  <p className="mt-1 text-sm text-slate-400">待人工 {waitingCount} · 异常 {failedCount}</p>
                  <p className="mt-1 text-sm text-slate-500">同步：{realtimeStateText(realtimeState)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-300">任务推进程度</p>
                  <p className="text-sm text-slate-400">{formatTime(latestWorkflowTime)}</p>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/[0.06]">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#63cab7] via-[#7dd8c9] to-sky-400 shadow-[0_0_24px_rgba(99,202,183,0.26)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="data-pill">对象：{status?.object_type ?? currentTask?.object_type ?? '--'}</span>
                  {facts ? <span className="data-pill">事实：{facts.fact_count}</span> : null}
                </div>
                {stageItems.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {stageItems.map((stage) => (
                      <span key={stage.key} className="data-pill">
                        {stage.label}：{statusText(stage.status)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex max-h-[26rem] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {waitingNode ? '当前阻塞点' : '当前关注点'}
                </p>
                <p className="mt-3 text-xl font-semibold text-slate-100">
                  {waitingNode
                    ? waitingNode.node_name
                    : status?.current_node_name ?? activeNode?.node_name ?? '等待任务加载'}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {waitingNode
                    ? waitingNode.summary ?? waitingNode.description ?? '该节点正在等待人工决策。'
                    : activeNode?.summary ?? activeNode?.description ?? latestWorkflowNode?.summary ?? latestWorkflowNode?.description ?? '当前没有新的阻塞信号。'}
                </p>

                <div className="mt-5 grid gap-3">
                  <div className="panel-subtle p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">当前判断</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {waitingNode
                        ? '该节点正在等待人工处理。请刷新流程，或联系管理员确认。'
                        : '流程仍可自动推进，建议结合事件流判断是否需要介入。'}
                    </p>
                  </div>
                  <LiveStreamPanel
                    title="实时输出"
                    text={liveText}
                    meta={liveMeta || (latestWorkflowTime ? formatTime(latestWorkflowTime) : undefined)}
                    active={isLiveStreaming}
                  />
                </div>
              </div>

            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_340px]">
          <div className="space-y-6">
            <Card className="flex max-h-[96rem] flex-col space-y-5 overflow-hidden">
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <GitBranch size={16} className="text-[#63cab7]" />
                    <h3 className="text-xl font-semibold text-slate-100">流程时间线</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    以节点为单位查看任务当前走到哪里，以及哪里需要人工判断。
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
              ) : timelineNodes.length > 0 ? (
                <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                  <div className="space-y-4">
                    {timelineNodes.map((step, index) => {
                      const isCurrent = isTaskActive && step.source_node_ids.includes(workflow?.current_node ?? "");
                      const isWaiting = step.source_node_ids.includes(workflow?.waiting_intervention_node_id ?? "");
                      const toolPayload = toolPayloadFromNode(step);
                      const stepTools = agentStepTools(step);
                      const planningText = agentStepPlanning(step);
                      const isAgentStep = step.node_kind === 'agent_step';
                      const reportNode = isReportNode(step);
                      const stepReportUrl = reportUrlFromPayload(taskId, step.payload);
                      const stepTitle = isAgentStep
                        ? (planningText || step.summary || 'Agent 已执行一轮工具调用')
                        : step.node_name;
                      const bodyText = isAgentStep
                        ? ''
                        : step.summary ?? step.description ?? '该节点尚未返回更多说明。';
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
                          {index < timelineNodes.length - 1 && (
                            <span className="absolute left-[19px] top-11 bottom-[-1rem] w-px bg-gradient-to-b from-[rgba(99,202,183,0.35)] via-white/10 to-transparent" />
                          )}
                          <div className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border ${markerClass}`}>
                            {step.node_status === 'completed' ? (
                              reportNode ? <Presentation size={18} /> : <CheckCircle2 size={18} />
                            ) : isWaiting ? (
                              <AlertTriangle size={18} />
                            ) : isCurrent ? (
                              <PlayCircle size={18} />
                            ) : (
                              <span className="text-sm font-semibold">{index + 1}</span>
                            )}
                          </div>

                          <div
                            className={`rounded-[24px] border p-4 transition-all ${
                              isWaiting
                                ? 'border-amber-400/30 bg-amber-500/[0.08] shadow-[0_0_28px_rgba(245,158,11,0.08)]'
                                : isCurrent
                                  ? 'border-sky-400/25 bg-sky-500/[0.06] shadow-[0_0_28px_rgba(56,189,248,0.08)]'
                                  : 'border-white/10 bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <p className="min-w-0 text-base font-semibold leading-6 text-slate-100">{stepTitle}</p>
                                    <StatusBadge status={step.node_status} />
                                    {step.node_type ? <span className="data-pill">{nodeTypeText(step.node_type)}</span> : null}
                                    {isAgentStep ? <span className="data-pill">工具 {stepTools.length}</span> : null}
                                    {reportNode ? <span className="data-pill">报告</span> : null}
                                    {step.node_kind === "tool_call" ? <span className="data-pill">工具执行</span> : null}
                                    {isCurrent ? <span className="data-pill">当前节点</span> : null}
                                    {isWaiting ? <span className="data-pill">等待人工</span> : null}
                                  </div>
                                  <span className="shrink-0 text-xs text-slate-500">{formatTime(step.updated_at)}</span>
                                </div>

                                {bodyText ? (
                                  isCurrent && isTaskActive && !isWaiting ? (
                                    <div className="mt-3">
                                      <LiveStreamPanel
                                        title="节点输出"
                                        text={bodyText}
                                        meta={step.updated_at ? formatTime(step.updated_at) : undefined}
                                        active
                                        compact
                                      />
                                    </div>
                                  ) : (
                                    <p className="mt-3 text-sm leading-6 text-slate-300">
                                      {bodyText}
                                    </p>
                                  )
                                ) : null}

                                {stepTools.length > 0 ? (
                                  <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                                    {stepTools.map((tool, toolIndex) => (
                                      <ToolCallCard
                                        key={`${step.node_id}-${tool.execution_id ?? toolIndex}`}
                                        tool={tool}
                                        index={toolIndex}
                                        taskId={taskId}
                                        onOpenReport={(url) => navigate(url)}
                                      />
                                    ))}
                                  </div>
                                ) : null}

                                {reportNode && stepReportUrl ? (
                                  <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => navigate(stepReportUrl)}>
                                      <FileSearch size={14} />
                                      查看报告
                                    </Button>
                                    {step.payload?.report_title ? (
                                      <span className="text-xs text-slate-500">{step.payload.report_title}</span>
                                    ) : null}
                                  </div>
                                ) : null}

                                {toolPayload ? (
                                  <div className="mt-4 space-y-2">
                                    <ToolPayloadDisclosure label="输入" value={toolPayload.input} />
                                    <ToolPayloadDisclosure label="输出" value={toolPayload.output} />
                                  </div>
                                ) : null}

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
                                <div className="lg:ml-4 lg:w-[152px]">
                                  <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">人工介入</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                      当前只能查看节点状态，暂时不能在这里处理。
                                    </p>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="panel-subtle p-5 text-sm text-slate-500">
                  当前任务暂无流程节点数据，可能尚未启动分析或流程详情暂未更新。
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
            <Card className="space-y-5">
              <div className="flex items-center gap-2">
                <ListChecks size={16} className="text-[#63cab7]" />
                <h3 className="text-xl font-semibold text-slate-100">流程操作</h3>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                这些操作会影响当前任务，请确认后再执行。
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleTriggerCrossValidation}
                  disabled={submitting || !taskId || status?.status !== 'completed'}
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
              {status?.status !== 'completed' ? (
                <div className="panel-subtle p-4 text-xs leading-5 text-slate-500">
                  多模型交叉验证需要主任务完成后才能启动。
                </div>
              ) : null}
            </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-[#63cab7]" />
              <h3 className="text-xl font-semibold text-slate-100">参考信息</h3>
            </div>

            {facts ? (
              <div className="space-y-4">
                <div className="panel-subtle p-4 text-sm text-slate-300">
                  <p><span className="text-slate-500">参考条目：</span>{sortedReferences.length || facts.fact_count}</p>
                  <p><span className="text-slate-500">数据版本：</span>{facts.dataset_version}</p>
                  <p><span className="text-slate-500">关键实体：</span>{facts.top_entities.join('、') || '暂无'}</p>
                </div>

                {sortedReferences.length > 0 ? (
                  <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                    {sortedReferences.map((reference, index) => {
                      const number = reference.index_number && reference.index_number > 0 ? reference.index_number : index + 1;
                      return (
                        <div key={reference.reference_id || `${reference.url}-${index}`} className="panel-subtle p-3">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[rgba(99,202,183,0.25)] bg-[rgba(99,202,183,0.09)] px-2 text-xs font-semibold text-[#8ce5d6]">
                              {number}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-6 text-slate-100">{reference.title}</p>
                              {reference.cite_key ? <p className="mt-1 break-all text-xs text-slate-500">@{reference.cite_key}</p> : null}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {reference.source_platform ? <span className="data-pill">{reference.source_platform}</span> : null}
                            {reference.source_type ? <span className="data-pill">{reference.source_type}</span> : null}
                            {reference.authority_score !== undefined && reference.authority_score !== null ? (
                              <span className="data-pill">权威度 {reference.authority_score}</span>
                            ) : null}
                          </div>
                          {reference.url ? (
                            <a className="mt-3 block break-all text-xs leading-5 text-[#63cab7]/80 hover:text-[#63cab7]" href={reference.url} target="_blank" rel="noopener noreferrer">
                              {reference.url}
                            </a>
                          ) : null}
                          {reference.evidence_path ? (
                            <p className="mt-2 break-all text-xs leading-5 text-slate-500">
                              Evidence：{reference.evidence_path}
                            </p>
                          ) : null}
                          {reference.summary ? (
                            <details className="mt-3 rounded-xl border border-white/8 bg-black/10 px-3 py-2">
                              <summary className="cursor-pointer text-xs text-slate-400">查看摘要</summary>
                              <p className="mt-2 text-xs leading-5 text-slate-300">{reference.summary}</p>
                            </details>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  sortedSources.length > 0 ? (
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
                    <div className="panel-subtle p-4 text-sm text-slate-500">暂无参考信息。</div>
                  )
                )}
              </div>
            ) : (
              <div className="panel-subtle p-4 text-sm text-slate-500">暂无参考信息。</div>
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
          </div>
        </div>
      </div>

    </PageShell>
  );
}
