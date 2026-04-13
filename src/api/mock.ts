import type {
  AlertItem,
  AlertsResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CreateAlertRequest,
  CreateAlertResponse,
  CreateFavoriteFolderRequest,
  CreateFavoriteFolderResponse,
  CreateFavoriteItemRequest,
  CreateFavoriteItemResponse,
  CreateResearchTaskRequest,
  CreateResearchTaskResponse,
  ModelsAvailableResponse,
  ModelRoutingRecommendationResponse,
  ResearchTasksResponse,
  CancelResearchTaskResponse,
  TaskFactsResponse,
  AnalyzeTaskRequest,
  AnalyzeTaskResponse,
  CrossValidationResultResponse,
  RetryAnalysisRequest,
  RetryAnalysisResponse,
  TriggerCrossValidationRequest,
  TriggerCrossValidationResponse,
  TaskEvent,
  TaskInterventionDetailResponse,
  SubmitTaskInterventionRequest,
  SubmitTaskInterventionResponse,
  DeleteAlertResponse,
  DeleteFavoriteFolderResponse,
  DeleteFavoriteItemResponse,
  FavoriteFoldersResponse,
  FavoriteItemsResponse,
  HistoryTaskItem,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  MarkAllMessagesReadResponse,
  MarkMessageReadResponse,
  MessageItem,
  MessagesResponse,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
  PasswordResetRequest,
  PasswordResetRequestResponse,
  PlatformInitializeRequest,
  PlatformInitializeResponse,
  PlatformInitStatusResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ReportsResponse,
  ReportListItem,
  ReportCitationsResponse,
  ReportCitationDetail,
  ReportVersionsResponse,
  ExportReportRequest,
  ExportReportResponse,
  ReportExportStatusResponse,
  ShareReportRequest,
  ShareReportResponse,
  DeleteReportShareResponse,
  PublicSharedReportResponse,
  CreateReportQaRequest,
  CreateReportQaResponse,
  ReportQaListResponse,
  AppendReportQaRequest,
  AppendReportQaResponse,
  ReportQaItem,
  ReportDetail,
  ResearchHistoryDetail,
  ResearchHistoryReloadResponse,
  ResearchTaskStatusResponse,
  SendEmailCodeRequest,
  SendEmailCodeResponse,
  TaskWorkflowResponse,
  UpdateAlertRequest,
  UpdateAlertResponse,
  UpdateFavoriteFolderRequest,
  UpdateFavoriteFolderResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  UserProfile,
  VerifyEmailRequest,
  VerifyEmailResponse,
  MoveFavoriteItemRequest,
  MoveFavoriteItemResponse,
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

const mockReports: ReportListItem[] = [
  {
    report_id: 'report-001',
    task_id: 'task-001',
    title: '腾讯控股深度调研报告',
    summary: '覆盖业务结构、盈利质量与估值区间。',
    created_at: '2026-03-29T08:00:00Z',
    updated_at: '2026-03-29T09:15:00Z',
  },
  {
    report_id: 'report-002',
    task_id: 'task-002',
    title: '宁德时代行业竞争与周期研判',
    summary: '聚焦产业链议价能力与中期景气判断。',
    created_at: '2026-03-30T10:20:00Z',
    updated_at: '2026-03-30T12:10:00Z',
  },
];

const mockReportCitationDetails: Record<string, Record<string, ReportCitationDetail>> = {
  'report-001': {
    'citation-001': {
      report_id: 'report-001',
      citation_id: 'citation-001',
      source_title: '腾讯控股年度报告',
      source_url: 'https://example.com/tencent-annual-report',
      excerpt: '广告业务收入保持双位数增长，视频号商业化提速。',
      published_at: '2026-03-20T08:00:00Z',
      source_type: 'annual_report',
    },
    'citation-002': {
      report_id: 'report-001',
      citation_id: 'citation-002',
      source_title: '行业竞争格局研究',
      source_url: 'https://example.com/industry-analysis',
      excerpt: '头部平台在内容分发与广告转化上的优势进一步扩大。',
      published_at: '2026-03-22T12:00:00Z',
      source_type: 'industry_report',
    },
  },
};

const mockReportVersions: Record<string, ReportVersionsResponse> = {
  'report-001': {
    report_id: 'report-001',
    current_version_id: 'ver-001-2',
    versions: [
      {
        version_id: 'ver-001-2',
        version_no: 2,
        title: '腾讯控股深度调研报告（修订版）',
        created_at: '2026-03-29T09:15:00Z',
        created_by: 'demo_user',
        change_note: '补充估值敏感性分析与风险情景。',
      },
      {
        version_id: 'ver-001-1',
        version_no: 1,
        title: '腾讯控股深度调研报告',
        created_at: '2026-03-29T08:00:00Z',
        created_by: 'demo_user',
        change_note: '初版生成。',
      },
    ],
  },
};

const mockReportExports: Record<string, ReportExportStatusResponse> = {};
const mockReportShares: Record<
  string,
  {
    share_id: string;
    report_id: string;
    share_url: string;
    expires_at?: string;
    allow_download: boolean;
  }
> = {};

const mockReportQaMap: Record<string, ReportQaItem[]> = {
  'report-001': [
    {
      qa_id: 'qa-001',
      question: '该报告对广告业务未来两个季度的核心判断是什么？',
      answer: '判断为温和复苏，主要驱动来自视频号广告填充率提升与电商广告预算回暖。',
      status: 'completed',
      created_at: '2026-03-29T10:10:00Z',
      updated_at: '2026-03-29T10:10:00Z',
    },
  ],
};

export const mockTaskStatus: ResearchTaskStatusResponse = {
  task_id: 'task-002',
  status: 'waiting_user',
  current_stage: 'human_review',
  progress: 68,
  hint: '分析阶段发现低置信度结论，等待人工确认检索范围与分析规则。',
  object_name: '宁德时代',
  object_type: 'stock',
  current_node_id: 'node-analysis',
  current_node_name: '结构化分析',
  waiting_intervention: true,
  metrics_summary: [
    { label: '已采集事实', value: 128 },
    { label: '低置信度事实', value: 6 },
    { label: '待确认冲突簇', value: 2 },
  ],
  available_actions: ['confirm_continue', 'update_rules', 'skip_intervention'],
};

export const mockTaskWorkflow: TaskWorkflowResponse = {
  task_id: 'task-002',
  current_node: 'node-analysis',
  waiting_intervention_node_id: 'node-analysis',
  nodes: [
    {
      node_id: 'node-receive',
      node_name: '任务接收',
      node_type: 'ingest',
      node_status: 'completed',
      description: '解析对象类型与任务参数。',
      summary: '已识别目标为股票，完成初始任务建模。',
      started_at: '2026-04-06T08:55:00Z',
      finished_at: '2026-04-06T08:55:08Z',
      updated_at: '2026-04-06T08:55:08Z',
      duration_ms: 8000,
      metrics: [
        { label: '对象识别', value: 'stock' },
        { label: '任务优先级', value: 'P1' },
      ],
    },
    {
      node_id: 'node-search',
      node_name: '数据检索',
      node_type: 'retrieval',
      node_status: 'completed',
      description: '采集公告、新闻、研报和产业链数据。',
      summary: '已完成 128 条候选事实采集，并建立来源分组。',
      started_at: '2026-04-06T08:55:08Z',
      finished_at: '2026-04-06T08:58:30Z',
      updated_at: '2026-04-06T08:58:30Z',
      duration_ms: 202000,
      can_intervene: true,
      intervention_id: 'intv-search-001',
      metrics: [
        { label: '采集记录', value: 128 },
        { label: '高权威来源', value: 41 },
        { label: '平均耗时', value: '320ms' },
      ],
    },
    {
      node_id: 'node-analysis',
      node_name: '结构化分析',
      node_type: 'analysis',
      node_status: 'waiting_user',
      description: '聚合事实、识别冲突并形成结论草案。',
      summary: '检测到 6 条低置信度事实，需要人工确认是否调整规则。',
      started_at: '2026-04-06T08:58:31Z',
      updated_at: '2026-04-06T09:04:00Z',
      can_intervene: true,
      intervention_id: 'intv-analysis-001',
      metrics: [
        { label: '事实簇', value: 18 },
        { label: '低置信度', value: 6 },
        { label: '冲突簇', value: 2 },
      ],
    },
    {
      node_id: 'node-report',
      node_name: '报告生成',
      node_type: 'report',
      node_status: 'pending',
      description: '输出最终报告与结论摘要。',
      summary: '等待分析节点完成。',
      metrics: [{ label: '报告版本', value: 'draft-0' }],
    },
  ],
  edges: [
    { from: 'node-receive', to: 'node-search' },
    { from: 'node-search', to: 'node-analysis' },
    { from: 'node-analysis', to: 'node-report' },
  ],
};

export const mockHistoryDetail: ResearchHistoryDetail = {
  task_id: 'task-001',
  object_name: '腾讯控股',
  object_type: 'company',
  search_params: {
    time_range: '30d',
    source_authority: 'high',
  },
  fact_dataset: '共采集 128 条事实条目，覆盖公司公告、行业报告与新闻源。',
  report_id: 'report-001',
  status: 'completed',
  created_at: '2026-03-28T09:30:00Z',
};

export const mockUserProfile: UserProfile = {
  user_id: 'user-001',
  username: 'demo_user',
  nickname: '演示用户',
  email: 'demo@8feet.com',
  phone: '13800138000',
  avatar_url: 'https://example.com/avatar.png',
  role: 'user',
  permissions: ['user:profile:read', 'user:profile:write', 'research:task:create', 'report:read'],
  email_verified: true,
  last_login_at: '2026-04-06T10:00:00Z',
};

let mockFavoriteFolders: FavoriteFoldersResponse = {
  folders: [
    { folder_id: 'folder-default', folder_name: '默认收藏夹' },
    { folder_id: 'folder-report', folder_name: '报告收藏' },
  ],
  default_folder_id: 'folder-default',
};

let mockFavoriteItems: FavoriteItemsResponse = {
  list: [
    {
      favorite_id: 'fav-001',
      favorite_type: 'report',
      target_id: 'report-001',
      folder_id: 'folder-report',
      remark: '重点参考',
    },
    {
      favorite_id: 'fav-002',
      favorite_type: 'insight',
      target_id: 'insight-002',
      folder_id: 'folder-default',
      remark: '行业观点',
    },
  ],
  total: 2,
};

let mockAlerts: AlertItem[] = [
  {
    alert_id: 'alert-001',
    object_name: '腾讯控股',
    object_type: 'company',
    push_in_app: true,
    push_email: false,
    schedule_rule: 'daily',
    status: 'enabled',
  },
  {
    alert_id: 'alert-002',
    object_name: '宁德时代',
    object_type: 'stock',
    push_in_app: true,
    push_email: true,
    schedule_rule: 'weekly',
    status: 'disabled',
  },
];

let mockMessages: MessageItem[] = [
  {
    message_id: 'msg-001',
    title: '调研任务完成',
    content: 'task-001 已完成并生成报告。',
    read_status: false,
    created_at: '2026-04-06T09:00:00Z',
  },
  {
    message_id: 'msg-002',
    title: '提醒触发',
    content: '腾讯控股出现新的公告信息。',
    read_status: true,
    created_at: '2026-04-05T13:30:00Z',
  },
];

let mockResearchTasks: ResearchTasksResponse = {
  list: [
    {
      task_id: 'task-001',
      object_name: '腾讯控股',
      object_type: 'company',
      status: 'completed',
      created_at: '2026-03-28T09:30:00Z',
    },
    {
      task_id: 'task-002',
      object_name: '宁德时代',
      object_type: 'stock',
      status: 'analyzing',
      created_at: '2026-03-29T13:20:00Z',
    },
  ],
  total: 2,
};

const mockModelsAvailable: ModelsAvailableResponse = {
  models: [
    { model_id: 'model-deepseek-v3', model_name: 'DeepSeek V3', provider: 'DeepSeek' },
    { model_id: 'model-gpt-4.1', model_name: 'GPT-4.1', provider: 'OpenAI' },
    { model_id: 'model-qwen-max', model_name: 'Qwen Max', provider: 'Alibaba Cloud' },
  ],
  recommended_model_id: 'model-deepseek-v3',
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

export async function mockRegister(_payload: RegisterRequest): Promise<RegisterResponse> {
  return {
    user_id: 'user-002',
    role: 'user',
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    need_initialize: false,
  };
}

export async function mockLogout(_payload: LogoutRequest): Promise<LogoutResponse> {
  return {
    result: 'ok',
  };
}

export async function mockRefreshToken(
  payload: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  return {
    access_token: `mock-access-token-${Date.now()}`,
    refresh_token: payload.refresh_token || 'mock-refresh-token',
    expires_in: 7200,
  };
}

export async function mockSendEmailCode(
  payload: SendEmailCodeRequest
): Promise<SendEmailCodeResponse> {
  return {
    result: `sent:${payload.scene}`,
    expire_in: 300,
  };
}

export async function mockVerifyEmail(
  payload: VerifyEmailRequest
): Promise<VerifyEmailResponse> {
  return {
    verified: payload.code.trim().length > 0,
  };
}

export async function mockPasswordResetRequest(
  _payload: PasswordResetRequest
): Promise<PasswordResetRequestResponse> {
  return {
    result: 'ok',
  };
}

export async function mockPasswordResetConfirm(
  _payload: PasswordResetConfirmRequest
): Promise<PasswordResetConfirmResponse> {
  return {
    result: 'ok',
  };
}

export async function mockGetPlatformInitStatus(): Promise<PlatformInitStatusResponse> {
  return {
    initialized: false,
    has_super_admin: false,
  };
}

export async function mockPlatformInitialize(
  _payload: PlatformInitializeRequest
): Promise<PlatformInitializeResponse> {
  return {
    initialized: true,
    super_admin_user_id: 'user-super-admin-001',
  };
}

export async function mockGetCurrentUserProfile(): Promise<UserProfile> {
  return { ...mockUserProfile };
}

export async function mockUpdateCurrentUserProfile(
  payload: UpdateUserProfileRequest
): Promise<UpdateUserProfileResponse> {
  const updatedFields = Object.entries(payload)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key]) => key);
  return {
    user_id: mockUserProfile.user_id,
    updated_fields: updatedFields,
  };
}

