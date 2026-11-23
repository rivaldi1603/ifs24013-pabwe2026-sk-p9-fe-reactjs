import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as apiHelper from '../../../helpers/apiHelper'
import { getAdminUsersApi, getAdminPostsApi, getAdminUserPostsApi } from './adminApi'

describe('adminApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls admin endpoints via apiRequest', async () => {
    const spy = vi.spyOn(apiHelper, 'apiRequest').mockResolvedValue([])

    await getAdminUsersApi()
    expect(spy).toHaveBeenCalledWith('/api/admin/users')

    await getAdminPostsApi()
    expect(spy).toHaveBeenCalledWith('/api/admin/posts')

    await getAdminUserPostsApi(5)
    expect(spy).toHaveBeenCalledWith('/api/admin/users/5/posts')
  })
})
