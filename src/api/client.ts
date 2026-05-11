import {
  mockAssignAdminModelPermissions,
  mockChangeCurrentUserPassword,
  mockCreateAdminModel,
  mockCreateAdminUser,
  mockCreateAlert,
  mockCreateFavoriteFolder,
  mockCreateFavoriteItem,
  mockCreateResearchTask,
  mockDeleteAdminModel,
  mockExportAdminLogs,
  mockGetAdminDashboardOverview,
  mockGetAdminLogDetail,
  mockGetAdminLogExportStatus,
  mockGetAdminLogs,
  mockGetAdminModels,
  mockGetAdminModelUsage,
  mockGetAdminObjectDistribution,
  mockGetAdminUserActivity,
  mockGetAdminUserDetail,
  mockGetAdminUsers,
  mockGetCurrentUserPermissions,
  mockGetModelRoutingRecommendation,
  mockGetModelsAvailable,
  mockGetResearchTasks,
  mockCancelResearchTask,
  mockGetTaskFacts,
  mockAnalyzeTask,
  mockTriggerCrossValidation,
  mockGetCrossValidationResult,
  mockRetryAnalysis,
  mockGetTaskEvents,
  mockGetTaskIntervention,
  mockDeleteAlert,
  mockDeleteFavoriteFolder,
  mockDeleteFavoriteItem,
  mockGetAlerts,
  mockGetFavoriteFolders,
  mockGetFavoriteItems,
  mockGetMessages,
  mockGetCurrentUserProfile,
  mockUpdateCurrentUserProfile,
  mockHistoryTasks,
  mockLogin,
  mockLogout,
  mockMarkAllMessagesRead,
  mockMarkMessageRead,
  mockPasswordResetConfirm,
  mockPasswordResetRequest,
  mockPlatformInitialize,
  mockGetPlatformInitStatus,
  mockRefreshToken,
  mockRegister,
  mockReloadResearchHistory,
  mockMoveFavoriteItem,
  mockGetReports,
  mockGetReportCitations,
  mockGetReportCitationDetail,
  mockGetReportVersions,
  mockExportReport,
  mockGetReportExportStatus,
  mockShareReport,
  mockDeleteReportShare,
  mockGetPublicSharedReport,
  mockCreateReportQa,
  mockGetReportQa,
  mockAppendReportQa,
  mockReportDetail,
  mockGetResearchHistoryDetail,
  mockResetAdminUserPassword,
  mockSendEmailCode,
  mockTaskStatus,
  mockTaskWorkflow,
  mockTestAdminModelConnection,
  mockUpdateAdminModel,
  mockUpdateAdminUser,
  mockUpdateAlert,
  mockUpdateFavoriteFolder,
  mockSubmitTaskIntervention,
  mockVerifyEmail,
} from './mock';
import { request } from './http';
import { clearAuthSession } from '../lib/auth';
import type {
  AdminDashboardOverviewResponse,
  AdminLogDetail,
  AdminLogExportResponse,
  AdminLogExportStatusResponse,
  AdminLogsResponse,
  AdminModelItem,
  AdminModelListResponse,
  AdminModelPermissionRequest,
  AdminModelPermissionResponse,
  AdminModelUsageResponse,
  AdminObjectDistributionResponse,
  AdminUserActivityResponse,
  AdminUserDetail,
  AdminUserListItem,
  AdminUsersResponse,
  AnalyzeTaskRequest,
  AnalyzeTaskResponse,
  AlertsResponse,
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
  MessagesResponse,
  ModelRoutingRecommendationResponse,
  ModelsAvailableResponse,
  MoveFavoriteItemRequest,
  MoveFavoriteItemResponse,
  ObjectType,
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
  ReportQaListResponse,
  ReportsResponse,
  ReportVersionsResponse,
  ResearchHistoryDetail,
  ResearchHistoryReloadResponse,
  ResearchHistoryResponse,
  ResearchTaskListItem,
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
  TaskWorkflowResponse,
  TestAdminModelConnectionResponse,
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

const useMock = (import.meta.env.VITE_USE_MOCK ?? 'false') === 'true';

type StringLikeId = string | number;

function toStringId(value: StringLikeId | null | undefined): string {
  return value == null ? '' : String(value);
}

function normalizeObjectType(value: string | undefined): ObjectType | undefined {
  if (!value) {
    return undefined;
  }
  switch (value.toLowerCase()) {
    case 'company':
      return 'company';
    case 'stock':
      return 'stock';
    case 'product':
    case 'commodity':
      return 'commodity';
    default:
      return undefined;
  }
}

function buildResearchTaskPayload(payload: CreateResearchTaskRequest) {
  return {
    title: payload.title,
    object_name: payload.object_name,
    object_type: payload.object_type,
    time_range: payload.time_range,
    source_authority: payload.source_authority,
    source_types: payload.source_types,
    search_params: payload.search_params,
    llm_config_id: payload.llm_config_id,
    model_id: payload.model_id,
    multi_model_ids: payload.multi_model_ids,
    enable_cross_validation: payload.enable_cross_validation,
  };
}

type BackendResearchTaskListItem = Partial<ResearchTaskListItem> & {
  id?: StringLikeId;
  task_id?: StringLikeId;
  object_type?: string;
};

function mapResearchTaskListItem(item: BackendResearchTaskListItem): ResearchTaskListItem {
  return {
    task_id: toStringId(item.task_id ?? item.id),
    object_name: item.object_name ?? '',
    object_type: normalizeObjectType(item.object_type) ?? 'company',
    status: item.status ?? 'pending',
    created_at: item.created_at ?? '',
  };
}

type BackendCrossValidationResult = Omit<Partial<CrossValidationResultResponse>, 'model_outputs' | 'used_models'> & {
  difference_points?: string[];
  disagreements?: string[];
  model_outputs?: Array<{
    model_id?: StringLikeId;
    summary?: string;
    conclusion?: string;
  }>;
  results?: Array<{
    model_id?: StringLikeId;
    model?: StringLikeId;
    summary?: string;
    conclusion?: string;
  }>;
  used_models?: Array<StringLikeId>;
};

function mapCrossValidationResult(
  payload: BackendCrossValidationResult
): CrossValidationResultResponse {
  const outputs =
    payload.model_outputs?.map((item) => ({
      model_id: toStringId(item.model_id),
      summary: item.summary ?? item.conclusion ?? '',
    })) ??
    payload.results?.map((item) => ({
      model_id: toStringId(item.model_id ?? item.model),
      summary: item.summary ?? item.conclusion ?? '',
    })) ??
    [];

  return {
    task_id: payload.task_id ? toStringId(payload.task_id) : undefined,
    status: payload.status,
    consensus_points: payload.consensus_points ?? [],
    difference_points: payload.difference_points ?? payload.disagreements ?? [],
    model_outputs: outputs,
    used_models: payload.used_models?.map((item) => toStringId(item)) ?? outputs.map((item) => item.model_id),
    consensus_summary: payload.consensus_summary,
    consensus_score: payload.consensus_score,
    updated_at: payload.updated_at,
  };
}

type BackendAdminModelItem = Partial<AdminModelItem> & {
  id?: number | string;
  name?: string;
  api_endpoint?: string;
  is_enabled?: boolean;
  is_online?: boolean;
  pricing?: {
    input?: number;
    output?: number;
  };
  params?: Record<string, unknown>;
};

function mapAdminModel(item: BackendAdminModelItem): AdminModelItem {
  const enabled = item.enabled ?? item.is_enabled ?? false;
  const online = item.is_online ?? enabled;
  return {
    model_id: String(item.model_id ?? item.id ?? ''),
    model_name: item.model_name ?? item.name ?? '',
    provider: item.provider ?? '',
    api_base_url: item.api_base_url ?? item.api_endpoint ?? '',
    context_window: item.context_window ?? 4096,
    temperature: item.temperature ?? Number(item.params?.temperature ?? 0.2),
    max_output_tokens: item.max_output_tokens ?? 2048,
    input_price_1m: item.input_price_1m ?? item.pricing?.input ?? 0,
    output_price_1m: item.output_price_1m ?? item.pricing?.output ?? 0,
    description: item.description,
    enabled,
    connectivity_status: item.connectivity_status ?? (online ? 'connected' : 'failed'),
    updated_at: item.updated_at ?? '',
    granted_scope_summary: item.granted_scope_summary,
  };
}

type BackendAdminUserListItem = Omit<AdminUserListItem, 'user_id'> & {
  user_id: number | string;
};

type BackendAdminUserDetail = Omit<AdminUserDetail, 'user_id'> & {
  user_id: number | string;
};

type BackendCreateAdminUserResponse = Omit<CreateAdminUserResponse, 'user_id'> & {
  user_id: number | string;
};

function mapAdminUser(item: BackendAdminUserListItem): AdminUserListItem {
  return {
    ...item,
    user_id: Number(item.user_id),
  };
}

function mapAdminUserDetail(item: BackendAdminUserDetail): AdminUserDetail {
  return {
    ...item,
    user_id: Number(item.user_id),
  };
}

function toBackendAdminModelPayload(payload: CreateAdminModelRequest | UpdateAdminModelRequest) {
  return {
    name: payload.model_name,
    model_name: payload.model_name,
    provider_model_id: payload.model_name,
    provider: payload.provider,
    api_endpoint: payload.api_base_url,
    api_base_url: payload.api_base_url,
    api_key: payload.api_key,
    input_price_1m: payload.input_price_1m,
    output_price_1m: payload.output_price_1m,
    description: payload.description,
    is_enabled: payload.enabled,
    enabled: payload.enabled,
  };
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  if (useMock) {
    return mockLogin(payload);
  }
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  if (useMock) {
    return mockRegister(payload);
  }
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logout(payload: LogoutRequest): Promise<LogoutResponse> {
  if (useMock) {
    return mockLogout(payload);
  }
  return request<LogoutResponse>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logoutCurrentSession(): Promise<void> {
  const refreshToken = localStorage.getItem('refresh_token');

  try {
    if (refreshToken) {
      await logout({ refresh_token: refreshToken });
    }
  } finally {
    clearAuthSession();
  }
}

export async function refreshToken(
  payload: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  if (useMock) {
    return mockRefreshToken(payload);
  }
  return request<RefreshTokenResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendEmailCode(
  payload: SendEmailCodeRequest
): Promise<SendEmailCodeResponse> {
  if (useMock) {
    return mockSendEmailCode(payload);
  }
  return request<SendEmailCodeResponse>('/auth/email/send-code', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(payload: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  if (useMock) {
    return mockVerifyEmail(payload);
  }
  return request<VerifyEmailResponse>('/auth/email/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function passwordResetRequest(
  payload: PasswordResetRequest
): Promise<PasswordResetRequestResponse> {
  if (useMock) {
    return mockPasswordResetRequest(payload);
  }
  return request<PasswordResetRequestResponse>('/auth/password/reset-request', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function passwordResetConfirm(
  payload: PasswordResetConfirmRequest
): Promise<PasswordResetConfirmResponse> {
  if (useMock) {
    return mockPasswordResetConfirm(payload);
  }
  return request<PasswordResetConfirmResponse>('/auth/password/reset-confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPlatformInitStatus(): Promise<PlatformInitStatusResponse> {
  if (useMock) {
    return mockGetPlatformInitStatus();
  }
  return request<PlatformInitStatusResponse>('/platform/init-status');
}

export async function platformInitialize(
  payload: PlatformInitializeRequest = {}
): Promise<PlatformInitializeResponse> {
  if (useMock) {
    return mockPlatformInitialize(payload);
  }
  return request<PlatformInitializeResponse>('/platform/initialize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
  if (useMock) {
    return mockGetCurrentUserProfile();
  }
  return request<UserProfile>('/users/me');
}

export async function updateCurrentUserProfile(
  payload: UpdateUserProfileRequest
): Promise<UpdateUserProfileResponse> {
  if (useMock) {
    return mockUpdateCurrentUserProfile(payload);
  }
  return request<UpdateUserProfileResponse>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function changeCurrentUserPassword(
  payload: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  if (useMock) {
    return mockChangeCurrentUserPassword(payload);
  }
  return request<ChangePasswordResponse>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function createResearchTask(
  payload: CreateResearchTaskRequest
): Promise<CreateResearchTaskResponse> {
  if (useMock) {
    return mockCreateResearchTask(payload);
  }
  return request<CreateResearchTaskResponse>('/research/tasks', {
    method: 'POST',
    body: JSON.stringify(buildResearchTaskPayload(payload)),
  });
}

export async function getModelRoutingRecommendation(params: {
  object_type?: string;
  research_category?: string;
} = {}): Promise<ModelRoutingRecommendationResponse> {
  if (useMock) {
    return mockGetModelRoutingRecommendation(params);
  }
  return request<ModelRoutingRecommendationResponse>('/model-routing/recommendation', {}, params);
}

export async function getModelsAvailable(params: { scene?: string } = {}): Promise<ModelsAvailableResponse> {
  if (useMock) {
    return mockGetModelsAvailable();
  }
  return request<ModelsAvailableResponse>('/models/available', {}, params);
}

export async function getResearchTasks(params: {
  status?: string;
  object_type?: string;
  keyword?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<ResearchTasksResponse> {
  if (useMock) {
    return mockGetResearchTasks();
  }
  const response = await request<{
    list: BackendResearchTaskListItem[];
    total: number;
  }>('/research/tasks', {}, params);
  return {
    list: response.list.map(mapResearchTaskListItem),
    total: response.total,
  };
}

export async function getResearchTaskStatus(taskId: string): Promise<ResearchTaskStatusResponse> {
  if (useMock) {
    return { ...mockTaskStatus, task_id: taskId || mockTaskStatus.task_id };
  }
  return request<ResearchTaskStatusResponse>(`/research/tasks/${taskId}/status`);
}

export async function cancelResearchTask(taskId: string): Promise<CancelResearchTaskResponse> {
  if (useMock) {
    return mockCancelResearchTask(taskId);
  }
  return request<CancelResearchTaskResponse>(`/research/tasks/${taskId}/cancel`, {
    method: 'POST',
  });
}

export async function getResearchTaskWorkflow(taskId: string): Promise<TaskWorkflowResponse> {
  if (useMock) {
    return { ...mockTaskWorkflow, task_id: taskId || mockTaskWorkflow.task_id };
  }
  return request<TaskWorkflowResponse>(`/research/tasks/${taskId}/workflow`);
}

export async function getTaskFacts(taskId: string): Promise<TaskFactsResponse> {
  if (useMock) {
    return mockGetTaskFacts(taskId);
  }
  return request<TaskFactsResponse>(`/research/tasks/${taskId}/facts`);
}

export async function analyzeTask(
  taskId: string,
  payload: AnalyzeTaskRequest
): Promise<AnalyzeTaskResponse> {
  if (useMock) {
    return mockAnalyzeTask(taskId, payload);
  }
  return request<AnalyzeTaskResponse>(`/research/tasks/${taskId}/analyze`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function retryAnalysis(
  taskId: string,
  payload: RetryAnalysisRequest = {}
): Promise<RetryAnalysisResponse> {
  if (useMock) {
    return mockRetryAnalysis(taskId, payload);
  }
  return request<RetryAnalysisResponse>(`/research/tasks/${taskId}/retry-analysis`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function triggerCrossValidation(
  taskId: string,
  payload: TriggerCrossValidationRequest = {}
): Promise<TriggerCrossValidationResponse> {
  if (useMock) {
    return mockTriggerCrossValidation(taskId, payload);
  }
  const response = await request<TriggerCrossValidationResponse>(`/research/tasks/${taskId}/cross-validation`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return {
    ...response,
    task_id: toStringId(response.task_id),
    result_id: response.result_id ?? response.run_id,
    run_id: response.run_id ?? response.result_id,
  };
}

export async function getCrossValidationResult(
  taskId: string
): Promise<CrossValidationResultResponse> {
  if (useMock) {
    return mockGetCrossValidationResult(taskId);
  }
  const response = await request<BackendCrossValidationResult>(
    `/research/tasks/${taskId}/cross-validation/result`
  );
  return mapCrossValidationResult(response);
}

export async function getTaskEvents(taskId: string): Promise<TaskEvent[]> {
  if (useMock) {
    return mockGetTaskEvents(taskId);
  }
  return request<TaskEvent[]>(`/research/tasks/${taskId}/events`);
}

export function buildResearchTaskRealtimeUrl(taskId: string): string | null {
  if (useMock || typeof window === 'undefined' || !taskId) {
    return null;
  }

  const token = localStorage.getItem('access_token');
  if (!token) {
    return null;
  }

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';
  const baseUrl = new URL(apiBaseUrl || window.location.origin, window.location.origin);
  baseUrl.protocol = baseUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  baseUrl.pathname = baseUrl.pathname.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  baseUrl.search = '';
  baseUrl.hash = '';

  const pathPrefix = baseUrl.pathname === '/' ? '' : baseUrl.pathname;
  const params = new URLSearchParams({ token });
  return `${baseUrl.origin}${pathPrefix}/ws/research/tasks/${encodeURIComponent(taskId)}/?${params.toString()}`;
}

export async function getTaskIntervention(
  taskId: string,
  nodeId: string
): Promise<TaskInterventionDetailResponse> {
  if (useMock) {
    return mockGetTaskIntervention(taskId, nodeId);
  }
  return request<TaskInterventionDetailResponse>(`/research/tasks/${taskId}/interventions/${nodeId}`);
}

export async function submitTaskIntervention(
  taskId: string,
  nodeId: string,
  payload: SubmitTaskInterventionRequest
): Promise<SubmitTaskInterventionResponse> {
  if (useMock) {
    return mockSubmitTaskIntervention(taskId, nodeId, payload);
  }
  return request<SubmitTaskInterventionResponse>(`/research/tasks/${taskId}/interventions/${nodeId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getResearchHistory(params: {
  page: number;
  page_size: number;
  object_type?: string;
  keyword?: string;
}): Promise<ResearchHistoryResponse> {
  if (useMock) {
    const list = [...mockHistoryTasks] as HistoryTaskItem[];
    return {
      list,
      total: list.length,
      page: params.page,
      page_size: params.page_size,
    };
  }
  return request<ResearchHistoryResponse>('/research/history/', {}, params);
}

export async function getResearchHistoryDetail(taskId: string): Promise<ResearchHistoryDetail> {
  if (useMock) {
    return mockGetResearchHistoryDetail(taskId);
  }
  return request<ResearchHistoryDetail>(`/research/history/${taskId}`);
}

export async function reloadResearchHistory(
  taskId: string
): Promise<ResearchHistoryReloadResponse> {
  if (useMock) {
    return mockReloadResearchHistory(taskId);
  }
  return request<ResearchHistoryReloadResponse>(`/research/history/${taskId}/reload`, {
    method: 'POST',
  });
}

export async function getReportDetail(
  reportId: string,
  reportMode: 'brief' | 'full' = 'full'
): Promise<ReportDetail> {
  if (useMock) {
    return {
      ...mockReportDetail,
      report_id: reportId || mockReportDetail.report_id,
      report_mode: reportMode,
      content: reportMode === 'brief'
        ? mockReportDetail.content_brief || mockReportDetail.summary || mockReportDetail.content
        : mockReportDetail.content_markdown || mockReportDetail.content,
    };
  }
  return request<ReportDetail>(`/reports/${reportId}`, {}, { report_mode: reportMode });
}

export async function getReports(params: {
  keyword?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<ReportsResponse> {
  if (useMock) {
    return mockGetReports(params);
  }
  return request<ReportsResponse>('/reports/', {}, params);
}

export async function getReportCitations(reportId: string): Promise<ReportCitationsResponse> {
  if (useMock) {
    return mockGetReportCitations(reportId);
  }
  return request<ReportCitationsResponse>(`/reports/${reportId}/citations`);
}

export async function getReportCitationDetail(
  reportId: string,
  citationId: string
): Promise<ReportCitationDetail> {
  if (useMock) {
    return mockGetReportCitationDetail(reportId, citationId);
  }
  return request<ReportCitationDetail>(`/reports/${reportId}/citations/${citationId}`);
}

export async function getReportVersions(reportId: string): Promise<ReportVersionsResponse> {
  if (useMock) {
    return mockGetReportVersions(reportId);
  }
  return request<ReportVersionsResponse>(`/reports/${reportId}/versions`);
}

export async function exportReport(
  reportId: string,
  payload: ExportReportRequest
): Promise<ExportReportResponse> {
  if (useMock) {
    return mockExportReport(reportId, payload);
  }
  return request<ExportReportResponse>(`/reports/${reportId}/export`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getReportExportStatus(
  exportId: string
): Promise<ReportExportStatusResponse> {
  if (useMock) {
    return mockGetReportExportStatus(exportId);
  }
  return request<ReportExportStatusResponse>(`/reports/exports/${exportId}/status`);
}

export async function shareReport(
  reportId: string,
  payload: ShareReportRequest
): Promise<ShareReportResponse> {
  if (useMock) {
    return mockShareReport(reportId, payload);
  }
  return request<ShareReportResponse>(`/reports/${reportId}/share`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteReportShare(
  reportId: string,
  shareId: string
): Promise<DeleteReportShareResponse> {
  if (useMock) {
    return mockDeleteReportShare(reportId, shareId);
  }
  return request<DeleteReportShareResponse>(`/reports/${reportId}/share/${shareId}`, {
    method: 'DELETE',
  });
}

export async function getPublicSharedReport(
  shareId: string
): Promise<PublicSharedReportResponse> {
  if (useMock) {
    return mockGetPublicSharedReport(shareId);
  }
  return request<PublicSharedReportResponse>(`/public/reports/share/${shareId}`);
}

export async function createReportQa(
  reportId: string,
  payload: CreateReportQaRequest
): Promise<CreateReportQaResponse> {
  if (useMock) {
    return mockCreateReportQa(reportId, payload);
  }
  return request<CreateReportQaResponse>(`/reports/${reportId}/qa`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getReportQa(reportId: string): Promise<ReportQaListResponse> {
  if (useMock) {
    return mockGetReportQa(reportId);
  }
  return request<ReportQaListResponse>(`/reports/${reportId}/qa`);
}

export async function appendReportQa(
  reportId: string,
  qaId: string,
  payload: AppendReportQaRequest
): Promise<AppendReportQaResponse> {
  if (useMock) {
    return mockAppendReportQa(reportId, qaId, payload);
  }
  return request<AppendReportQaResponse>(`/reports/${reportId}/qa/${qaId}/append`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getFavoriteFolders(): Promise<FavoriteFoldersResponse> {
  if (useMock) {
    return mockGetFavoriteFolders();
  }
  return request<FavoriteFoldersResponse>('/favorites/folders/');
}

export async function createFavoriteFolder(
  payload: CreateFavoriteFolderRequest
): Promise<CreateFavoriteFolderResponse> {
  if (useMock) {
    return mockCreateFavoriteFolder(payload);
  }
  return request<CreateFavoriteFolderResponse>('/favorites/folders/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateFavoriteFolder(
  folderId: string,
  payload: UpdateFavoriteFolderRequest
): Promise<UpdateFavoriteFolderResponse> {
  if (useMock) {
    return mockUpdateFavoriteFolder(folderId, payload);
  }
  return request<UpdateFavoriteFolderResponse>(`/favorites/folders/${folderId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteFavoriteFolder(folderId: string): Promise<DeleteFavoriteFolderResponse> {
  if (useMock) {
    return mockDeleteFavoriteFolder(folderId);
  }
  return request<DeleteFavoriteFolderResponse>(`/favorites/folders/${folderId}`, {
    method: 'DELETE',
  });
}

export async function getFavoriteItems(params: {
  folder_id?: string;
  favorite_type?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<FavoriteItemsResponse> {
  if (useMock) {
    return mockGetFavoriteItems(params);
  }
  return request<FavoriteItemsResponse>('/favorites/items/', {}, params);
}

export async function createFavoriteItem(
  payload: CreateFavoriteItemRequest
): Promise<CreateFavoriteItemResponse> {
  if (useMock) {
    return mockCreateFavoriteItem(payload);
  }
  return request<CreateFavoriteItemResponse>('/favorites/items/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function moveFavoriteItem(
  favoriteId: string,
  payload: MoveFavoriteItemRequest
): Promise<MoveFavoriteItemResponse> {
  if (useMock) {
    return mockMoveFavoriteItem(favoriteId, payload);
  }
  return request<MoveFavoriteItemResponse>(`/favorites/items/${favoriteId}/move`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteFavoriteItem(favoriteId: string): Promise<DeleteFavoriteItemResponse> {
  if (useMock) {
    return mockDeleteFavoriteItem(favoriteId);
  }
  return request<DeleteFavoriteItemResponse>(`/favorites/items/${favoriteId}`, {
    method: 'DELETE',
  });
}

export async function getAlerts(params: {
  object_type?: string;
  status?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<AlertsResponse> {
  if (useMock) {
    return mockGetAlerts(params);
  }
  return request<AlertsResponse>('/alerts/', {}, params);
}

export async function createAlert(payload: CreateAlertRequest): Promise<CreateAlertResponse> {
  if (useMock) {
    return mockCreateAlert(payload);
  }
  return request<CreateAlertResponse>('/alerts/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAlert(
  alertId: string,
  payload: UpdateAlertRequest
): Promise<UpdateAlertResponse> {
  if (useMock) {
    return mockUpdateAlert(alertId, payload);
  }
  return request<UpdateAlertResponse>(`/alerts/${alertId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAlert(alertId: string): Promise<DeleteAlertResponse> {
  if (useMock) {
    return mockDeleteAlert(alertId);
  }
  return request<DeleteAlertResponse>(`/alerts/${alertId}`, {
    method: 'DELETE',
  });
}

export async function getMessages(params: {
  read_status?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<MessagesResponse> {
  if (useMock) {
    return mockGetMessages(params);
  }
  const query = {
    page: params.page,
    page_size: params.page_size,
    only_unread:
      params.read_status === 'unread'
        ? true
        : params.read_status === 'read'
          ? false
          : undefined,
  };
  const response = await request<MessagesResponse>('/messages/', {}, query);
  if (params.read_status === 'read') {
    const list = response.list.filter((item) => item.read_status);
    return {
      ...response,
      list,
      total: list.length,
    };
  }
  return response;
}

export async function markMessageRead(messageId: string): Promise<MarkMessageReadResponse> {
  if (useMock) {
    return mockMarkMessageRead(messageId);
  }
  return request<MarkMessageReadResponse>(`/messages/${messageId}/read`, {
    method: 'POST',
  });
}

export async function markAllMessagesRead(): Promise<MarkAllMessagesReadResponse> {
  if (useMock) {
    return mockMarkAllMessagesRead();
  }
  return request<MarkAllMessagesReadResponse>('/messages/read-all/', {
    method: 'POST',
  });
}

export async function getAdminModels(): Promise<AdminModelListResponse> {
  if (useMock) {
    return mockGetAdminModels();
  }
  const response = await request<{ list: BackendAdminModelItem[]; total: number }>('/admin/models/');
  return {
    list: response.list.map(mapAdminModel),
    total: response.total,
  };
}

export async function createAdminModel(
  payload: CreateAdminModelRequest
): Promise<CreateAdminModelResponse> {
  if (useMock) {
    return mockCreateAdminModel(payload);
  }
  return request<CreateAdminModelResponse>('/admin/models/', {
    method: 'POST',
    body: JSON.stringify(toBackendAdminModelPayload(payload)),
  });
}

export async function updateAdminModel(
  modelId: string,
  payload: UpdateAdminModelRequest
): Promise<UpdateAdminModelResponse> {
  if (useMock) {
    return mockUpdateAdminModel(modelId, payload);
  }
  return request<UpdateAdminModelResponse>(`/admin/models/${modelId}`, {
    method: 'PATCH',
    body: JSON.stringify(toBackendAdminModelPayload(payload)),
  });
}

export async function deleteAdminModel(modelId: string): Promise<DeleteAdminModelResponse> {
  if (useMock) {
    return mockDeleteAdminModel(modelId);
  }
  return request<DeleteAdminModelResponse>(`/admin/models/${modelId}`, {
    method: 'DELETE',
  });
}

export async function testAdminModelConnection(
  modelId: string
): Promise<TestAdminModelConnectionResponse> {
  if (useMock) {
    return mockTestAdminModelConnection(modelId);
  }
  return request<TestAdminModelConnectionResponse>(`/admin/models/${modelId}/test-connection`, {
    method: 'POST',
  });
}

export async function assignAdminModelPermissions(
  modelId: string,
  payload: AdminModelPermissionRequest
): Promise<AdminModelPermissionResponse> {
  if (useMock) {
    return mockAssignAdminModelPermissions(modelId, payload);
  }
  return request<AdminModelPermissionResponse>(`/admin/models/${modelId}/permissions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAdminUsers(): Promise<AdminUsersResponse> {
  if (useMock) {
    return mockGetAdminUsers();
  }
  const response = await request<{ list: BackendAdminUserListItem[]; total: number }>('/admin/users/');
  return {
    list: response.list.map(mapAdminUser),
    total: response.total,
  };
}

export async function createAdminUser(payload: CreateAdminUserRequest): Promise<CreateAdminUserResponse> {
  if (useMock) {
    return mockCreateAdminUser(payload);
  }
  const response = await request<BackendCreateAdminUserResponse>('/admin/users/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return {
    ...response,
    user_id: Number(response.user_id),
  };
}

export async function getAdminUserDetail(userId: number): Promise<AdminUserDetail> {
  if (useMock) {
    return mockGetAdminUserDetail(userId);
  }
  const response = await request<BackendAdminUserDetail>(`/admin/users/${userId}`);
  return mapAdminUserDetail(response);
}

export async function updateAdminUser(
  userId: number,
  payload: UpdateAdminUserRequest
): Promise<UpdateAdminUserResponse> {
  if (useMock) {
    return mockUpdateAdminUser(userId, payload);
  }
  return request<UpdateAdminUserResponse>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function resetAdminUserPassword(
  userId: number
): Promise<ResetAdminUserPasswordResponse> {
  if (useMock) {
    return mockResetAdminUserPassword(userId);
  }
  return request<ResetAdminUserPasswordResponse>(`/admin/users/${userId}/reset-password`, {
    method: 'POST',
  });
}

export async function getCurrentUserPermissions(): Promise<CurrentUserPermissionsResponse> {
  if (useMock) {
    return mockGetCurrentUserPermissions();
  }
  const response = await request<CurrentUserPermissionsResponse>('/admin/permissions/current');
  return {
    ...response,
    user_id: response.user_id == null ? undefined : Number(response.user_id),
  };
}

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverviewResponse> {
  if (useMock) {
    return mockGetAdminDashboardOverview();
  }
  return request<AdminDashboardOverviewResponse>('/admin/dashboard/overview');
}

export async function getAdminObjectDistribution(): Promise<AdminObjectDistributionResponse> {
  if (useMock) {
    return mockGetAdminObjectDistribution();
  }
  return request<AdminObjectDistributionResponse>('/admin/dashboard/object-distribution');
}

export async function getAdminModelUsage(): Promise<AdminModelUsageResponse> {
  if (useMock) {
    return mockGetAdminModelUsage();
  }
  return request<AdminModelUsageResponse>('/admin/dashboard/model-usage');
}

export async function getAdminUserActivity(): Promise<AdminUserActivityResponse> {
  if (useMock) {
    return mockGetAdminUserActivity();
  }
  return request<AdminUserActivityResponse>('/admin/dashboard/user-activity');
}

export async function getAdminLogs(params: {
  level?: string;
  user_keyword?: string;
  model_id?: string;
  module?: string;
  object_type?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<AdminLogsResponse> {
  if (useMock) {
    return mockGetAdminLogs();
  }
  return request<AdminLogsResponse>('/admin/logs/', {}, params);
}

export async function getAdminLogDetail(logId: string): Promise<AdminLogDetail> {
  if (useMock) {
    return mockGetAdminLogDetail(logId);
  }
  return request<AdminLogDetail>(`/admin/logs/${logId}`);
}

export async function exportAdminLogs(
  payload: ExportAdminLogsRequest
): Promise<AdminLogExportResponse> {
  if (useMock) {
    return mockExportAdminLogs(payload);
  }
  return request<AdminLogExportResponse>('/admin/logs/export/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAdminLogExportStatus(
  exportId: string
): Promise<AdminLogExportStatusResponse> {
  if (useMock) {
    return mockGetAdminLogExportStatus(exportId);
  }
  return request<AdminLogExportStatusResponse>(`/admin/logs/export/${exportId}/status`);
}