export async function mockChangeCurrentUserPassword(
  _payload: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  return {
    result: 'ok',
  };
}

export async function mockCreateResearchTask(
  payload: CreateResearchTaskRequest
): Promise<CreateResearchTaskResponse> {
  const taskId = `task-${Date.now()}`;
  mockResearchTasks.list.unshift({
    task_id: taskId,
    object_name: payload.object_name,
    object_type: payload.object_type ?? 'company',
    status: 'pending',
    created_at: new Date().toISOString(),
  });
  mockResearchTasks.total = mockResearchTasks.list.length;
  return {
    task_id: taskId,
    detected_object_type: payload.object_type ?? 'company',
    status: 'pending',
    next_action: 'poll_status',
  };
}

export async function mockGetModelsAvailable(): Promise<ModelsAvailableResponse> {
  return {
    models: [...mockModelsAvailable.models],
    recommended_model_id: mockModelsAvailable.recommended_model_id,
  };
}

export async function mockGetModelRoutingRecommendation(params: {
  object_type?: string;
}): Promise<ModelRoutingRecommendationResponse> {
  const fallback = mockModelsAvailable.recommended_model_id;
  const recommended =
    params.object_type === 'stock'
      ? 'model-gpt-4.1'
      : params.object_type === 'commodity'
        ? 'model-qwen-max'
        : fallback;
  return {
    recommended_model_id: recommended,
    candidate_models: [...mockModelsAvailable.models],
    reason: '根据对象类型与历史效果推荐。',
  };
}

