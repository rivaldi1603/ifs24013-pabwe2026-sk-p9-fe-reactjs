import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as apiHelper from '../../../helpers/apiHelper'
import {
  loginApi,
  registerApi,
  logoutApi,
  getProfileApi,
  updateProfileApi,
} from './authApi'

describe('authApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls auth endpoints via apiRequest', async () => {
    const spy = vi.spyOn(apiHelper, 'apiRequest').mockResolvedValue({ ok: true })

    await loginApi({ username: 'admin', password: 'admin' })
    expect(spy).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    })

    await registerApi({ username: 'penulis', email: 'p@delcom.org', password: 'secret' })
    expect(spy).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'penulis', email: 'p@delcom.org', password: 'secret' }),
    })

    await logoutApi()
    expect(spy).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })

    await getProfileApi()
    expect(spy).toHaveBeenCalledWith('/api/auth/profile')

    await updateProfileApi({ email: 'new@delcom.org' })
    expect(spy).toHaveBeenCalledWith('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ email: 'new@delcom.org' }),
    })
  })
})
