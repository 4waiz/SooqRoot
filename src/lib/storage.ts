const PREFIX = 'sooqroot:v2:';

export function loadItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota or private mode — the demo works fine without persistence */
  }
}

export function clearAll(): void {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(PREFIX)) localStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}

/* ---------------- session (tab-scoped) ---------------- */

const SESSION_KEY = 'sooqroot:session';

export function loadSession<T>(fallback: T): T {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveSession<T>(value: T): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
