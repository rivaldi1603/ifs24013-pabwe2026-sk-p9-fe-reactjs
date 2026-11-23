import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  apiRequest,
} from './apiHelper'

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('manages token and user in localStorage', () => {
    expect(getToken()).toBe('')
    setToken('blog-jwt')
    expect(getToken()).toBe('blog-jwt')
    removeToken()
    expect(getToken()).toBe('')

    expect(getStoredUser()).toBeNull()
    setStoredUser({ id: 1, username: 'penulis' })
    expect(getStoredUser()).toEqual({ id: 1, username: 'penulis' })
    localStorage.setItem('delcom_blog_user', '{bad')
    expect(getStoredUser()).toBeNull()
    removeStoredUser()
    expect(getStoredUser()).toBeNull()
  })

  it('performs apiRequest with and without token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', data: { ok: true } }),
    })

    const res = await apiRequest('/api/public/categories')
    expect(res).toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledWith('/api/public/categories', {
      headers: { 'Content-Type': 'application/json' },
    })

    setToken('jwt-token')
    await apiRequest('/api/posts', {
      method: 'GET',
      headers: { 'X-Custom': '1' },
    })
    expect(fetch).toHaveBeenLastCalledWith('/api/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom': '1',
        Authorization: 'Bearer jwt-token',
      },
    })
  })

  it('throws error when response is not ok or status is not success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ status: 'fail', message: 'Unauthorized' }),
    })
    await expect(apiRequest('/api/fail')).rejects.toThrow('Unauthorized')

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'fail' }),
    })
    await expect(apiRequest('/api/fail2')).rejects.toThrow('Terjadi kesalahan pada server')
  })
})
