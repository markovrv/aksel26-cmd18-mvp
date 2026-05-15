// === API Client ===
const BASE_URL = '/api';

async function request(method, path, body = null, options = {}) {
  const config = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };
  if (body) config.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, config);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || 'Ошибка запроса');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  get:    (path, options) => request('GET', path, null, options),
  post:   (path, body, options) => request('POST', path, body, options),
  put:    (path, body, options) => request('PUT', path, body, options),
  delete: (path, options) => request('DELETE', path, null, options),
};

export async function uploadFile(path, formData) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return res.json();
}