import type {
  CreateResearchTaskRequest,
  CreateResearchTaskResponse,
  HistoryTaskItem,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ReportDetail,
  ResearchTaskStatusResponse,
  TaskWorkflowResponse,
} from '../types';

export const mockHistoryTasks: HistoryTaskItem[] = [
  {
    task_id: 'task-001',
    object_name: '腾讯控股',
    object_type: 'company',
    report_id: 'report-001',
    status: 'completed',
    created_at: '2026-03-28T09:30:00Z',
  },
  {
    task_id: 'task-002',
    object_name: '宁德时代',
    object_type: 'stock',
    report_id: 'report-002',
    status: 'analyzing',
    created_at: '2026-03-29T13:20:00Z',
  },
];

export const mockReportDetail: ReportDetail = {
  report_id: 'report-001',
  task_id: 'task-001',
  title: '腾讯控股深度调研报告',
  content:
    '报告围绕业务结构、增长质量、竞争格局与风险因素展开，形成可执行的投资与经营观察结论。',
  citations: [
    {
      citation_id: 'citation-001',
      source_title: '腾讯控股年度报告',
      source_url: 'https://example.com/tencent-annual-report',
    },
    {
      citation_id: 'citation-002',
      source_title: '行业竞争格局研究',
      source_url: 'https://example.com/industry-analysis',
    },
  ],
  created_at: '2026-03-29T08:00:00Z',
};

export const mockTaskStatus: ResearchTaskStatusResponse = {
  task_id: 'task-002',
  status: 'analyzing',
  current_stage: 'analysis',
  progress: 68,
  hint: '正在进行结构化分析与结论汇总。',
};

export const mockTaskWorkflow: TaskWorkflowResponse = {
  task_id: 'task-002',
  current_node: 'node-analysis',
  nodes: [
    { node_id: 'node-receive', node_name: '任务接收', node_status: 'completed' },
    { node_id: 'node-search', node_name: '数据检索', node_status: 'running' },
    { node_id: 'node-analysis', node_name: '结构化分析', node_status: 'pending' },
    { node_id: 'node-report', node_name: '报告生成', node_status: 'pending' },
  ],
  edges: [
    { from: 'node-receive', to: 'node-search' },
    { from: 'node-search', to: 'node-analysis' },
    { from: 'node-analysis', to: 'node-report' },
  ],
};

export async function mockLogin(payload: LoginRequest): Promise<LoginResponse> {
  return {
    user_id: 'user-001',
    nickname: payload.username,
    role: 'user',
    permissions: ['auth:login', 'research:task:create', 'research:task:read', 'report:read'],
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 7200,
  };
}

export async function mockRegister(payload: RegisterRequest): Promise<RegisterResponse> {
  return {
    user_id: 'user-002',
    role: 'user',
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    need_initialize: false,
  };
}

export async function mockCreateResearchTask(
  payload: CreateResearchTaskRequest
): Promise<CreateResearchTaskResponse> {
  return {
    task_id: `task-${Date.now()}`,
    detected_object_type: payload.object_type ?? 'company',
    status: 'pending',
    next_action: 'poll_status',
  };
}
