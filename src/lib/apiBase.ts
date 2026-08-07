const DEFAULT_API_ORIGIN = 'http://localhost:5000';

export const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_ORIGIN).replace(/\/+$/, '');
export const API_BASE = `${API_ORIGIN}/api`;

export function withApiOrigin(path: string): string {
  if (!path) {
    return API_ORIGIN;
  }

  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}
