# Workflow 节点配对接口建议

## 背景

当前前端展示“调研流程”时，已经可以消费 `/research/tasks/{taskId}/workflow` 返回的工作流节点和边。

现有结构足以表达：

- 节点本身是谁
- 节点当前状态
- 节点之间的流程先后顺序

但现有结构**不足以表达并发技术节点之间的一一对应关系**，尤其是：

- 多个并发 `tool_call`
- 多个并发 `tool_return`
- 多个并发 `llm_call`
- 多个并发 `llm_return`

在这种情况下，前端不能只依靠 `edges.from -> edges.to` 或节点顺序，可靠判断“哪个返回对应哪个调用”。

## 当前接口结构

前端当前消费的核心结构如下：

```ts
interface WorkflowNode {
  node_id: string;
  node_name: string;
  node_type?: string;
  node_status: 'pending' | 'running' | 'waiting_user' | 'completed' | 'failed' | 'skipped';
  description?: string;
  summary?: string;
  started_at?: string;
  finished_at?: string;
  updated_at?: string;
  duration_ms?: number;
  can_intervene?: boolean;
  intervention_id?: string;
  metrics?: Array<{ label: string; value: string | number }>;
}

interface WorkflowEdge {
  from: string;
  to: string;
}

interface TaskWorkflowResponse {
  task_id: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  current_node: string;
  waiting_intervention_node_id?: string;
}
```

这个结构里没有以下任一能力：

- 标识“同一次工具执行”的稳定 ID
- 标识“这个返回属于哪个调用”
- 标识“这一批节点属于同一组并发”
- 标识“这是业务阶段节点还是技术调用节点”

## 问题定义

如果后端返回类似下面的节点序列：

```text
tool_call_A
tool_call_B
tool_return_A
tool_return_B
```

前端无法可靠判断：

- `tool_return_A` 是否对应 `tool_call_A`
- `tool_return_B` 是否对应 `tool_call_B`
- A/B 是否属于同一批并发 fanout
- 它们是否都属于某一个上层业务阶段节点

只靠时间顺序或节点名称猜测，风险很高，尤其在真实场景中存在：

- 工具执行耗时不同
- 返回乱序
- 中途失败或重试
- 并发数大于 2

## 最低可行接口建议

如果后端只接受最小变更，建议至少给 `WorkflowNode` 增加下面 4 个字段：

```ts
interface WorkflowNode {
  execution_id?: string;
  node_kind?: 'business' | 'tool_call' | 'tool_return' | 'llm_call' | 'llm_return' | 'human_review';
  parent_stage_node_id?: string;
  paired_node_id?: string;
}
```

### 字段说明

#### `execution_id`

同一次调用链路共享的稳定 ID。

例如：

- 一个 `tool_call` 节点带 `execution_id = "exec-news-001"`
- 对应 `tool_return` 节点也带 `execution_id = "exec-news-001"`

这是最关键的字段。

如果只能加一个字段，请优先加它。

#### `node_kind`

明确节点语义，避免前端依赖 `node_name` 或 `node_type` 猜。

建议值：

- `business`
- `tool_call`
- `tool_return`
- `llm_call`
- `llm_return`
- `human_review`

#### `parent_stage_node_id`

标识该技术节点属于哪个上层业务阶段。

例如：

- `node-analysis` 是“结构化分析”业务节点
- 它下面发起多个工具调用
- 这些工具调用和返回都带 `parent_stage_node_id = "node-analysis"`

这样前端可以把技术细节下沉到“结构化分析”节点内部展示，而不是都暴露成主流程节点。

#### `paired_node_id`

直接指向对应节点。

例如：

- `tool_return_1.paired_node_id = "tool_call_1"`

该字段不是必须，但如果有它，前端实现和调试都会简单很多。

## 推荐补充字段

除了最低可行方案，还建议补这些字段：

```ts
interface WorkflowNode {
  parallel_group_id?: string;
  sequence_in_group?: number;
  tool_name?: string;
  tool_provider?: string;
  request_summary?: string;
  response_summary?: string;
  error_message?: string;
}
```

### 说明

- `parallel_group_id`
  标识同一批并发调用

- `sequence_in_group`
  并发组内的展示顺序，避免前端自己排序

- `tool_name`
  工具名称，例如 `news_search`

- `tool_provider`
  工具来源或服务名

- `request_summary`
  调用输入摘要

- `response_summary`
  返回摘要

- `error_message`
  失败原因

