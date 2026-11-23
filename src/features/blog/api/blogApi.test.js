import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as apiHelper from '../../../helpers/apiHelper'
import {
  getPublicCategoriesApi,
  getPublicPostsApi,
  getPublicPostBySlugApi,
  getAuthorPostsApi,
  getAuthorStatsApi,
  getAuthorPostByIdApi,
  createPostApi,
  updatePostApi,
  togglePublishPostApi,
  deletePostApi,
  generateAiPostApi,
} from './blogApi'

describe('blogApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls all public, author, and AI blog endpoints via apiRequest', async () => {
    const spy = vi.spyOn(apiHelper, 'apiRequest').mockResolvedValue({})

    await getPublicCategoriesApi()
    expect(spy).toHaveBeenCalledWith('/api/public/categories')

    await getPublicPostsApi()
    expect(spy).toHaveBeenCalledWith('/api/public/posts')

    await getPublicPostsApi({ q: 'gin', category: 'Teknologi' })
    expect(spy).toHaveBeenCalledWith('/api/public/posts?q=gin&category=Teknologi')

    await getPublicPostsApi({ category: 'Semua' })
    expect(spy).toHaveBeenCalledWith('/api/public/posts')

    await getPublicPostBySlugApi('my-post')
    expect(spy).toHaveBeenCalledWith('/api/public/posts/my-post')

    await getAuthorPostsApi()
    expect(spy).toHaveBeenCalledWith('/api/posts')

    await getAuthorPostsApi({ q: 'ai', category: 'Bisnis', status: 'draft' })
    expect(spy).toHaveBeenCalledWith('/api/posts?q=ai&category=Bisnis&status=draft')

    await getAuthorStatsApi()
    expect(spy).toHaveBeenCalledWith('/api/posts/stats')

    await getAuthorPostByIdApi(3)
    expect(spy).toHaveBeenCalledWith('/api/posts/3')

    await createPostApi({ title: 'T', content: 'C' })
    expect(spy).toHaveBeenCalledWith('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'T', content: 'C' }),
    })

    await updatePostApi(3, { title: 'T2' })
    expect(spy).toHaveBeenCalledWith('/api/posts/3', {
      method: 'PUT',
      body: JSON.stringify({ title: 'T2' }),
    })

    await togglePublishPostApi(3)
    expect(spy).toHaveBeenCalledWith('/api/posts/3/toggle-publish', { method: 'PATCH' })

    await deletePostApi(3)
    expect(spy).toHaveBeenCalledWith('/api/posts/3', { method: 'DELETE' })

    await generateAiPostApi({ topic: 'WebAssembly', category: 'Teknologi', include_web_search: true })
    expect(spy).toHaveBeenCalledWith('/api/posts/ai-generate', {
      method: 'POST',
      body: JSON.stringify({ topic: 'WebAssembly', category: 'Teknologi', include_web_search: true }),
    })
  })
})
