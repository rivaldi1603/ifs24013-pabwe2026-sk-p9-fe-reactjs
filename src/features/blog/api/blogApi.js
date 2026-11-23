import { apiRequest } from '../../../helpers/apiHelper'

export function getPublicCategoriesApi() {
  return apiRequest('/api/public/categories')
}

export function getPublicPostsApi(params = {}) {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.category && params.category !== 'Semua') query.set('category', params.category)
  const qs = query.toString()
  return apiRequest(qs ? `/api/public/posts?${qs}` : '/api/public/posts')
}

export function getPublicPostBySlugApi(slug) {
  return apiRequest(`/api/public/posts/${slug}`)
}

export function getAuthorPostsApi(params = {}) {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.category) query.set('category', params.category)
  if (params.status) query.set('status', params.status)
  const qs = query.toString()
  return apiRequest(qs ? `/api/posts?${qs}` : '/api/posts')
}

export function getAuthorStatsApi() {
  return apiRequest('/api/posts/stats')
}

export function getAuthorPostByIdApi(id) {
  return apiRequest(`/api/posts/${id}`)
}

export function createPostApi(payload) {
  return apiRequest('/api/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePostApi(id, payload) {
  return apiRequest(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function togglePublishPostApi(id) {
  return apiRequest(`/api/posts/${id}/toggle-publish`, {
    method: 'PATCH',
  })
}

export function deletePostApi(id) {
  return apiRequest(`/api/posts/${id}`, {
    method: 'DELETE',
  })
}

export function generateAiPostApi(payload) {
  return apiRequest('/api/posts/ai-generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
