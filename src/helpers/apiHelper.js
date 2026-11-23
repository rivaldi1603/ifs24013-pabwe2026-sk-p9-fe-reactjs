const TOKEN_KEY = 'delcom_blog_token'
const USER_KEY = 'delcom_blog_user'

export function getApiBaseUrl(env = import.meta.env) {
  const raw = env?.VITE_DELCOM_BASEURL || env?.VITE_API_BASE_URL || ''
  return raw.replace(/\/+$/, '').replace(/\/api$/, '')
}

export function resolveApiUrl(path, baseUrl = getApiBaseUrl()) {
  return `${baseUrl}${path}`
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function removeStoredUser() {
  localStorage.removeItem(USER_KEY)
}

export async function apiRequest(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(resolveApiUrl(path), {
    ...options,
    headers,
  })

  const payload = await response.json()

  if (!response.ok || payload.status !== 'success') {
    throw new Error(payload.message || 'Terjadi kesalahan pada server')
  }

  return payload.data
}
