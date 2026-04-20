import type { ApiResponse } from '../types';

const API_PREFIX = '/api/v1';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';

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

  const parsed = (await response.json()) as ApiResponse<T> | T;
  if (!response.ok) {
    const message = (parsed as ApiResponse<T>).message ?? 'Request failed';
    throw new Error(message);
  }

  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'code' in parsed &&
    'data' in parsed
  ) {
    const wrapped = parsed as ApiResponse<T>;
    if (wrapped.code !== 0) {
      throw new Error(wrapped.message || 'Request failed');
    }
    return wrapped.data;
  }

  return parsed as T;
}
