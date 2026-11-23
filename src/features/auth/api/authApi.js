import { apiRequest } from '../../../helpers/apiHelper'

export function loginApi(payload) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerApi(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logoutApi() {
  return apiRequest('/api/auth/logout', {
    method: 'POST',
  })
}

export function getProfileApi() {
  return apiRequest('/api/auth/profile')
}

export function updateProfileApi(payload) {
  return apiRequest('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
