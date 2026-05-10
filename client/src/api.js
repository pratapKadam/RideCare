export function apiUrl(path) {
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(
    /\/$/,
    ''
  );
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
