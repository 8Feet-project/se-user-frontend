import type {
  AlertItem,
  AlertsResponse,
  AdminDashboardOverviewResponse,
  AdminLogDetail,
  AdminLogExportResponse,
  AdminLogExportStatusResponse,
  AdminLogsResponse,
  AdminModelListResponse,
  AdminModelPermissionRequest,
  AdminModelPermissionResponse,
  AdminModelUsageResponse,
  AdminObjectDistributionResponse,
  AdminPermissionTreeNode,
  AdminUserActivityResponse,
  AdminUserDetail,
  AdminUserListItem,
  AdminUsersResponse,
  AnalyzeTaskRequest,
  AnalyzeTaskResponse,
  AppendReportQaRequest,
  AppendReportQaResponse,
  CancelResearchTaskResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CreateAdminModelRequest,
  CreateAdminModelResponse,
  CreateAdminUserRequest,
  CreateAdminUserResponse,
  CreateAlertRequest,
  CreateAlertResponse,
  CreateFavoriteFolderRequest,
  CreateFavoriteFolderResponse,
  CreateFavoriteItemRequest,
  CreateFavoriteItemResponse,
  CreateReportQaRequest,
  CreateReportQaResponse,
  CreateResearchTaskRequest,
  CreateResearchTaskResponse,
  CrossValidationResultResponse,
  CurrentUserPermissionsResponse,
  DeleteAdminModelResponse,
  DeleteAlertResponse,
  DeleteFavoriteFolderResponse,
  DeleteFavoriteItemResponse,
  DeleteReportShareResponse,
  ExportAdminLogsRequest,
  ExportReportRequest,
  ExportReportResponse,
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
  ModelsAvailableResponse,
  ModelRoutingRecommendationResponse,
  MoveFavoriteItemRequest,
  MoveFavoriteItemResponse,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
  PasswordResetRequest,
  PasswordResetRequestResponse,
  PlatformInitializeRequest,
  PlatformInitializeResponse,
  PlatformInitStatusResponse,
  PublicSharedReportResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ReportCitationDetail,
  ReportCitationsResponse,
  ReportDetail,
  ReportExportStatusResponse,
  ReportListItem,
  ReportQaItem,
  ReportQaListResponse,
  ReportsResponse,
  ReportVersionsResponse,
  ResearchHistoryDetail,
  ResearchHistoryReloadResponse,
  ResearchTaskStatusResponse,
  ResearchTasksResponse,
  ResetAdminUserPasswordResponse,
  RetryAnalysisRequest,
  RetryAnalysisResponse,
  SendEmailCodeRequest,
  SendEmailCodeResponse,
  ShareReportRequest,
  ShareReportResponse,
  SubmitTaskInterventionRequest,
  SubmitTaskInterventionResponse,
  TaskEvent,
  TaskFactsResponse,
  TaskInterventionDetailResponse,
  TestAdminModelConnectionResponse,
  TaskWorkflowResponse,
  TriggerCrossValidationRequest,
  TriggerCrossValidationResponse,
  UpdateAdminModelRequest,
  UpdateAdminModelResponse,
  UpdateAdminUserRequest,
  UpdateAdminUserResponse,
  UpdateAlertRequest,
  UpdateAlertResponse,
  UpdateFavoriteFolderRequest,
  UpdateFavoriteFolderResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  UserProfile,
  VerifyEmailRequest,
  VerifyEmailResponse,
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
  summary: '围绕业务结构、增长质量、竞争格局与风险因素展开。',
  content:
    '# 腾讯控股深度调研报告\n\n## 摘要\n\n报告围绕业务结构、增长质量、竞争格局与风险因素展开，形成可执行的投资与经营观察结论[@tencent_annual]。\n\n## 核心发现\n\n腾讯控股收入结构保持多元，游戏、广告和金融科技业务共同支撑现金流[@industry_analysis]。',
  content_markdown:
    '# 腾讯控股深度调研报告\n\n## 摘要\n\n报告围绕业务结构、增长质量、竞争格局与风险因素展开，形成可执行的投资与经营观察结论[@tencent_annual]。\n\n## 核心发现\n\n腾讯控股收入结构保持多元，游戏、广告和金融科技业务共同支撑现金流[@industry_analysis]。',
  content_brief: '## 摘要\n\n腾讯控股保持多元业务结构，现金流质量较稳定[@tencent_annual]。',
  report_mode: 'full',
  citations: [
    {
      citation_id: 'citation-001',
      index_number: 1,
      cite_key: 'tencent_annual',
      source_title: '腾讯控股年度报告',
      source_url: 'https://example.com/tencent-annual-report',
      source_platform: 'example.com',
      source_type: 'annual_report',
      accessed_at: '2026-03-29T16:00:00+08:00',
      bibtex: '@misc{tencent_annual,\n  title = {腾讯控股年度报告},\n  url = {https://example.com/tencent-annual-report}\n}',
    },
    {
      citation_id: 'citation-002',
      index_number: 2,
      cite_key: 'industry_analysis',
      source_title: 'AkShare 行业竞争格局数据',
      source_url: '',
      source_platform: 'AkShare',
      source_type: 'structured_financial_data',
      accessed_at: '2026-03-29T16:10:00+08:00',
      reproduction_code: "import akshare as ak\nak.stock_industry_cons_em(symbol='锂电池')",
      bibtex: '@misc{industry_analysis,\n  title = {AkShare 行业竞争格局数据},\n  sourceplatform = {AkShare}\n}',
    },
  ],
  references_bibtex:
    '@misc{tencent_annual,\n  title = {腾讯控股年度报告},\n  url = {https://example.com/tencent-annual-report}\n}\n\n@misc{industry_analysis,\n  title = {行业竞争格局研究},\n  url = {https://example.com/industry-analysis}\n}',
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
      cite_key: 'industry_analysis',
      source_title: 'AkShare 行业竞争格局数据',
      source_url: '',
      excerpt: '头部平台在内容分发与广告转化上的优势进一步扩大。',
      published_at: '2026-03-22T12:00:00Z',
      source_platform: 'AkShare',
      source_type: 'structured_financial_data',
      accessed_at: '2026-03-29T16:10:00+08:00',
      reproduction_code: "import akshare as ak\nak.stock_industry_cons_em(symbol='锂电池')",
      bibtex: '@misc{industry_analysis,\n  title = {AkShare 行业竞争格局数据},\n  sourceplatform = {AkShare}\n}',
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
  current_node_id: 'agent-step-3',
  current_node_name: '结构化分析与交叉验证',
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
  current_node: 'agent-step-3',
  waiting_intervention_node_id: 'agent-step-3',
  nodes: [
    {
      node_id: 'agent-step-1',
      node_name: 'Agent 步骤 1',
      node_kind: 'agent_step',
      node_status: 'completed',
      description: '我将拆解调研维度，先通过 web_search 发现候选来源，再分配任务给子代理并行收集证据。',
      summary: '我将拆解调研维度，先通过 web_search 发现候选来源，再分配任务给子代理并行收集证据。',
      updated_at: '2026-04-06T08:56:30Z',
      payload: {
        planning: '我将拆解调研维度，先通过 web_search 发现候选来源，再分配任务给子代理并行收集证据。',
        tools: [
          {
            tool_name: 'web_search',
            display_name: '网页搜索',
            execution_id: 'exec-001',
            status: 'completed',
            status_text: '已搜索到 12 条信息',
            input: { query: '腾讯控股 2026年Q1 财报 营收 利润', max_results: 15 },
            output: { total_results: 12, query: '腾讯控股 2026年Q1 财报 营收 利润' },
            started_at: '2026-04-06T08:55:30Z',
            finished_at: '2026-04-06T08:55:35Z',
            source_node_ids: ['raw-1', 'raw-2'],
          },
          {
            tool_name: 'task',
            display_name: '搜索腾讯财报数据并采集公告原文',
            execution_id: 'exec-002',
            status: 'completed',
            status_text: '已采集腾讯2025年报核心数据：营收6,603亿元，同比增长8%。',
            input: {
              subagent_type: 'deep-search',
              description: '搜索腾讯财报数据并采集公告原文',
              prompt: '请搜索腾讯控股2025年年报和2026年Q1财报的核心财务数据...',
            },
            output: 'Task succeeded. Result: 已采集腾讯2025年报核心数据：营收6,603亿元，同比增长8%。',
            started_at: '2026-04-06T08:55:36Z',
            finished_at: '2026-04-06T08:56:30Z',
            source_node_ids: ['raw-3', 'raw-8'],
            subagent_workflows: [
              {
                subagent_id: 'subagent-deep-search-001',
                subagent_type: 'deep-search',
                description: '搜索腾讯财报数据并采集公告原文',
                nodes: [
                  {
                    node_id: 'sa1-agent-step-1',
                    node_name: 'Agent 步骤 1',
                    node_kind: 'agent_step',
                    node_status: 'completed',
                    description: '开始搜索腾讯2025年年报和2026年Q1季报的关键财务数据。',
                    summary: '开始搜索腾讯2025年年报和2026年Q1季报的关键财务数据。',
                    updated_at: '2026-04-06T08:56:00Z',
                    payload: {
                      planning: '开始搜索腾讯2025年年报和2026年Q1季报的关键财务数据。',
                      tools: [
                        {
                          tool_name: 'web_search',
                          display_name: '网页搜索',
                          status: 'completed',
                          status_text: '已搜索到 8 条信息',
                        },
                        {
                          tool_name: 'web_fetch',
                          display_name: '网页读取',
                          status: 'completed',
                          status_text: '已读取网页',
                        },
                      ],
                      source_node_ids: ['sa1-raw-1', 'sa1-raw-2', 'sa1-raw-3'],
                    },
                  },
                  {
                    node_id: 'sa1-agent-step-2',
                    node_name: 'Agent 步骤 2',
                    node_kind: 'agent_step',
                    node_status: 'completed',
                    description: '提取关键财务指标：2025年全年营收6,603亿元（YoY +8%），Non-IFRS净利润2,220亿元（YoY +19%）。',
                    summary: '提取关键财务指标：2025年全年营收6,603亿元（YoY +8%）。',
                    updated_at: '2026-04-06T08:56:28Z',
                    payload: {
                      planning: '已获取年报和Q1数据，整理核心财务指标。',
                      tools: [
                        {
                          tool_name: 'write_file',
                          display_name: '写入文件',
                          status: 'completed',
                          status_text: '文件已写入',
                        },
                      ],
                      source_node_ids: ['sa1-raw-4'],
                    },
                  },
                ],
              },
            ],
          },
          {
            tool_name: 'task',
            display_name: '搜索腾讯游戏业务与竞争格局',
            execution_id: 'exec-003',
            status: 'completed',
            status_text: '国内游戏收入增长得益于《无畏契约》和《地下城与勇士》系列表现。',
            input: {
              subagent_type: 'deep-search',
              description: '搜索腾讯游戏业务与竞争格局',
              prompt: '请调研腾讯游戏业务的最新表现、市场份额和竞争格局...',
            },
            output: 'Task succeeded. Result: 国内游戏收入增长得益于《无畏契约》和《地下城与勇士》系列表现。',
            started_at: '2026-04-06T08:55:36Z',
            finished_at: '2026-04-06T08:56:25Z',
            source_node_ids: ['raw-4', 'raw-7'],
            subagent_workflows: [
              {
                subagent_id: 'subagent-deep-search-002',
                subagent_type: 'deep-search',
                description: '搜索腾讯游戏业务与竞争格局',
                nodes: [
                  {
                    node_id: 'sa2-agent-step-1',
                    node_name: 'Agent 步骤 1',
                    node_kind: 'agent_step',
                    node_status: 'completed',
                    description: '搜索腾讯游戏业务最新季度表现和市场份额数据。',
                    summary: '搜索腾讯游戏业务最新季度表现和市场份额数据。',
                    updated_at: '2026-04-06T08:56:24Z',
                    payload: {
                      planning: '搜索腾讯游戏业务最新季度表现和市场份额数据。',
                      tools: [
                        {
                          tool_name: 'web_search',
                          display_name: '网页搜索',
                          status: 'completed',
                          status_text: '已搜索到 6 条信息',
                        },
                        {
                          tool_name: 'web_fetch',
                          display_name: '网页读取',
                          status: 'completed',
                          status_text: '已读取网页',
                        },
                      ],
                      source_node_ids: ['sa2-raw-1', 'sa2-raw-2'],
                    },
                  },
                ],
              },
            ],
          },
        ],
        source_node_ids: ['raw-1', 'raw-2', 'raw-3', 'raw-4', 'raw-5', 'raw-6', 'raw-7', 'raw-8'],
      },
    },
    {
      node_id: 'agent-step-2',
      node_name: 'Agent 步骤 2',
      node_kind: 'agent_step',
      node_status: 'completed',
      description: '两个子代理已完成证据采集，我现在整理数据并撰写报告。',
      summary: '两个子代理已完成证据采集，我现在整理数据并撰写报告。',
      updated_at: '2026-04-06T08:58:00Z',
      payload: {
        planning: '两个子代理已完成证据采集，我现在整理数据并撰写报告。',
        tools: [
          {
            tool_name: 'write_file',
            display_name: '写入文件',
            execution_id: 'exec-004',
            status: 'completed',
            status_text: '文件已写入',
            input: { path: '/mnt/user-data/outputs/research_report.md' },
            started_at: '2026-04-06T08:57:00Z',
            finished_at: '2026-04-06T08:58:00Z',
            source_node_ids: ['raw-9', 'raw-10'],
          },
        ],
        source_node_ids: ['raw-9', 'raw-10'],
      },
    },
    {
      node_id: 'agent-step-3',
      node_name: 'Agent 步骤 3',
      node_kind: 'agent_step',
      node_status: 'waiting_user',
      description: '检测到游戏业务收入口径存在差异，需要人工确认是否采用国际财务报告准则数据。',
      summary: '检测到游戏业务收入口径存在差异，需要人工确认是否采用国际财务报告准则数据。',
      updated_at: '2026-04-06T09:04:00Z',
      can_intervene: true,
      payload: {
        planning: '检测到游戏业务收入口径存在差异，需要人工确认是否采用国际财务报告准则数据。',
        tools: [],
        source_node_ids: ['raw-11'],
      },
    },
  ],
  edges: [
    { from: 'agent-step-1', to: 'agent-step-2' },
    { from: 'agent-step-2', to: 'agent-step-3' },
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
  user_id: 101,
  username: 'demo_user',
  nickname: '演示用户',
  email: 'demo@8feet.com',
  phone: null,
  avatar_url: null,
  role: 'user',
  permissions: ['user:profile:read', 'user:profile:write', 'research:task:create', 'report:read'],
  email_verified: true,
  last_login_at: null,
};

const adminPermissionTree: AdminPermissionTreeNode[] = [
  {
    key: 'research',
    label: '调研任务',
    children: [
      { key: 'research:task:read', label: '查看调研任务', checked: true },
      { key: 'research:task:create', label: '创建调研任务', checked: true },
      { key: 'research:task:manage', label: '管理调研任务', checked: false },
    ],
  },
  {
    key: 'admin:models',
    label: '模型管理',
    children: [
      { key: 'admin:model:read', label: '查看模型配置', checked: true },
      { key: 'admin:model:write', label: '编辑模型配置', checked: true },
      { key: 'admin:model:permission', label: '分配模型权限', checked: true },
    ],
  },
  {
    key: 'admin:users',
    label: '用户与权限',
    children: [
      { key: 'admin:user:read', label: '查看用户', checked: true },
      { key: 'admin:user:write', label: '编辑用户', checked: false },
      { key: 'admin:user:reset-password', label: '重置密码', checked: false },
    ],
  },
  {
    key: 'admin:dashboard',
    label: '统计看板',
    children: [
      { key: 'admin:dashboard:read', label: '查看统计看板', checked: true },
      { key: 'admin:logs:read', label: '查看系统日志', checked: true },
      { key: 'admin:logs:export', label: '导出系统日志', checked: true },
    ],
  },
];

let mockAdminModels: AdminModelListResponse['list'] = [
  {
    model_id: 'model-deepseek-v3',
    model_name: 'DeepSeek V3',
    provider: 'DeepSeek',
    api_base_url: 'https://api.deepseek.com/v1',
    context_window: 128000,
    temperature: 0.2,
    max_output_tokens: 8192,
    input_price_1m: 2,
    output_price_1m: 8,
    description: '通用推理模型，适合大多数调研问答与摘要场景。',
    enabled: true,
    connectivity_status: 'connected',
    updated_at: '2026-04-18T08:30:00Z',
    granted_scope_summary: '产品部、研究部可用',
  },
  {
    model_id: 'model-gpt-4.1',
    model_name: 'GPT-4.1',
    provider: 'OpenAI',
    api_base_url: 'https://api.openai.com/v1',
    context_window: 128000,
    temperature: 0.1,
    max_output_tokens: 16384,
    input_price_1m: 5,
    output_price_1m: 15,
    description: '复杂推理与高质量写作场景优先，成本相对更高。',
    enabled: true,
    connectivity_status: 'connected',
    updated_at: '2026-04-19T03:20:00Z',
    granted_scope_summary: '仅管理员可用',
  },
  {
    model_id: 'model-qwen-max',
    model_name: 'Qwen Max',
    provider: 'Alibaba Cloud',
    api_base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    context_window: 32000,
    temperature: 0.3,
    max_output_tokens: 4096,
    input_price_1m: 1.8,
    output_price_1m: 6.5,
    description: '中文理解表现稳定，当前线路波动较大，已停用。',
    enabled: false,
    connectivity_status: 'failed',
    updated_at: '2026-04-17T12:10:00Z',
    granted_scope_summary: '停用中',
  },
];

const mockAdminModelPermissions: Record<string, AdminModelPermissionRequest> = {
  'model-deepseek-v3': { user_ids: [1002], group_ids: ['group-research'] },
  'model-gpt-4.1': { user_ids: [1001], group_ids: ['group-admin'] },
  'model-qwen-max': { user_ids: [], group_ids: [] },
};

let mockAdminUsers: AdminUserListItem[] = [
  {
    user_id: 1001,
    username: 'ops_admin',
    nickname: '运营管理员',
    email: 'ops-admin@8feet.com',
    phone: '13800000001',
    role: 'admin',
    status: 'active',
    created_by_user_id: 9001,
    last_login_at: '2026-04-20T09:20:00Z',
    created_at: '2026-03-01T08:00:00Z',
  },
  {
    user_id: 1002,
    username: 'research_owner',
    nickname: '研究负责人',
    email: 'research-owner@8feet.com',
    phone: '13800000002',
    role: 'admin',
    status: 'active',
    created_by_user_id: 1001,
    last_login_at: '2026-04-20T08:45:00Z',
    created_at: '2026-03-02T08:00:00Z',
  },
  {
    user_id: 1003,
    username: 'auditor',
    nickname: '审计专员',
    email: 'auditor@8feet.com',
    phone: '13800000003',
    role: 'user',
    status: 'disabled',
    created_by_user_id: 1001,
    last_login_at: '2026-04-15T14:18:00Z',
    created_at: '2026-03-06T09:00:00Z',
  },
];

const mockAdminUserDetails: Record<number, AdminUserDetail> = {
  1001: {
    user_id: 1001,
    basic_info: {
      username: 'ops_admin',
      nickname: '运营管理员',
      email: 'ops-admin@8feet.com',
      phone: '13800000001',
      created_by_user_id: 9001,
      created_at: '2026-03-01T08:00:00Z',
      last_login_at: '2026-04-20T09:20:00Z',
    },
    role: 'admin',
    status: 'active',
    permissions: [
      'admin:model:read',
      'admin:model:write',
      'admin:model:permission',
      'admin:user:read',
      'admin:dashboard:read',
      'admin:logs:read',
      'admin:logs:export',
    ],
    permission_tree: adminPermissionTree,
    model_permissions: [
      { model_id: 'model-gpt-4.1', model_name: 'GPT-4.1' },
      { model_id: 'model-deepseek-v3', model_name: 'DeepSeek V3' },
    ],
  },
  1002: {
    user_id: 1002,
    basic_info: {
      username: 'research_owner',
      nickname: '研究负责人',
      email: 'research-owner@8feet.com',
      phone: '13800000002',
      created_by_user_id: 1001,
      created_at: '2026-03-02T08:00:00Z',
      last_login_at: '2026-04-20T08:45:00Z',
    },
    role: 'admin',
    status: 'active',
    permissions: ['research:task:read', 'research:task:create', 'admin:model:read', 'admin:dashboard:read'],
    permission_tree: adminPermissionTree,
    model_permissions: [{ model_id: 'model-deepseek-v3', model_name: 'DeepSeek V3' }],
  },
  1003: {
    user_id: 1003,
    basic_info: {
      username: 'auditor',
      nickname: '审计专员',
      email: 'auditor@8feet.com',
      phone: '13800000003',
      created_by_user_id: 1001,
      created_at: '2026-03-06T09:00:00Z',
      last_login_at: '2026-04-15T14:18:00Z',
    },
    role: 'user',
    status: 'disabled',
    permissions: ['admin:logs:read'],
    permission_tree: adminPermissionTree,
    model_permissions: [],
  },
};

let mockPlatformInitStatus: PlatformInitStatusResponse = {
  initialized: false,
  has_super_admin: false,
};

const mockAdminDashboardOverview: AdminDashboardOverviewResponse = {
  total_research_requests: 1258,
  dau: 186,
  mau: 1240,
  active_users_trend: [
    { date: '04-14', value: 132 },
    { date: '04-15', value: 148 },
    { date: '04-16', value: 156 },
    { date: '04-17', value: 170 },
    { date: '04-18', value: 178 },
    { date: '04-19', value: 181 },
    { date: '04-20', value: 186 },
  ],
};

const mockAdminObjectDistribution: AdminObjectDistributionResponse = {
  company_ratio: 46,
  stock_ratio: 38,
  commodity_ratio: 16,
};

const mockAdminModelUsage: AdminModelUsageResponse = {
  model_usage_ranking: [
    { model_id: 'model-deepseek-v3', model_name: 'DeepSeek V3', provider: 'DeepSeek', call_count: 642 },
    { model_id: 'model-gpt-4.1', model_name: 'GPT-4.1', provider: 'OpenAI', call_count: 401 },
    { model_id: 'model-qwen-max', model_name: 'Qwen Max', provider: 'Alibaba Cloud', call_count: 215 },
  ],
  trend_series: [
    {
      date: '04-18',
      values: [
        { model_id: 'model-deepseek-v3', value: 86 },
        { model_id: 'model-gpt-4.1', value: 58 },
        { model_id: 'model-qwen-max', value: 20 },
      ],
    },
    {
      date: '04-19',
      values: [
        { model_id: 'model-deepseek-v3', value: 95 },
        { model_id: 'model-gpt-4.1', value: 61 },
        { model_id: 'model-qwen-max', value: 17 },
      ],
    },
    {
      date: '04-20',
      values: [
        { model_id: 'model-deepseek-v3', value: 102 },
        { model_id: 'model-gpt-4.1', value: 66 },
        { model_id: 'model-qwen-max', value: 13 },
      ],
    },
  ],
};

const mockAdminUserActivity: AdminUserActivityResponse = {
  activity_series: [
    { date: '04-14', active_users: 132 },
    { date: '04-15', active_users: 148 },
    { date: '04-16', active_users: 156 },
    { date: '04-17', active_users: 170 },
    { date: '04-18', active_users: 178 },
    { date: '04-19', active_users: 181 },
    { date: '04-20', active_users: 186 },
  ],
  retention_summary: [
    { label: '次日留存', value: '68%' },
    { label: '7日留存', value: '44%' },
    { label: '30日留存', value: '29%' },
  ],
};

let mockAdminLogs: AdminLogsResponse = {
  list: [
    {
      log_id: 'log-001',
      level: 'error',
      module: 'research.analysis',
      user_keyword: 'ops_admin',
      object_type: 'stock',
      model_id: 'model-gpt-4.1',
      action_summary: '结构化分析阶段响应解析失败',
      created_at: '2026-04-20T09:15:12Z',
    },
    {
      log_id: 'log-002',
      level: 'warning',
      module: 'research.retrieval',
      user_keyword: 'research_owner',
      object_type: 'company',
      model_id: 'model-deepseek-v3',
      action_summary: '检索源出现低质量结果，已自动降权',
      created_at: '2026-04-20T08:55:41Z',
    },
    {
      log_id: 'log-003',
      level: 'info',
      module: 'auth.permission',
      user_keyword: 'ops_admin',
      model_id: 'model-gpt-4.1',
      action_summary: '完成模型权限变更审批',
      created_at: '2026-04-20T08:31:02Z',
    },
  ],
  total: 3,
};

const mockAdminLogDetails: Record<string, AdminLogDetail> = {
  'log-001': {
    log_id: 'log-001',
    user_action: '发起股票调研任务并进入分析阶段',
    search_intent: '排查毛利率下行与海外扩产兑现节奏',
    agent_trace: [
      { step: '接收任务', detail: '识别对象为宁德时代，设定时间范围 90d。' },
      { step: '多源检索', detail: '采集公告、新闻、行业研报共 146 条候选记录。' },
      { step: '分析编排', detail: '调用 GPT-4.1 进行结构化总结，返回 JSON 字段缺失。' },
    ],
    prompt_raw: '请基于事实列表输出结构化分析结果，字段包含 summary、risks、outlook。',
    response_raw: '{"summary":"...","outlook":"..."}',
    error_stack: 'ValidationError: missing field risks at parser.ts:41:13',
  },
  'log-002': {
    log_id: 'log-002',
    user_action: '公司调研任务数据检索',
    search_intent: '跟踪视频号商业化进展与广告恢复情况',
    agent_trace: [
      { step: '查询改写', detail: '生成 4 个检索子查询。' },
      { step: '来源评分', detail: '识别 2 个论坛源置信度偏低，自动降权。' },
    ],
    prompt_raw: '生成腾讯控股广告业务与视频号商业化相关检索 query。',
    response_raw: '["腾讯 视频号 广告 增长", "腾讯 财报 广告 业务"]',
  },
  'log-003': {
    log_id: 'log-003',
    user_action: '管理员更新模型权限',
    search_intent: '将 GPT-4.1 使用权限授予运营管理员',
    agent_trace: [
      { step: '权限校验', detail: '确认当前账号具备 admin:model:permission 权限。' },
      { step: '写入授权', detail: '更新模型权限映射并写入审计日志。' },
    ],
    prompt_raw: 'N/A',
    response_raw: 'success',
  },
};

const mockAdminLogExports: Record<string, AdminLogExportStatusResponse> = {};

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

export async function mockGetAdminModels(): Promise<AdminModelListResponse> {
  return {
    list: mockAdminModels.map((item) => ({ ...item })),
    total: mockAdminModels.length,
  };
}

export async function mockCreateAdminModel(
  payload: CreateAdminModelRequest
): Promise<CreateAdminModelResponse> {
  const modelId = `model-${Date.now()}`;
  mockAdminModels.unshift({
    model_id: modelId,
    model_name: payload.model_name,
    provider: payload.provider,
    api_base_url: payload.api_base_url,
    context_window: payload.context_window ?? 128000,
    temperature: payload.temperature ?? 0.2,
    max_output_tokens: payload.max_output_tokens,
    input_price_1m: payload.input_price_1m,
    output_price_1m: payload.output_price_1m,
    description: payload.description,
    enabled: payload.enabled,
    connectivity_status: 'unknown',
    updated_at: new Date().toISOString(),
    granted_scope_summary: '未分配',
  });
  mockAdminModelPermissions[modelId] = { user_ids: [], group_ids: [] };
  return {
    model_id: modelId,
    connectivity_status: 'unknown',
  };
}

export async function mockUpdateAdminModel(
  modelId: string,
  payload: UpdateAdminModelRequest
): Promise<UpdateAdminModelResponse> {
  const target = mockAdminModels.find((item) => item.model_id === modelId);
  const updatedFields: string[] = [];
  if (target) {
    if (payload.model_name !== undefined) {
      target.model_name = payload.model_name;
      updatedFields.push('model_name');
    }
    if (payload.provider !== undefined) {
      target.provider = payload.provider;
      updatedFields.push('provider');
    }
    if (payload.api_base_url !== undefined) {
      target.api_base_url = payload.api_base_url;
      updatedFields.push('api_base_url');
    }
    if (payload.context_window !== undefined) {
      target.context_window = payload.context_window;
      updatedFields.push('context_window');
    }
    if (payload.temperature !== undefined) {
      target.temperature = payload.temperature;
      updatedFields.push('temperature');
    }
    if (payload.max_output_tokens !== undefined) {
      target.max_output_tokens = payload.max_output_tokens;
      updatedFields.push('max_output_tokens');
    }
    if (payload.input_price_1m !== undefined) {
      target.input_price_1m = payload.input_price_1m;
      updatedFields.push('input_price_1m');
    }
    if (payload.output_price_1m !== undefined) {
      target.output_price_1m = payload.output_price_1m;
      updatedFields.push('output_price_1m');
    }
    if (payload.description !== undefined) {
      target.description = payload.description;
      updatedFields.push('description');
    }
    if (payload.enabled !== undefined) {
      target.enabled = payload.enabled;
      updatedFields.push('enabled');
    }
    if (payload.api_key !== undefined) {
      updatedFields.push('api_key');
    }
    target.updated_at = new Date().toISOString();
  }
  return {
    model_id: modelId,
    updated_fields: updatedFields,
  };
}

export async function mockDeleteAdminModel(modelId: string): Promise<DeleteAdminModelResponse> {
  mockAdminModels = mockAdminModels.filter((item) => item.model_id !== modelId);
  delete mockAdminModelPermissions[modelId];
  Object.values(mockAdminUserDetails).forEach((detail) => {
    detail.model_permissions = detail.model_permissions.filter((item) => item.model_id !== modelId);
  });
  return { result: 'ok' };
}

export async function mockTestAdminModelConnection(
  modelId: string
): Promise<TestAdminModelConnectionResponse> {
  const target = mockAdminModels.find((item) => item.model_id === modelId);
  const success = target ? target.enabled && target.provider !== 'Alibaba Cloud' : false;
  if (target) {
    target.connectivity_status = success ? 'connected' : 'failed';
    target.updated_at = new Date().toISOString();
  }
  return {
    model_id: modelId,
    success,
    latency_ms: success ? 320 : 1200,
    message: success ? '连接测试成功' : '连接测试失败，请检查密钥或服务状态',
  };
}

export async function mockAssignAdminModelPermissions(
  modelId: string,
  payload: AdminModelPermissionRequest
): Promise<AdminModelPermissionResponse> {
  mockAdminModelPermissions[modelId] = {
    user_ids: [...(payload.user_ids ?? [])],
    group_ids: [...(payload.group_ids ?? [])],
  };

  const target = mockAdminModels.find((item) => item.model_id === modelId);
  if (target) {
    const grantedCount = (payload.user_ids?.length ?? 0) + (payload.group_ids?.length ?? 0);
    target.granted_scope_summary = grantedCount > 0 ? `已分配 ${grantedCount} 个主体` : '未分配';
    target.updated_at = new Date().toISOString();
  }

  return {
    model_id: modelId,
    granted_count: (payload.user_ids?.length ?? 0) + (payload.group_ids?.length ?? 0),
  };
}

export async function mockGetAdminUsers(): Promise<AdminUsersResponse> {
  return {
    list: mockAdminUsers.map((item) => ({ ...item })),
    total: mockAdminUsers.length,
  };
}

export async function mockCreateAdminUser(payload: CreateAdminUserRequest): Promise<CreateAdminUserResponse> {
  const userId = Date.now();
  const creatorUserId = 1001;
  const now = new Date().toISOString();
  mockAdminUsers.unshift({
    user_id: userId,
    username: payload.username,
    nickname: payload.username,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    status: 'pending',
    created_by_user_id: creatorUserId,
    created_at: now,
    last_login_at: undefined,
  });
  mockAdminUserDetails[userId] = {
    user_id: userId,
    basic_info: {
      username: payload.username,
      nickname: payload.username,
      email: payload.email,
      phone: payload.phone,
      created_by_user_id: creatorUserId,
      created_at: now,
    },
    role: payload.role,
    status: 'pending',
    permissions: [...payload.permissions],
    permission_tree: adminPermissionTree,
    model_permissions: [],
  };
  return {
    user_id: userId,
    temp_password: 'Temp@123456',
  };
}

export async function mockGetAdminUserDetail(userId: number): Promise<AdminUserDetail> {
  const target = mockAdminUserDetails[userId];
  if (target) {
    return {
      ...target,
      basic_info: { ...target.basic_info },
      permissions: [...target.permissions],
      permission_tree: target.permission_tree.map((item) => ({ ...item })),
      model_permissions: target.model_permissions.map((item) => ({ ...item })),
    };
  }

  return {
    user_id: userId,
    basic_info: {
      username: String(userId),
      nickname: String(userId),
      email: `${userId}@example.com`,
    },
    role: 'user',
    status: 'pending',
    permissions: [],
    permission_tree: adminPermissionTree,
    model_permissions: [],
  };
}

export async function mockUpdateAdminUser(
  userId: number,
  payload: UpdateAdminUserRequest
): Promise<UpdateAdminUserResponse> {
  const listTarget = mockAdminUsers.find((item) => item.user_id === userId);
  const detailTarget = mockAdminUserDetails[userId];
  const updatedFields: string[] = [];

  if (payload.role !== undefined) {
    listTarget && (listTarget.role = payload.role);
    detailTarget && (detailTarget.role = payload.role);
    updatedFields.push('role');
  }
  if (payload.status !== undefined) {
    listTarget && (listTarget.status = payload.status);
    detailTarget && (detailTarget.status = payload.status);
    updatedFields.push('status');
  }
  if (payload.permissions !== undefined) {
    detailTarget && (detailTarget.permissions = [...payload.permissions]);
    updatedFields.push('permissions');
  }

  return {
    user_id: userId,
    updated_fields: updatedFields,
  };
}

export async function mockResetAdminUserPassword(
  userId: number
): Promise<ResetAdminUserPasswordResponse> {
  return {
    user_id: userId,
    temp_password: 'Reset@123456',
  };
}

export async function mockGetCurrentUserPermissions(): Promise<CurrentUserPermissionsResponse> {
  return {
    user_id: 1001,
    role: 'admin',
    permissions: [
      'admin:model:read',
      'admin:model:write',
      'admin:model:permission',
      'admin:user:read',
      'admin:user:write',
      'admin:dashboard:read',
      'admin:logs:read',
      'admin:logs:export',
    ],
  };
}

export async function mockGetAdminDashboardOverview(): Promise<AdminDashboardOverviewResponse> {
  return {
    ...mockAdminDashboardOverview,
    active_users_trend: mockAdminDashboardOverview.active_users_trend.map((item) => ({ ...item })),
  };
}

export async function mockGetAdminObjectDistribution(): Promise<AdminObjectDistributionResponse> {
  return { ...mockAdminObjectDistribution };
}

export async function mockGetAdminModelUsage(): Promise<AdminModelUsageResponse> {
  return {
    model_usage_ranking: mockAdminModelUsage.model_usage_ranking.map((item) => ({ ...item })),
    trend_series: mockAdminModelUsage.trend_series.map((series) => ({
      ...series,
      values: series.values.map((value) => ({ ...value })),
    })),
  };
}

export async function mockGetAdminUserActivity(): Promise<AdminUserActivityResponse> {
  return {
    activity_series: mockAdminUserActivity.activity_series.map((item) => ({ ...item })),
    retention_summary: mockAdminUserActivity.retention_summary.map((item) => ({ ...item })),
  };
}

export async function mockGetAdminLogs(): Promise<AdminLogsResponse> {
  return {
    list: mockAdminLogs.list.map((item) => ({ ...item })),
    total: mockAdminLogs.total,
  };
}

export async function mockGetAdminLogDetail(logId: string): Promise<AdminLogDetail> {
  const target = mockAdminLogDetails[logId];
  if (target) {
    return {
      ...target,
      agent_trace: target.agent_trace.map((item) => ({ ...item })),
    };
  }
  return {
    log_id: logId,
    user_action: '未知操作',
    search_intent: '无',
    agent_trace: [],
    prompt_raw: '',
    response_raw: '',
  };
}

export async function mockExportAdminLogs(
  payload: ExportAdminLogsRequest
): Promise<AdminLogExportResponse> {
  const exportId = `admin-log-export-${Date.now()}`;
  mockAdminLogExports[exportId] = {
    export_id: exportId,
    status: 'processing',
  };

  setTimeout(() => {
    mockAdminLogExports[exportId] = {
      export_id: exportId,
      status: 'completed',
      download_url: `https://example.com/admin-logs/${exportId}.${payload.format}`,
    };
  }, 500);

  return {
    export_id: exportId,
    status: 'queued',
  };
}

export async function mockGetAdminLogExportStatus(
  exportId: string
): Promise<AdminLogExportStatusResponse> {
  return (
    mockAdminLogExports[exportId] ?? {
      export_id: exportId,
      status: 'failed',
      error_message: 'export_not_found',
    }
  );
}

export async function mockLogin(payload: LoginRequest): Promise<LoginResponse> {
  const nickname =
    payload.login_type === 'email'
      ? payload.email.split('@')[0] || payload.email
      : payload.username;

  return {
    user_id: 101,
    nickname,
    role: 'user',
    permissions: ['auth:login', 'research:task:create', 'research:task:read', 'report:read'],
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 7200,
  };
}

export async function mockRegister(payload: RegisterRequest): Promise<RegisterResponse> {
  if (!payload.email_code.trim()) {
    throw new Error('请填写邮箱验证码');
  }

  return {
    user_id: 102,
    role: 'user',
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    need_initialize: false,
  };
}

export async function mockLogout(payload: LogoutRequest): Promise<LogoutResponse> {
  if (!payload.refresh_token.trim()) {
    throw new Error('缺少刷新令牌');
  }

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
  return { ...mockPlatformInitStatus };
}

export async function mockPlatformInitialize(
  _payload: PlatformInitializeRequest = {}
): Promise<PlatformInitializeResponse> {
  mockPlatformInitStatus = {
    initialized: true,
    has_super_admin: true,
  };
  return {
    initialized: true,
    super_admin_user_id: 9001,
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
    task_id: record?.task_id,
    status: record?.status,
    consensus_points: record?.consensus_points ?? (record?.consensus_summary ? [record.consensus_summary] : []),
    difference_points: record?.difference_points ?? record?.disagreements ?? [],
    model_outputs: modelOutputs.map((item) => ({ ...item })),
    used_models: record?.used_models ?? modelOutputs.map((item) => item.model_id),
    consensus_summary: record?.consensus_summary,
    consensus_score: record?.consensus_score,
    updated_at: record?.updated_at,
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
      node_id: 'agent-step-1',
      node_name: 'Agent 步骤 1',
      node_status: 'completed',
      level: 'success',
      title: '子代理并行搜索完成',
      message: '两个 deep-search 子代理已完成腾讯财报和游戏业务数据采集。',
      metrics: { subagents: 2, tools: 5 },
      timestamp: '2026-04-06T08:56:30Z',
    },
    {
      event_id: 'event-002',
      task_id: 'task-002',
      node_id: 'agent-step-2',
      node_name: 'Agent 步骤 2',
      node_status: 'completed',
      level: 'info',
      title: '报告草稿生成完成',
      message: 'Lead Agent 已整合子代理证据，生成详细和简版两份报告。',
      metrics: { records: 128, high_authority_sources: 41 },
      timestamp: '2026-04-06T08:58:00Z',
    },
    {
      event_id: 'event-003',
      task_id: 'task-002',
      node_id: 'agent-step-3',
      node_name: '结构化分析与交叉验证',
      node_status: 'waiting_user',
      level: 'warning',
      title: '检测到收入口径差异',
      message: '游戏业务收入口径存在差异，等待人工确认数据标准。',
      metrics: { pending_issues: 1 },
      timestamp: '2026-04-06T09:03:10Z',
    },
  ],
};

export async function mockGetTaskEvents(taskId: string): Promise<TaskEvent[]> {
  return [...(mockTaskEventsMap[taskId] ?? [])];
}

const mockTaskInterventionsMap: Record<string, Record<string, TaskInterventionDetailResponse>> = {
  'task-002': {
    'agent-step-3': {
      task_id: 'task-002',
      node_id: 'agent-step-3',
      node_name: '结构化分析与交叉验证',
      intervention_type: 'manual_review',
      status: 'waiting_user',
      reason: '检测到游戏业务收入口径存在差异，需要人工确认是否采用国际财务报告准则数据。',
      suggested_action: '请确认数据口径后继续生成报告。',
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
    mockTaskStatus.current_node_id = 'agent-step-3';
    mockTaskStatus.current_node_name = '报告生成';

    mockTaskWorkflow.waiting_intervention_node_id = undefined;
    mockTaskWorkflow.current_node = 'agent-step-3';
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
