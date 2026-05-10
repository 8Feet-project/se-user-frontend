import type {
  CurrentUserPermissionsResponse,
  LoginResponse,
  RegisterResponse,
  UserRole,
} from '@/types';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ROLE_KEY = '8feet-user-role';
const USER_PERMISSIONS_KEY = '8feet-user-permissions';
const AUTH_NOTICE_KEY = '8feet-auth-notice';

export type AuthSessionSource =
  | LoginResponse
  | RegisterResponse
  | CurrentUserPermissionsResponse;

export function hasAccessToken() {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
}

export function getStoredUserRole(): UserRole | '' {
  const value = localStorage.getItem(USER_ROLE_KEY);
  return value === 'super_admin' || value === 'admin' || value === 'user' ? value : '';
}

export function getStoredPermissions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USER_PERMISSIONS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function isAdminRole(role: string | null | undefined) {
  return role === 'admin' || role === 'super_admin';
}

export function saveAuthSession(session: AuthSessionSource) {
  if ('access_token' in session && session.access_token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
  }
  if ('refresh_token' in session && session.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  }
  if (session.role) {
    localStorage.setItem(USER_ROLE_KEY, session.role);
  }
  if ('permissions' in session && Array.isArray(session.permissions)) {
    localStorage.setItem(USER_PERMISSIONS_KEY, JSON.stringify(session.permissions));
  }
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_PERMISSIONS_KEY);
}

export function setAuthNotice(message: string) {
  sessionStorage.setItem(AUTH_NOTICE_KEY, message);
}

export function takeAuthNotice() {
  const notice = sessionStorage.getItem(AUTH_NOTICE_KEY) || '';
  if (notice) {
    sessionStorage.removeItem(AUTH_NOTICE_KEY);
  }
  return notice;
}

export function redirectToWelcome(message?: string) {
  clearAuthSession();
  if (message) {
    setAuthNotice(message);
  }
  if (window.location.pathname !== '/welcome') {
    window.location.assign('/welcome');
  }
}
