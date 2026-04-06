import {
  mockCreateResearchTask,
  mockHistoryTasks,
  mockLogin,
  mockRegister,
  mockReportDetail,
  mockTaskStatus,
  mockTaskWorkflow,
} from './mock';
import { request } from './http';
import type {
  CreateResearchTaskRequest,
  CreateResearchTaskResponse,
  HistoryTaskItem,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ReportDetail,
  ResearchHistoryResponse,
  ResearchTaskStatusResponse,
  TaskWorkflowResponse,
} from '../types';

const useMock = (import.meta.env.VITE_USE_MOCK ?? 'true') === 'true';

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

export async function createResearchTask(
  payload: CreateResearchTaskRequest
): Promise<CreateResearchTaskResponse> {
  if (useMock) {
    return mockCreateResearchTask(payload);
  }
  return request<CreateResearchTaskResponse>('/research/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getResearchTaskStatus(taskId: string): Promise<ResearchTaskStatusResponse> {
  if (useMock) {
    return { ...mockTaskStatus, task_id: taskId || mockTaskStatus.task_id };
  }
  return request<ResearchTaskStatusResponse>(`/research/tasks/${taskId}/status`);
}

export async function getResearchTaskWorkflow(taskId: string): Promise<TaskWorkflowResponse> {
  if (useMock) {
    return { ...mockTaskWorkflow, task_id: taskId || mockTaskWorkflow.task_id };
  }
  return request<TaskWorkflowResponse>(`/research/tasks/${taskId}/workflow`);
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
  return request<ResearchHistoryResponse>('/research/history', {}, params);
}

export async function getReportDetail(reportId: string): Promise<ReportDetail> {
  if (useMock) {
    return { ...mockReportDetail, report_id: reportId || mockReportDetail.report_id };
  }
  return request<ReportDetail>(`/reports/${reportId}`);
}