export async function mockGetResearchTasks(): Promise<ResearchTasksResponse> {
  return {
    list: [...mockResearchTasks.list],
    total: mockResearchTasks.total,
  };
}

export async function mockCancelResearchTask(taskId: string): Promise<CancelResearchTaskResponse> {
  const target = mockResearchTasks.list.find((task) => task.task_id === taskId);
  if (target) {
    target.status = 'failed';
  }
  return {
    task_id: taskId,
    status: target?.status ?? 'failed',
  };
}

export async function mockGetTaskFacts(taskId: string): Promise<TaskFactsResponse> {
  return {
    task_id: taskId,
    fact_count: 128,
    sources: [
      { source_name: 'news', count: 52 },
      { source_name: 'report', count: 41 },
      { source_name: 'filing', count: 35 },
    ],
    top_entities: ['腾讯控股', '视频号', '云业务'],
    dataset_version: 'v1.0.3',
  };
}

export async function mockAnalyzeTask(
  taskId: string,
  _payload: AnalyzeTaskRequest
): Promise<AnalyzeTaskResponse> {
  const target = mockResearchTasks.list.find((task) => task.task_id === taskId);
  if (target) {
    target.status = 'analyzing';
  }
  return {
    task_id: taskId,
    status: 'analyzing',
    report_id: `report-${taskId}`,
  };
}