## 对 `WorkflowEdge` 的建议

建议给边增加类型字段：

```ts
interface WorkflowEdge {
  from: string;
  to: string;
  edge_type?: 'control_flow' | 'request_response' | 'parent_child' | 'fanout' | 'join';
}
```

### 为什么需要 `edge_type`

当前的 `from -> to` 只能表达“连通关系”，不能表达“关系类型”。

对于前端来说，这几种关系是完全不同的：

- `control_flow`
  业务主流程先后顺序

- `request_response`
  调用与返回的配对关系

- `parent_child`
  技术节点从属于业务阶段节点

- `fanout`
  一个阶段同时发起多个调用

- `join`
  多个并发结果汇合回主流程

如果没有 `edge_type`，前端很难既画对图，又不误合并节点。

## 对事件流接口的建议

如果前端还要把事件流和 workflow 节点联动，建议 `/research/tasks/{taskId}/events` 也补充相同的配对信息：

```ts
interface TaskEvent {
  event_id?: string;
  task_id?: string;
  node_id: string;
  node_name: string;
  node_status: string;
  timestamp: string;

  execution_id?: string;
  parallel_group_id?: string;
}
```

这样前端才能把：

- 主流程节点
- 工具调用明细
- 事件流日志

三者稳定关联起来。

## 推荐返回示例

下面是支持并发工具调用的一个最小可用示例：

```json
{
  "task_id": "task-001",
  "current_node": "node-analysis",
  "waiting_intervention_node_id": null,
  "nodes": [
    {
      "node_id": "node-analysis",
      "node_name": "结构化分析",
      "node_kind": "business",
      "node_status": "running"
    },
    {
      "node_id": "node-tool-call-1",
      "node_name": "调用新闻检索",
      "node_kind": "tool_call",
      "node_status": "completed",
      "execution_id": "exec-news-001",
      "parallel_group_id": "pg-01",
      "parent_stage_node_id": "node-analysis",
      "tool_name": "news_search"
    },
    {
      "node_id": "node-tool-return-1",
      "node_name": "新闻检索返回",
      "node_kind": "tool_return",
      "node_status": "completed",
      "execution_id": "exec-news-001",
      "parallel_group_id": "pg-01",
      "parent_stage_node_id": "node-analysis",
      "paired_node_id": "node-tool-call-1",
      "response_summary": "返回新闻结果 52 条"
    },
    {
      "node_id": "node-tool-call-2",
      "node_name": "调用财报检索",
      "node_kind": "tool_call",
      "node_status": "completed",
      "execution_id": "exec-filing-001",
      "parallel_group_id": "pg-01",
      "parent_stage_node_id": "node-analysis",
      "tool_name": "filing_search"
    },
    {
      "node_id": "node-tool-return-2",
      "node_name": "财报检索返回",
      "node_kind": "tool_return",
      "node_status": "completed",
      "execution_id": "exec-filing-001",
      "parallel_group_id": "pg-01",
      "parent_stage_node_id": "node-analysis",
      "paired_node_id": "node-tool-call-2",
      "response_summary": "返回财报结果 12 条"
    }
  ],
  "edges": [
    {
      "from": "node-analysis",
      "to": "node-tool-call-1",
      "edge_type": "fanout"
    },
    {
      "from": "node-analysis",
      "to": "node-tool-call-2",
      "edge_type": "fanout"
    },
    {
      "from": "node-tool-call-1",
      "to": "node-tool-return-1",
      "edge_type": "request_response"
    },
    {
      "from": "node-tool-call-2",
      "to": "node-tool-return-2",
      "edge_type": "request_response"
    }
  ]
}
```

## 前端收益

有了以上字段，前端就可以稳定做这些事：

1. 主流程里只展示业务阶段节点
2. 把多个技术调用收敛到业务节点内部
3. 在详情区正确列出每次调用和对应返回
4. 正确处理并发、乱序返回和失败重试
5. 让进度条按业务阶段推进，而不是被技术节点数量干扰

## 结论

### 最低建议

至少新增：

- `WorkflowNode.execution_id`

### 推荐建议

新增：

- `WorkflowNode.execution_id`
- `WorkflowNode.node_kind`
- `WorkflowNode.parent_stage_node_id`
- `WorkflowNode.paired_node_id`
- `WorkflowEdge.edge_type`

如果没有这些字段，前端无法可靠处理并发 `tool_call` / `tool_return` 的归并和展示。

