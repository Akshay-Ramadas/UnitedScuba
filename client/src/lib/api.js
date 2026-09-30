export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = res.status;
    error.issues = data.issues;
    throw error;
  }
  return data;
}

export function waLink(number, text = 'Hello United Scuba, I would like to enquire.') {
  const digits = String(number || '').replace(/\D/g, '');
  if (!digits) return '#';
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export const LOGO = '/assets/United%20Scuba%20LOGO%20FINAL_HORIZONTAL.png';
export const LOGO_MARK = '/assets/United%20Scuba%20LOGO%20FINAL_PRIMARY.png';
