import type { ApiResponse } from '../types';
import { redirectToWelcome } from '../lib/auth';

const API_PREFIX = '/api/v1';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';

export class ApiRequestError extends Error {
  code?: number;
  status?: number;

  constructor(message: string, options: { code?: number; status?: number } = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = options.code;
    this.status = options.status;
  }
}

function isApiResponse<T>(value: ApiResponse<T> | T): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'data' in value
  );
}

function handleAuthFailure(message?: string) {
  redirectToWelcome(message || '登录状态已失效，请重新登录。');
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = `${API_BASE_URL}${API_PREFIX}${normalizedPath}`;
  if (!query) {
    return base;
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  query?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const accessToken = localStorage.getItem('access_token');
  const hasBody = options.body !== undefined && options.body !== null;
  const response = await fetch(buildUrl(path, query), {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    const preview = text.trim().slice(0, 120) || response.statusText;
    throw new Error(`服务端返回了非 JSON 响应 (${response.status})：${preview}`);
  }

  const parsed = (await response.json()) as ApiResponse<T> | T;
  if (!response.ok) {
    const wrapped = isApiResponse(parsed) ? parsed : null;
    const message = wrapped?.message ?? 'Request failed';
    if (response.status === 401 || wrapped?.code === 401) {
      handleAuthFailure();
    }
    throw new ApiRequestError(message, { code: wrapped?.code, status: response.status });
  }

  if (isApiResponse(parsed)) {
    const wrapped = parsed;
    if (wrapped.code !== 0) {
      if (wrapped.code === 401) {
        handleAuthFailure();
      }
      throw new ApiRequestError(wrapped.message || 'Request failed', {
        code: wrapped.code,
        status: response.status,
      });
    }
    return wrapped.data;
  }

  return parsed as T;
}
