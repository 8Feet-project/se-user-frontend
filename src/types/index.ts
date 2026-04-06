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

export interface ResearchTaskStatusResponse {
  task_id: string;
  status: ResearchTaskStatus;
  current_stage: string;
  progress: number;
  hint: string;
  error_code?: string;
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

export interface ReportCitation {
  citation_id: string;
  source_title: string;
  source_url: string;
}

export interface ReportDetail {
  report_id: string;
  task_id: string;
  title: string;
  content: string;
  citations: ReportCitation[];
  created_at: string;
}
