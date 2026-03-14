const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("csa-auth-token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

// Auth
export function apiRegister(email, name, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, name, password }),
  });
}

export function apiLogin(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function apiGetMe() {
  return request("/auth/me");
}

// Progress
export function apiGetProgress() {
  return request("/progress");
}

export function apiSaveProgress(key, data) {
  return request(`/progress/${key}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
}

export function apiBulkSaveProgress(progress) {
  return request("/progress", {
    method: "PUT",
    body: JSON.stringify({ progress }),
  });
}