export async function mockRetryAnalysis(
  taskId: string,
  _payload: RetryAnalysisRequest
): Promise<RetryAnalysisResponse> {
  const target = mockResearchTasks.list.find((task) => task.task_id === taskId);
  if (target) {
    target.status = 'analyzing';
  }
  return {
    task_id: taskId,
    status: 'analyzing',
  };
}

interface MockCrossValidationResultRecord {
  task_id?: string;
  status?: 'queued' | 'running' | 'completed' | 'failed';
  consensus_points?: string[];
  difference_points?: string[];
  model_outputs?: Array<{
    model_id: string;
    summary: string;
  }>;
  used_models?: string[];
  consensus_summary?: string;
  consensus_score?: number;
  disagreements?: string[];
  updated_at?: string;
  results?: Array<{
    model_id: string;
    conclusion: string;
    confidence?: number;
    evidence_count?: number;
  }>;
}

function normalizeCrossValidationResult(
  record?: MockCrossValidationResultRecord
): CrossValidationResultResponse {
  const modelOutputs =
    record?.model_outputs ??
    record?.results?.map((item) => ({
      model_id: item.model_id,
      summary: item.conclusion,
    })) ??
    [];

  return {
    consensus_points: record?.consensus_points ?? (record?.consensus_summary ? [record.consensus_summary] : []),
    difference_points: record?.difference_points ?? record?.disagreements ?? [],
    model_outputs: modelOutputs.map((item) => ({ ...item })),
    used_models: record?.used_models ?? modelOutputs.map((item) => item.model_id),
  };
}

const mockCrossValidationResultMap: Record<string, MockCrossValidationResultRecord> = {
  'task-002': {
    task_id: 'task-002',
    status: 'completed',
    consensus_summary: '主结论整体一致，估值假设存在轻微分歧。',
    consensus_score: 0.84,
    disagreements: ['短期增长弹性判断差异', '估值中枢区间上沿分歧'],
    results: [
      {
        model_id: 'model-deepseek-v3',
        conclusion: '业务韧性较强，中期增长可持续。',
        confidence: 0.86,
        evidence_count: 42,
      },
      {
        model_id: 'model-gpt-4.1',
        conclusion: '核心逻辑一致，但需关注广告需求恢复斜率。',
        confidence: 0.82,
        evidence_count: 39,
      },
    ],
    updated_at: '2026-04-06T09:10:00Z',
  },
};

export async function mockTriggerCrossValidation(
  taskId: string,
  payload: TriggerCrossValidationRequest = {}
): Promise<TriggerCrossValidationResponse> {
  const now = new Date().toISOString();
  const modelIds = payload.model_ids?.length
    ? payload.model_ids
    : ['model-deepseek-v3', 'model-gpt-4.1'];
  const existing = mockCrossValidationResultMap[taskId];

  mockCrossValidationResultMap[taskId] = {
    task_id: taskId,
    status: 'running',
    consensus_summary: existing?.consensus_summary,
    consensus_score: existing?.consensus_score,
    disagreements: existing?.disagreements ?? [],
    results: modelIds.map((modelId) => ({
      model_id: modelId,
      conclusion: '交叉验证进行中',
    })),
    updated_at: now,
  };

  setTimeout(() => {
    const current = mockCrossValidationResultMap[taskId];
    if (!current) {
      return;
    }
    mockCrossValidationResultMap[taskId] = {
      ...current,
      status: 'completed',
      consensus_summary: '交叉验证完成，主结论一致。',
      consensus_score: 0.88,
      disagreements: ['估值弹性判断有差异'],
      results: (current.results ?? []).map((item, index) => ({
        ...item,
        conclusion: index % 2 === 0 ? '维持偏积极判断。' : '维持中性偏积极判断。',
        confidence: 0.8 + index * 0.03,
        evidence_count: 30 + index * 4,
      })),
      updated_at: new Date().toISOString(),
    };
  }, 300);

  return {
    task_id: taskId,
    status: 'queued',
    result_id: `cv-${taskId}-${Date.now()}`,
  };
}

