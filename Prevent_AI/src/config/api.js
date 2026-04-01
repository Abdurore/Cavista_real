const viteBaseUrl = import.meta?.env?.VITE_API_BASE_URL || '';
const craBaseUrl = typeof process !== 'undefined' ? process.env?.REACT_APP_API_BASE_URL || '' : '';

const rawBaseUrl = viteBaseUrl || craBaseUrl;

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
};
