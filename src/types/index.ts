export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type UserRole = 'super_admin' | 'admin' | 'user';

export type ObjectType = 'company' | 'stock' | 'commodity';

export type ResearchTaskStatus =
  | 'pending'
  | 'searching'
  | 'data_ready'
  | 'analyzing'
  | 'waiting_user'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type WorkflowNodeStatus =
  | 'pending'
  | 'running'
  | 'waiting_user'
  | 'completed'
  | 'failed'
  | 'skipped';

export type TaskEventLevel = 'info' | 'warning' | 'error' | 'success';

export type LoginRequest =
  | {
      login_type: 'username';
      username: string;
      password: string;
      email?: never;
    }
  | {
      login_type: 'email';
      email: string;
      password: string;
      username?: never;
    };

export interface LoginResponse {
  user_id: number;
  nickname: string;
  role: UserRole;
  permissions: string[];
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterRequest {
  username: string;
  nickname: string;
  password: string;
  email: string;
  email_code: string;
  phone?: string;
  invite_code?: string;
}

export interface RegisterResponse {
  user_id: number;
  role: UserRole;
  access_token: string;
  refresh_token: string;
  need_initialize: boolean;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface LogoutResponse {
  result: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface SendEmailCodeRequest {
  email: string;
  scene: 'register' | 'bind' | 'reset_password';
}

export interface SendEmailCodeResponse {
  result: string;
  expire_in: number;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  verified: boolean;
}

export interface PasswordResetRequest {
  username: string;
}

export interface PasswordResetRequestResponse {
  result: string;
}

export interface PasswordResetConfirmRequest {
  reset_token: string;
  new_password: string;
}

export interface PasswordResetConfirmResponse {
  result: string;
}

export interface PlatformInitStatusResponse {
  initialized: boolean;
  has_super_admin: boolean;
}

export interface PlatformInitializeRequest {
  site_name?: string;
  admin_email?: string;
  default_model_id?: string;
}

export interface PlatformInitializeResponse {
  initialized: boolean;
  super_admin_user_id: number | null;
  message?: string;
  site_name?: string;
  default_model_id?: string | null;
  admin_email?: string;
  username?: string;
  mail_sent?: boolean;
  created?: boolean;
  temp_password?: string | null;
}

export interface UserProfile {
  user_id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  permissions: string[];
  email_verified: boolean;
  last_login_at: string | null;
}

export interface UpdateUserProfileRequest {
  nickname?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

export interface UpdateUserProfileResponse {
  user_id: number;
  updated_fields: string[];
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  result: string;
}

export interface CreateResearchTaskRequest {
  title?: string;
  object_name: string;
  object_type?: ObjectType;
  time_range: string;
  source_authority: string;
  source_types?: string[];
  search_params?: Record<string, unknown>;
  llm_config_id?: number;
  model_id?: string;
  multi_model_ids?: string[];
  enable_cross_validation: boolean;
}

export interface CreateResearchTaskResponse {
  task_id: string;
  detected_object_type: ObjectType;
  status: ResearchTaskStatus;
  next_action: string;
}

export interface ResearchTaskListItem {
  task_id: string;
  object_name: string;
  object_type: ObjectType;
  status: ResearchTaskStatus;
  created_at: string;
}

export interface ResearchTasksResponse {
  list: ResearchTaskListItem[];
  total: number;
}

export interface ModelAvailableItem {
  model_id: string;
  model_name: string;
  provider: string;
}

export interface ModelsAvailableResponse {
  models: ModelAvailableItem[];
  recommended_model_id?: string | null;
}

export interface ModelRoutingRecommendationResponse {
  recommended_model_id?: string | null;
  candidate_models: ModelAvailableItem[];
  reason: string;
}

export interface ResearchTaskStatusResponse {
  task_id: string;
  status: ResearchTaskStatus;
  current_stage: string;
  progress: number;
  progress_model?: {
    total_weight: number;
    completed_weight: number;
    percent: number;
    current_stage_index: number;
    stages: Array<{
      key: string;
      label: string;
      weight: number;
      status: WorkflowNodeStatus | ResearchTaskStatus;
      progress_percent: number;
    }>;
  };
  hint: string;
  error_code?: string;
  object_name?: string;
  object_type?: ObjectType;
  current_node_id?: string;
  current_node_name?: string;
  waiting_intervention?: boolean;
  metrics_summary?: Array<{ label: string; value: string | number }>;
  available_actions?: string[];
}

export interface CancelResearchTaskResponse {
  task_id: string;
  status: ResearchTaskStatus;
}

export interface TaskFactsResponse {
  task_id: string;
  fact_count: number;
  sources: Array<{ source_name: string; count: number }>;
  references?: Array<{
    reference_id: string;
    cite_key?: string;
    index_number?: number;
    title: string;
    url?: string;
    source_platform?: string;
    source_type?: string;
    authority_score?: number | string;
    authority_tier?: string;
    summary?: string;
    evidence_path?: string;
    accessed_at?: string;
  }>;
  top_entities: string[];
  dataset_version: string;
}

export interface AnalyzeTaskRequest {
  model_id: string;
  report_mode: 'brief' | 'full';
  prompt_profile?: string;
}

export interface AnalyzeTaskResponse {
  task_id: string;
  status: ResearchTaskStatus;
  report_id?: string;
}

export interface RetryAnalysisRequest {
  model_id?: string;
}

export interface RetryAnalysisResponse {
  task_id: string;
  status: ResearchTaskStatus;
}

export interface TriggerCrossValidationRequest {
  model_ids?: string[];
  multi_model_ids?: string[];
  models?: string[];
  compare_dimension?: string[];
  integrator_model_id?: string;
  integrator_model?: string;
  prompt?: string;
}

export interface TriggerCrossValidationResponse {
  task_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result_id?: string;
  run_id?: string;
}

export interface CrossValidationModelOutput {
  model_id: string;
  summary: string;
}

export interface CrossValidationResultResponse {
  task_id?: string;
  status?: 'queued' | 'running' | 'completed' | 'failed';
  consensus_points: string[];
  difference_points: string[];
  model_outputs: CrossValidationModelOutput[];
  used_models: string[];
  consensus_summary?: string;
  consensus_score?: number;
  updated_at?: string;
}

export interface WorkflowNodeMetric {
  label: string;
  value: string | number;
}

export interface SubAgentWorkflow {
  subagent_id: string;
  subagent_type: string;
  description: string;
  nodes: WorkflowNode[];
}

export interface WorkflowToolCall {
  tool_name: string;
  display_name?: string;
  execution_id?: string | null;
  status?: WorkflowNodeStatus | string;
  status_text?: string;
  input?: unknown;
  output?: unknown;
  hide_payload?: boolean;
  report_id?: string;
  report_url?: string;
  started_at?: string;
  finished_at?: string;
  source_node_ids?: string[];
  subagent_workflows?: SubAgentWorkflow[];
}

export interface WorkflowNodePayload {
  event_type?: string;
  text?: string;
  input?: unknown;
  output?: unknown;
  planning?: string;
  tools?: WorkflowToolCall[];
  source_node_ids?: string[];
  hide_tool_payload?: boolean;
  report_id?: string;
  report_title?: string;
  report_url?: string;
  report_created_at?: string;
  tool_names?: string[];
  report_tool_names?: string[];
}

export interface WorkflowNode {
  node_id: string;
  node_name: string;
  node_type?: string;
  node_kind?: string;
  event_type?: string;
  execution_id?: string;
  paired_node_id?: string | null;
  node_status: WorkflowNodeStatus;
  description?: string;
  summary?: string;
  payload?: WorkflowNodePayload;
  started_at?: string;
  finished_at?: string;
  updated_at?: string;
  duration_ms?: number;
  can_intervene?: boolean;
  intervention_id?: string;
  metrics?: WorkflowNodeMetric[];
}

export interface WorkflowEdge {
  from: string;
  to: string;
}

export interface TaskWorkflowResponse {
  task_id: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  current_node: string;
  waiting_intervention_node_id?: string;
}

export interface TaskEvent {
  event_id?: string;
  task_id?: string;
  node_id: string;
  node_name: string;
  node_kind?: string;
  event_type?: string;
  execution_id?: string;
  node_status: WorkflowNodeStatus;
  level?: TaskEventLevel;
  title?: string;
  message?: string;
  metrics: Record<string, string | number>;
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface TaskRealtimeMessage {
  type: 'connection_ack' | 'task_update' | 'pong' | string;
  task_id: string;
  reason: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface TaskInterventionDetailResponse {
  task_id?: string;
  node_id: string;
  node_name: string;
  intervention_type: string;
  status?: 'waiting_user' | 'resolved' | 'expired';
  reason?: string;
  suggested_action?: string;
  current_params: Record<string, string | number | boolean>;
  preview_data: Record<string, unknown>;
}

export type TaskInterventionAction = 'confirm_continue' | 'update_rules' | 'skip_intervention';

export interface SubmitTaskInterventionRequest {
  action: TaskInterventionAction;
  rule_changes?: string | Record<string, unknown>;
  comment?: string;
}

export interface SubmitTaskInterventionResponse {
  task_id: string;
  node_id: string;
  result: string;
  audit_log_id: string;
  task_status?: ResearchTaskStatus;
  node_status?: WorkflowNodeStatus;
}

export interface HistoryTaskItem {
  task_id: string;
  object_name: string;
  object_type: ObjectType;
  report_id?: string;
  status: ResearchTaskStatus;
  created_at: string;
}

export interface ResearchHistoryResponse {
  list: HistoryTaskItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ResearchHistoryDetail {
  task_id: string;
  object_name: string;
  object_type: ObjectType;
  search_params: Record<string, string | number | boolean>;
  fact_dataset: string;
  report_id?: string;
  status: ResearchTaskStatus;
  created_at: string;
}

export interface ResearchHistoryReloadResponse {
  task_id: string;
  report_id?: string;
  redirect_url: string;
}

export interface FavoriteFolder {
  folder_id: string;
  folder_name: string;
  parent_id?: string;
}

export interface FavoriteFoldersResponse {
  folders: FavoriteFolder[];
  default_folder_id?: string;
}

export interface CreateFavoriteFolderRequest {
  folder_name: string;
  parent_id?: string;
}

export interface CreateFavoriteFolderResponse {
  folder_id: string;
  folder_name: string;
}

export interface UpdateFavoriteFolderRequest {
  folder_name?: string;
  parent_id?: string;
}

export interface UpdateFavoriteFolderResponse {
  folder_id: string;
  updated_fields: string[];
}

export interface DeleteFavoriteFolderResponse {
  result: string;
}

export type FavoriteType = 'insight' | 'report' | 'model';

export interface FavoriteItem {
  favorite_id: string;
  favorite_type: FavoriteType;
  target_id: string;
  folder_id?: string;
  remark?: string;
}

export interface FavoriteItemsResponse {
  list: FavoriteItem[];
  total: number;
}

export interface CreateFavoriteItemRequest {
  favorite_type: FavoriteType;
  target_id: string;
  folder_id?: string;
  remark?: string;
}

export interface CreateFavoriteItemResponse {
  favorite_id: string;
  favorite_status: string;
}

export interface MoveFavoriteItemRequest {
  target_folder_id: string;
}

export interface MoveFavoriteItemResponse {
  favorite_id: string;
  target_folder_id: string;
}

export interface DeleteFavoriteItemResponse {
  result: string;
  target_id: string;
}

export type AlertStatus = 'enabled' | 'disabled';

export interface AlertItem {
  alert_id: string;
  object_name: string;
  object_type: ObjectType;
  push_in_app: boolean;
  push_email: boolean;
  schedule_rule: string;
  status: AlertStatus;
}

export interface AlertsResponse {
  list: AlertItem[];
  total: number;
}

export interface CreateAlertRequest {
  object_name: string;
  object_type: ObjectType;
  push_in_app: boolean;
  push_email: boolean;
  schedule_rule: string;
}

export interface CreateAlertResponse {
  alert_id: string;
  status: AlertStatus;
}

export interface UpdateAlertRequest {
  push_in_app?: boolean;
  push_email?: boolean;
  status?: AlertStatus;
  schedule_rule?: string;
}

export interface UpdateAlertResponse {
  alert_id: string;
  updated_fields: string[];
}

export interface DeleteAlertResponse {
  result: string;
}

export interface MessageItem {
  message_id: string;
  title: string;
  content: string;
  read_status: boolean;
  created_at: string;
}

export interface MessagesResponse {
  list: MessageItem[];
  unread_count: number;
  total: number;
}

export interface MarkMessageReadResponse {
  message_id: string;
  read_status: boolean;
}

export interface MarkAllMessagesReadResponse {
  affected_count: number;
}

export interface ReportsResponse {
  list: ReportListItem[];
  total: number;
  page?: number;
  page_size?: number;
}

export interface ReportListItem {
  report_id: string;
  task_id: string;
  title: string;
  summary?: string;
  created_at: string;
  updated_at?: string;
}

export interface ReportCitation {
  citation_id: string;
  index_number?: number;
  cite_key?: string;
  source_title: string;
  source_url: string;
  source_type?: string;
  source_platform?: string;
  accessed_at?: string;
  bibtex?: string;
}

export interface ReportCitationsResponse {
  report_id: string;
  list: ReportCitation[];
  total: number;
}

export interface ReportCitationDetail extends ReportCitation {
  report_id: string;
  excerpt?: string;
  published_at?: string;
  source_type?: string;
}

export interface ReportVersionsResponse {
  report_id: string;
  current_version_id?: string;
  versions: ReportVersionItem[];
}

export interface ReportVersionItem {
  version_id: string;
  version_no: number;
  title: string;
  created_at: string;
  created_by?: string;
  change_note?: string;
}

export interface ExportReportRequest {
  format: 'pdf' | 'docx' | 'md' | 'html';
  include_citations?: boolean;
  report_mode?: 'brief' | 'full';
}

export interface ExportReportResponse {
  export_id: string;
  report_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

export interface ReportExportStatusResponse {
  export_id: string;
  report_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  expires_at?: string;
  error_message?: string;
}

export interface ShareReportRequest {
  expires_in_hours?: number;
  password?: string;
  allow_download?: boolean;
}

export interface ShareReportResponse {
  share_id: string;
  report_id: string;
  share_url: string;
  expires_at?: string;
}

export interface DeleteReportShareResponse {
  result: string;
  share_id: string;
}

export interface PublicSharedReportResponse {
  share_id: string;
  report: ReportDetail;
  allow_download: boolean;
  expires_at?: string;
}

export interface CreateReportQaRequest {
  question: string;
}

export interface CreateReportQaResponse {
  report_id: string;
  qa: ReportQaItem;
}

export interface ReportQaListResponse {
  report_id: string;
  list: ReportQaItem[];
  total: number;
}

export interface AppendReportQaRequest {
  append_text: string;
}

export interface AppendReportQaResponse {
  report_id: string;
  qa: ReportQaItem;
}

export interface ReportQaItem {
  qa_id: string;
  question: string;
  answer: string;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ReportDetail {
  report_id: string;
  task_id: string;
  title: string;
  summary?: string;
  content: string;
  content_markdown?: string;
  content_brief?: string;
  report_mode?: 'brief' | 'full';
  citations: ReportCitation[];
  references_bibtex?: string;
  created_at: string;
}

export type AdminUserStatus = 'active' | 'disabled' | 'pending';
export type AdminModelConnectivityStatus = 'connected' | 'failed' | 'unknown' | 'testing';
export type AdminLogLevel = 'debug' | 'info' | 'warning' | 'error';
export type DashboardTimeScope = 'today' | '7d' | '30d' | 'custom';

export interface AdminModelItem {
  model_id: string;
  model_name: string;
  provider: string;
  api_base_url: string;
  context_window: number;
  temperature: number;
  max_output_tokens?: number;
  input_price_1m?: number;
  output_price_1m?: number;
  description?: string;
  enabled: boolean;
  connectivity_status: AdminModelConnectivityStatus;
  updated_at: string;
  granted_scope_summary?: string;
}

export interface AdminModelListResponse {
  list: AdminModelItem[];
  total: number;
}

export interface CreateAdminModelRequest {
  model_name: string;
  provider: string;
  api_base_url: string;
  api_key: string;
  context_window?: number;
  temperature?: number;
  max_output_tokens?: number;
  input_price_1m: number;
  output_price_1m: number;
  description?: string;
  enabled: boolean;
}

export interface CreateAdminModelResponse {
  model_id: string;
  connectivity_status: AdminModelConnectivityStatus;
}

export interface UpdateAdminModelRequest {
  model_name?: string;
  provider?: string;
  api_base_url?: string;
  api_key?: string;
  context_window?: number;
  temperature?: number;
  max_output_tokens?: number;
  input_price_1m?: number;
  output_price_1m?: number;
  description?: string;
  enabled?: boolean;
}

export interface UpdateAdminModelResponse {
  model_id: string;
  updated_fields: string[];
}

export interface DeleteAdminModelResponse {
  result: string;
}

export interface TestAdminModelConnectionResponse {
  model_id: string;
  success: boolean;
  latency_ms: number;
  message: string;
}

export interface AdminModelPermissionGrant {
  user_ids?: number[];
  group_ids?: string[];
}

export interface AdminModelPermissionRequest extends AdminModelPermissionGrant {}

export interface AdminModelPermissionResponse {
  model_id: string;
  granted_count: number;
}

export interface AdminPermissionTreeNode {
  key: string;
  label: string;
  checked?: boolean;
  children?: AdminPermissionTreeNode[];
}

export interface AdminUserListItem {
  user_id: number;
  username: string;
  nickname: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: AdminUserStatus;
  created_by_user_id?: number;
  last_login_at?: string;
  created_at: string;
}

export interface AdminUsersResponse {
  list: AdminUserListItem[];
  total: number;
}

export interface CreateAdminUserRequest {
  username: string;
  email: string;
  phone?: string;
  role: Exclude<UserRole, 'super_admin'>;
  permissions: string[];
}

export interface CreateAdminUserResponse {
  user_id: number;
  temp_password: string;
}

export interface AdminUserDetail {
  user_id: number;
  basic_info: {
    username: string;
    nickname: string;
    email: string;
    phone?: string;
    created_by_user_id?: number;
    created_at?: string;
    last_login_at?: string;
  };
  role: UserRole;
  status: AdminUserStatus;
  permissions: string[];
  permission_tree: AdminPermissionTreeNode[];
  model_permissions: Array<{ model_id: string; model_name: string }>;
}

export interface UpdateAdminUserRequest {
  role?: UserRole;
  permissions?: string[];
  status?: AdminUserStatus;
}

export interface UpdateAdminUserResponse {
  user_id: number;
  updated_fields: string[];
}

export interface ResetAdminUserPasswordResponse {
  user_id: number;
  temp_password: string;
}

export interface CurrentUserPermissionsResponse {
  user_id?: number;
  role: UserRole;
  permissions: string[];
}

export interface AdminDashboardOverviewResponse {
  total_research_requests: number;
  dau: number;
  mau: number;
  active_users_trend: Array<{ date: string; value: number }>;
  raw?: unknown;
}

export interface AdminObjectDistributionResponse {
  company_ratio: number;
  stock_ratio: number;
  commodity_ratio: number;
}

export interface AdminModelUsageResponse {
  model_usage_ranking: Array<{
    model_id: string;
    model_name: string;
    provider: string;
    call_count: number;
  }>;
  trend_series: Array<{
    date: string;
    values: Array<{ model_id: string; value: number }>;
  }>;
}

export interface AdminUserActivityResponse {
  activity_series: Array<{ date: string; active_users: number }>;
  retention_summary: Array<{ label: string; value: string }>;
}

export interface AdminLogListItem {
  log_id: string;
  level: AdminLogLevel;
  module: string;
  user_keyword: string;
  object_type?: ObjectType;
  model_id?: string;
  action_summary: string;
  created_at: string;
}

export interface AdminLogsResponse {
  list: AdminLogListItem[];
  total: number;
}

export interface AdminLogDetail {
  log_id: string;
  user_action: string;
  search_intent: string;
  agent_trace: Array<{ step: string; detail: string }>;
  prompt_raw: string;
  response_raw: string;
  error_stack?: string;
}

export interface ExportAdminLogsRequest {
  level?: AdminLogLevel;
  start_time: string;
  end_time: string;
  object_type?: ObjectType;
  module?: string;
  format: 'csv' | 'xlsx';
}

export interface AdminLogExportResponse {
  export_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

export interface AdminLogExportStatusResponse {
  export_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  error_message?: string;
}