export async function mockGetCrossValidationResult(
  taskId: string
): Promise<CrossValidationResultResponse> {
  const existing = mockCrossValidationResultMap[taskId];
  if (existing) {
    return normalizeCrossValidationResult(existing);
  }
  return normalizeCrossValidationResult({
    task_id: taskId,
    status: 'queued',
    consensus_summary: '尚未触发交叉验证',
    consensus_score: 0,
    disagreements: [],
    results: [],
    updated_at: new Date().toISOString(),
  } as MockCrossValidationResultRecord);
}

const mockTaskEventsMap: Record<string, TaskEvent[]> = {
  'task-002': [
    {
      event_id: 'event-001',
      task_id: 'task-002',
      node_id: 'node-receive',
      node_name: '任务接收',
      node_status: 'completed',
      level: 'success',
      title: '任务初始化完成',
      message: '已识别目标对象类型，并建立调研任务上下文。',
      metrics: { object_type: 'stock', priority: 'P1' },
      timestamp: '2026-04-06T08:55:08Z',
    },
    {
      event_id: 'event-002',
      task_id: 'task-002',
      node_id: 'node-search',
      node_name: '数据检索',
      node_status: 'completed',
      level: 'info',
      title: '候选事实采集完成',
      message: '完成公告、新闻、研报等多源采集，生成 128 条候选事实。',
      metrics: { records: 128, high_authority_sources: 41, latency_ms: 320 },
      timestamp: '2026-04-06T08:58:30Z',
    },
    {
      event_id: 'event-003',
      task_id: 'task-002',
      node_id: 'node-analysis',
      node_name: '结构化分析',
      node_status: 'running',
      level: 'warning',
      title: '检测到低置信度事实',
      message: '有 6 条事实可信度不足，且存在 2 个冲突簇，建议人工复核。',
      metrics: { low_confidence_facts: 6, conflict_clusters: 2 },
      timestamp: '2026-04-06T09:03:10Z',
    },
    {
      event_id: 'event-004',
      task_id: 'task-002',
      node_id: 'node-analysis',
      node_name: '结构化分析',
      node_status: 'waiting_user',
      level: 'warning',
      title: '等待人工介入',
      message: '系统暂停于结构化分析节点，等待用户决定继续、更新规则或跳过。',
      metrics: { available_actions: 3 },
      timestamp: '2026-04-06T09:04:00Z',
    },
  ],
};

export async function mockGetTaskEvents(taskId: string): Promise<TaskEvent[]> {
  return [...(mockTaskEventsMap[taskId] ?? [])];
}

const mockTaskInterventionsMap: Record<string, Record<string, TaskInterventionDetailResponse>> = {
  'task-002': {
    'node-search': {
      task_id: 'task-002',
      node_id: 'node-search',
      node_name: '数据检索',
      intervention_type: 'rule_adjustment',
      status: 'waiting_user',
      reason: '部分行业论坛信号噪声较高，可按需调整来源范围。',
      suggested_action: '如需提高召回率，可开启论坛源；如需提升可信度，保持高权威源优先。',
      current_params: {
        source_authority: 'high',
        max_results: 100,
        include_forum: false,
      },
      preview_data: {
        estimated_records: 48,
        estimated_latency_ms: 520,
        risk: '可能引入低质量噪声信息',
      },
    },
    'node-analysis': {
      task_id: 'task-002',
      node_id: 'node-analysis',
      node_name: '结构化分析',
      intervention_type: 'manual_review',
      status: 'waiting_user',
      reason: '发现 6 条低置信度事实与 2 个冲突簇，需要人工决策。',
      suggested_action: '建议先查看低置信度事实摘要，再决定继续或更新分析规则。',
      current_params: {
        report_mode: 'full',
        confidence_threshold: 0.8,
        contradiction_policy: 'hold_for_review',
      },
      preview_data: {
        pending_facts: 12,
        low_confidence_facts: 6,
        contradiction_groups: 2,
        sample_titles: ['动力电池价格战影响毛利率', '海外扩产节奏与订单兑现差异'],
      },
    },
  },
};

export async function mockGetTaskIntervention(
  taskId: string,
  nodeId: string
): Promise<TaskInterventionDetailResponse> {
  const byTask = mockTaskInterventionsMap[taskId];
  const target = byTask?.[nodeId];
  if (target) {
    return {
      ...target,
      current_params: { ...target.current_params },
      preview_data: { ...target.preview_data },
    };
  }
  return {
    node_id: nodeId,
    node_name: nodeId,
    intervention_type: 'manual_review',
    current_params: { enabled: true },
    preview_data: {},
  };
}

