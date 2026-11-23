import { apiRequest } from '../../../helpers/apiHelper'

export function getAdminUsersApi() {
  return apiRequest('/api/admin/users')
}

export function getAdminPostsApi() {
  return apiRequest('/api/admin/posts')
}

export function getAdminUserPostsApi(userId) {
  return apiRequest(`/api/admin/users/${userId}/posts`)
}
