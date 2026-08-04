const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const ACCESS_KEY = 'progen_access';
const REFRESH_KEY = 'progen_refresh';

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

async function parse(res: Response) {
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? res.statusText, body?.details);
  }
  return body;
}

// Called when the session is unrecoverable (refresh failed). Clears tokens and
// notifies the app so it can send the user back to the login screen.
export function forceLogout() {
  tokenStore.clear();
  window.dispatchEvent(new Event('auth:logout'));
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const tokens = await res.json();
    tokenStore.set(tokens);
    return true;
  } catch {
    return false;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown; // JSON object, or FormData for uploads
  auth?: boolean; // attach access token (default true)
}

export async function api(path: string, opts: RequestOptions = {}): Promise<any> {
  const { method = 'GET', body, auth = true } = opts;
  const isForm = body instanceof FormData;

  const build = (): RequestInit => {
    const headers: Record<string, string> = {};
    if (auth && tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
    return {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    };
  };

  let res = await fetch(`${BASE_URL}${path}`, build());

  // One transparent retry after refreshing an expired access token. If the
  // refresh fails (or the retry is still 401), the session is dead → log out.
  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) res = await fetch(`${BASE_URL}${path}`, build());
    if (!refreshed || res.status === 401) forceLogout();
  }

  return parse(res);
}

// Downloads a binary (the proposal PDF) with auth, returning a Blob.
export async function apiDownload(path: string): Promise<Blob> {
  const headers: Record<string, string> = {};
  if (tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;
  let res = await fetch(`${BASE_URL}${path}`, { headers });
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers.Authorization = `Bearer ${tokenStore.access}`;
      res = await fetch(`${BASE_URL}${path}`, { headers });
    }
    if (!refreshed || res.status === 401) forceLogout();
  }
  if (!res.ok) throw new ApiError(res.status, 'Download failed');
  return res.blob();
}
