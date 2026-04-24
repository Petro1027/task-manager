export const ACCESS_TOKEN_STORAGE_KEY = "task_manager_access_token";
export const AUTH_USER_STORAGE_KEY = "task_manager_auth_user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export function saveAuthSession(input: {
  accessToken: string;
  user: AuthUser;
}) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, input.accessToken);
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(input.user));
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getStoredAuthUser(): AuthUser | null {
  const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}