export async function mockSubmitTaskIntervention(
  taskId: string,
  nodeId: string,
  payload: SubmitTaskInterventionRequest
): Promise<SubmitTaskInterventionResponse> {
  if (!mockTaskInterventionsMap[taskId]) {
    mockTaskInterventionsMap[taskId] = {};
  }
  if (!mockTaskInterventionsMap[taskId][nodeId]) {
    mockTaskInterventionsMap[taskId][nodeId] = {
      task_id: taskId,
      node_id: nodeId,
      node_name: nodeId,
      intervention_type: 'manual_review',
      status: 'waiting_user',
      current_params: {},
      preview_data: {},
    };
  }

  const target = mockTaskInterventionsMap[taskId][nodeId];
  const task = mockResearchTasks.list.find((item) => item.task_id === taskId);

  if (payload.action === 'update_rules' && payload.rule_changes !== undefined) {
    target.current_params = {
      ...target.current_params,
      rule_changes:
        typeof payload.rule_changes === 'string'
          ? payload.rule_changes
          : JSON.stringify(payload.rule_changes),
    };
  }

  target.status = 'resolved';

  if (task) {
    task.status = 'analyzing';
  }

  mockTaskEventsMap[taskId] = [
    {
      event_id: `event-intervention-${Date.now()}`,
      task_id: taskId,
      node_id: nodeId,
      node_name: target.node_name,
      node_status: 'completed',
      level: 'success',
      title: '人工介入已提交',
      message: `用户执行操作：${payload.action}`,
      metrics: {
        has_rule_changes: payload.rule_changes ? 'yes' : 'no',
        has_comment: payload.comment ? 'yes' : 'no',
      },
      timestamp: new Date().toISOString(),
    },
    ...(mockTaskEventsMap[taskId] ?? []),
  ];

  if (taskId === 'task-002') {
    mockTaskStatus.status = 'analyzing';
    mockTaskStatus.current_stage = 'analysis_resume';
    mockTaskStatus.hint = '已收到人工反馈，系统恢复结构化分析。';
    mockTaskStatus.waiting_intervention = false;
    mockTaskStatus.available_actions = ['retry_analysis', 'cancel_task'];
    mockTaskStatus.current_node_id = 'node-report';
    mockTaskStatus.current_node_name = '报告生成';

    mockTaskWorkflow.waiting_intervention_node_id = undefined;
    mockTaskWorkflow.current_node = 'node-report';
    mockTaskWorkflow.nodes = mockTaskWorkflow.nodes.map((node) => {
      if (node.node_id === nodeId) {
        return {
          ...node,
          node_status: 'completed',
          summary: '人工审核完成，分析结果已确认继续执行。',
          finished_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      if (node.node_id === 'node-report') {
        return {
          ...node,
          node_status: 'running',
          summary: '正在生成报告草稿与结论摘要。',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return node;
    });
  }

  return {
    task_id: taskId,
    node_id: nodeId,
    result: `accepted:${payload.action}`,
    audit_log_id: `audit-${Date.now()}`,
    task_status: 'analyzing',
    node_status: 'completed',
  };
}

export async function mockGetResearchHistoryDetail(taskId: string): Promise<ResearchHistoryDetail> {
  return {
    ...mockHistoryDetail,
    task_id: taskId || mockHistoryDetail.task_id,
  };
}

export async function mockReloadResearchHistory(
  taskId: string
): Promise<ResearchHistoryReloadResponse> {
  return {
    task_id: taskId,
    report_id: `report-from-${taskId}`,
    redirect_url: `/report?task_id=${taskId}`,
  };
}

export async function mockGetReports(params?: {
  keyword?: string;
  page?: number;
  page_size?: number;
}): Promise<ReportsResponse> {
  let list = [...mockReports];
  const keyword = params?.keyword?.trim().toLowerCase();
  if (keyword) {
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        (item.summary ?? '').toLowerCase().includes(keyword) ||
        item.report_id.toLowerCase().includes(keyword)
    );
  }

  const page = params?.page ?? 1;
  const pageSize = params?.page_size ?? (list.length || 10);
  const start = Math.max(0, (page - 1) * pageSize);
  const end = start + pageSize;
  const paged = list.slice(start, end);
  return {
    list: paged,
    total: list.length,
    page,
    page_size: pageSize,
  };
}

export async function mockGetReportCitations(reportId: string): Promise<ReportCitationsResponse> {
  const reportDetail =
    reportId === mockReportDetail.report_id ? mockReportDetail : { ...mockReportDetail, report_id: reportId };
  return {
    report_id: reportId,
    list: [...reportDetail.citations],
    total: reportDetail.citations.length,
  };
}

export async function mockGetReportCitationDetail(
  reportId: string,
  citationId: string
): Promise<ReportCitationDetail> {
  const existing = mockReportCitationDetails[reportId]?.[citationId];
  if (existing) {
    return { ...existing };
  }

  const citation = mockReportDetail.citations.find((item) => item.citation_id === citationId);
  if (citation) {
    return {
      report_id: reportId,
      citation_id: citationId,
      source_title: citation.source_title,
      source_url: citation.source_url,
      source_type: 'web',
    };
  }

  return {
    report_id: reportId,
    citation_id: citationId,
    source_title: citationId,
    source_url: '',
    source_type: 'unknown',
  };
}

export async function mockGetReportVersions(reportId: string): Promise<ReportVersionsResponse> {
  const existing = mockReportVersions[reportId];
  if (existing) {
    return {
      report_id: existing.report_id,
      current_version_id: existing.current_version_id,
      versions: existing.versions.map((version) => ({ ...version })),
    };
  }
  return {
    report_id: reportId,
    versions: [
      {
        version_id: `ver-${reportId}-1`,
        version_no: 1,
        title: `报告 ${reportId} v1`,
        created_at: new Date().toISOString(),
      },
    ],
    current_version_id: `ver-${reportId}-1`,
  };
}

export async function mockExportReport(
  reportId: string,
  payload: ExportReportRequest
): Promise<ExportReportResponse> {
  const exportId = `export-${Date.now()}`;
  mockReportExports[exportId] = {
    export_id: exportId,
    report_id: reportId,
    status: 'processing',
  };

  setTimeout(() => {
    mockReportExports[exportId] = {
      export_id: exportId,
      report_id: reportId,
      status: 'completed',
      download_url: `https://example.com/exports/${reportId}.${payload.format}`,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }, 500);

  return {
    export_id: exportId,
    report_id: reportId,
    status: 'queued',
  };
}

export async function mockGetReportExportStatus(
  exportId: string
): Promise<ReportExportStatusResponse> {
  return (
    mockReportExports[exportId] ?? {
      export_id: exportId,
      report_id: 'unknown',
      status: 'failed',
      error_message: 'export_not_found',
    }
  );
}

export async function mockShareReport(
  reportId: string,
  payload: ShareReportRequest
): Promise<ShareReportResponse> {
  const shareId = `share-${Date.now()}`;
  const expiresAt = payload.expires_in_hours
    ? new Date(Date.now() + payload.expires_in_hours * 60 * 60 * 1000).toISOString()
    : undefined;
  const shareUrl = `https://example.com/public/reports/share/${shareId}`;

  mockReportShares[shareId] = {
    share_id: shareId,
    report_id: reportId,
    share_url: shareUrl,
    expires_at: expiresAt,
    allow_download: payload.allow_download ?? true,
  };

  return {
    share_id: shareId,
    report_id: reportId,
    share_url: shareUrl,
    expires_at: expiresAt,
  };
}

export async function mockDeleteReportShare(
  _reportId: string,
  shareId: string
): Promise<DeleteReportShareResponse> {
  delete mockReportShares[shareId];
  return {
    result: 'ok',
    share_id: shareId,
  };
}

export async function mockGetPublicSharedReport(
  shareId: string
): Promise<PublicSharedReportResponse> {
  const share = mockReportShares[shareId];
  if (!share) {
    return {
      share_id: shareId,
      report: { ...mockReportDetail },
      allow_download: false,
    };
  }

  return {
    share_id: shareId,
    report: {
      ...mockReportDetail,
      report_id: share.report_id,
    },
    allow_download: share.allow_download,
    expires_at: share.expires_at,
  };
}

export async function mockCreateReportQa(
  reportId: string,
  payload: CreateReportQaRequest
): Promise<CreateReportQaResponse> {
  if (!mockReportQaMap[reportId]) {
    mockReportQaMap[reportId] = [];
  }
  const now = new Date().toISOString();
  const qa: ReportQaItem = {
    qa_id: `qa-${Date.now()}`,
    question: payload.question,
    answer: '系统已记录该问题，正在基于当前报告内容生成回答。',
    status: 'completed',
    created_at: now,
    updated_at: now,
  };
  mockReportQaMap[reportId].unshift(qa);
  return {
    report_id: reportId,
    qa: { ...qa },
  };
}

export async function mockGetReportQa(reportId: string): Promise<ReportQaListResponse> {
  const list = (mockReportQaMap[reportId] ?? []).map((item) => ({ ...item }));
  return {
    report_id: reportId,
    list,
    total: list.length,
  };
}

export async function mockAppendReportQa(
  reportId: string,
  qaId: string,
  payload: AppendReportQaRequest
): Promise<AppendReportQaResponse> {
  if (!mockReportQaMap[reportId]) {
    mockReportQaMap[reportId] = [];
  }
  const target = mockReportQaMap[reportId].find((item) => item.qa_id === qaId);
  const now = new Date().toISOString();
  if (target) {
    target.question = `${target.question}\n追问：${payload.append_text}`;
    target.answer = `${target.answer}\n补充：基于追问，结论保持不变，但短期波动风险需要提高权重。`;
    target.updated_at = now;
    target.status = 'completed';
    return {
      report_id: reportId,
      qa: { ...target },
    };
  }

  const created: ReportQaItem = {
    qa_id: qaId,
    question: `追问：${payload.append_text}`,
    answer: '已接收补充追问。',
    status: 'completed',
    created_at: now,
    updated_at: now,
  };
  mockReportQaMap[reportId].unshift(created);
  return {
    report_id: reportId,
    qa: { ...created },
  };
}

export async function mockGetFavoriteFolders(): Promise<FavoriteFoldersResponse> {
  return {
    folders: [...mockFavoriteFolders.folders],
    default_folder_id: mockFavoriteFolders.default_folder_id,
  };
}

export async function mockCreateFavoriteFolder(
  payload: CreateFavoriteFolderRequest
): Promise<CreateFavoriteFolderResponse> {
  const folderId = `folder-${Date.now()}`;
  mockFavoriteFolders.folders.push({
    folder_id: folderId,
    folder_name: payload.folder_name,
    parent_id: payload.parent_id,
  });
  return {
    folder_id: folderId,
    folder_name: payload.folder_name,
  };
}

export async function mockUpdateFavoriteFolder(
  folderId: string,
  payload: UpdateFavoriteFolderRequest
): Promise<UpdateFavoriteFolderResponse> {
  const target = mockFavoriteFolders.folders.find((folder) => folder.folder_id === folderId);
  const updatedFields: string[] = [];
  if (target) {
    if (payload.folder_name !== undefined) {
      target.folder_name = payload.folder_name;
      updatedFields.push('folder_name');
    }
    if (payload.parent_id !== undefined) {
      target.parent_id = payload.parent_id;
      updatedFields.push('parent_id');
    }
  }
  return {
    folder_id: folderId,
    updated_fields: updatedFields,
  };
}

export async function mockDeleteFavoriteFolder(folderId: string): Promise<DeleteFavoriteFolderResponse> {
  mockFavoriteFolders.folders = mockFavoriteFolders.folders.filter((folder) => folder.folder_id !== folderId);
  mockFavoriteItems.list = mockFavoriteItems.list.filter((item) => item.folder_id !== folderId);
  mockFavoriteItems.total = mockFavoriteItems.list.length;
  return { result: 'ok' };
}

export async function mockGetFavoriteItems(params?: {
  folder_id?: string;
  favorite_type?: string;
}): Promise<FavoriteItemsResponse> {
  let list = [...mockFavoriteItems.list];
  if (params?.folder_id) {
    list = list.filter((item) => item.folder_id === params.folder_id);
  }
  if (params?.favorite_type) {
    list = list.filter((item) => item.favorite_type === params.favorite_type);
  }
  return {
    list,
    total: list.length,
  };
}

export async function mockCreateFavoriteItem(
  payload: CreateFavoriteItemRequest
): Promise<CreateFavoriteItemResponse> {
  const favoriteId = `fav-${Date.now()}`;
  mockFavoriteItems.list.push({
    favorite_id: favoriteId,
    favorite_type: payload.favorite_type,
    target_id: payload.target_id,
    folder_id: payload.folder_id,
    remark: payload.remark,
  });
  mockFavoriteItems.total = mockFavoriteItems.list.length;
  return {
    favorite_id: favoriteId,
    favorite_status: 'favorited',
  };
}

export async function mockMoveFavoriteItem(
  favoriteId: string,
  payload: MoveFavoriteItemRequest
): Promise<MoveFavoriteItemResponse> {
  const target = mockFavoriteItems.list.find((item) => item.favorite_id === favoriteId);
  if (target) {
    target.folder_id = payload.target_folder_id;
  }
  return {
    favorite_id: favoriteId,
    target_folder_id: payload.target_folder_id,
  };
}

export async function mockDeleteFavoriteItem(favoriteId: string): Promise<DeleteFavoriteItemResponse> {
  const target = mockFavoriteItems.list.find((item) => item.favorite_id === favoriteId);
  mockFavoriteItems.list = mockFavoriteItems.list.filter((item) => item.favorite_id !== favoriteId);
  mockFavoriteItems.total = mockFavoriteItems.list.length;
  return {
    result: 'ok',
    target_id: target?.target_id ?? '',
  };
}

export async function mockGetAlerts(params?: {
  object_type?: string;
  status?: string;
}): Promise<AlertsResponse> {
  let list = [...mockAlerts];
  if (params?.object_type) {
    list = list.filter((item) => item.object_type === params.object_type);
  }
  if (params?.status) {
    list = list.filter((item) => item.status === params.status);
  }
  return {
    list,
    total: list.length,
  };
}

export async function mockCreateAlert(payload: CreateAlertRequest): Promise<CreateAlertResponse> {
  const alertId = `alert-${Date.now()}`;
  mockAlerts.push({
    alert_id: alertId,
    object_name: payload.object_name,
    object_type: payload.object_type,
    push_in_app: payload.push_in_app,
    push_email: payload.push_email,
    schedule_rule: payload.schedule_rule,
    status: 'enabled',
  });
  return {
    alert_id: alertId,
    status: 'enabled',
  };
}

export async function mockUpdateAlert(
  alertId: string,
  payload: UpdateAlertRequest
): Promise<UpdateAlertResponse> {
  const target = mockAlerts.find((item) => item.alert_id === alertId);
  const updatedFields: string[] = [];
  if (target) {
    if (payload.push_in_app !== undefined) {
      target.push_in_app = payload.push_in_app;
      updatedFields.push('push_in_app');
    }
    if (payload.push_email !== undefined) {
      target.push_email = payload.push_email;
      updatedFields.push('push_email');
    }
    if (payload.status !== undefined) {
      target.status = payload.status;
      updatedFields.push('status');
    }
    if (payload.schedule_rule !== undefined) {
      target.schedule_rule = payload.schedule_rule;
      updatedFields.push('schedule_rule');
    }
  }
  return {
    alert_id: alertId,
    updated_fields: updatedFields,
  };
}

export async function mockDeleteAlert(alertId: string): Promise<DeleteAlertResponse> {
  mockAlerts = mockAlerts.filter((item) => item.alert_id !== alertId);
  return {
    result: 'ok',
  };
}

export async function mockGetMessages(params?: { read_status?: string }): Promise<MessagesResponse> {
  let list = [...mockMessages];
  if (params?.read_status === 'read') {
    list = list.filter((item) => item.read_status);
  }
  if (params?.read_status === 'unread') {
    list = list.filter((item) => !item.read_status);
  }
  const unreadCount = mockMessages.filter((item) => !item.read_status).length;
  return {
    list,
    unread_count: unreadCount,
    total: list.length,
  };
}

export async function mockMarkMessageRead(messageId: string): Promise<MarkMessageReadResponse> {
  const target = mockMessages.find((item) => item.message_id === messageId);
  if (target) {
    target.read_status = true;
  }
  return {
    message_id: messageId,
    read_status: true,
  };
}

export async function mockMarkAllMessagesRead(): Promise<MarkAllMessagesReadResponse> {
  let count = 0;
  mockMessages = mockMessages.map((item) => {
    if (!item.read_status) {
      count += 1;
    }
    return {
      ...item,
      read_status: true,
    };
  });
  return {
    affected_count: count,
  };
}
