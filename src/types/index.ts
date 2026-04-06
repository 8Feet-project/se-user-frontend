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
  | 'completed'
  | 'failed';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  nickname: string;
  role: UserRole;
  permissions: string[];
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone?: string;
  invite_code?: string;
}

export interface RegisterResponse {
  user_id: string;
  role: UserRole;
  access_token: string;
  refresh_token: string;
  need_initialize: boolean;
}

export interface LogoutRequest {
  refresh_token?: string;
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
  site_name: string;
  default_model_id?: string;
  admin_email: string;
}

export interface PlatformInitializeResponse {
  initialized: boolean;
  super_admin_user_id: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar_url: string;
  role: UserRole;
  permissions: string[];
  email_verified: boolean;
  last_login_at: string;
}

export interface UpdateUserProfileRequest {
  nickname?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

export interface UpdateUserProfileResponse {
  user_id: string;
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
  object_name: string;
  object_type?: ObjectType;
  time_range: string;
  source_authority: string;
  source_types?: string[];
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
  recommended_model_id?: string;
}

export interface ModelRoutingRecommendationResponse {
  recommended_model_id?: string;
  candidate_models: ModelAvailableItem[];
  reason: string;
}

export interface ResearchTaskStatusResponse {
  task_id: string;
  status: ResearchTaskStatus;
  current_stage: string;
  progress: number;
  hint: string;
  error_code?: string;
}

export interface CancelResearchTaskResponse {
  task_id: string;
  status: ResearchTaskStatus;
}

export interface TaskFactsResponse {
  task_id: string;
  fact_count: number;
  sources: Array<{ source_name: string; count: number }>;
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
  compare_dimension?: string[];
}

export interface TriggerCrossValidationResponse {
  task_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result_id?: string;
}

export interface CrossValidationModelResult {
  model_id: string;
  conclusion: string;
  confidence?: number;
  evidence_count?: number;
}

export interface CrossValidationResultResponse {
  task_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  consensus_summary?: string;
  consensus_score?: number;
  disagreements?: string[];
  results: CrossValidationModelResult[];
  updated_at?: string;
}

export interface WorkflowNode {
  node_id: string;
  node_name: string;
  node_status: 'pending' | 'running' | 'completed' | 'failed';
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
}

export interface TaskEvent {
  node_id: string;
  node_name: string;
  node_status: 'pending' | 'running' | 'completed' | 'failed';
  metrics: Record<string, string | number>;
  timestamp: string;
}

export interface TaskInterventionDetailResponse {
  node_id: string;
  node_name: string;
  intervention_type: string;
  current_params: Record<string, string | number | boolean>;
  preview_data: Record<string, string | number | boolean>;
}

export type TaskInterventionAction = 'confirm' | 'update_rule' | 'skip';

export interface SubmitTaskInterventionRequest {
  action: TaskInterventionAction;
  rule_changes?: string | Record<string, string | number | boolean>;
  comment?: string;
}

export interface SubmitTaskInterventionResponse {
  task_id: string;
  node_id: string;
  result: string;
  audit_log_id: string;
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
  source_title: string;
  source_url: string;
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
  content: string;
  citations: ReportCitation[];
  created_at: string;
}
