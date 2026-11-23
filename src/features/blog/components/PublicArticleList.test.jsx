import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PublicArticleList from './PublicArticleList'
import * as blogApi from '../api/blogApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

describe('PublicArticleList', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showErrorAlert').mockResolvedValue({})
  })

  it('loads categories fallback, handles errors, empty state, and unmount cancellation', async () => {
    let resCats
    let resPosts
    vi.spyOn(blogApi, 'getPublicCategoriesApi').mockReturnValueOnce(new Promise((r) => { resCats = r }))
    vi.spyOn(blogApi, 'getPublicPostsApi').mockReturnValueOnce(new Promise((r) => { resPosts = r }))
    const { unmount } = render(<PublicArticleList user={null} onNavigate={vi.fn()} />)
    unmount()
    resCats(['Teknologi'])
    resPosts([])

    let rejCats
    let rejPosts
    vi.spyOn(blogApi, 'getPublicCategoriesApi').mockReturnValueOnce(new Promise((_, j) => { rejCats = j }))
    vi.spyOn(blogApi, 'getPublicPostsApi').mockReturnValueOnce(new Promise((_, j) => { rejPosts = j }))
    const { unmount: unmount2 } = render(<PublicArticleList user={null} onNavigate={vi.fn()} />)
    unmount2()
    rejCats(new Error('cat err'))
    rejPosts(new Error('post err'))

    vi.spyOn(blogApi, 'getPublicCategoriesApi').mockRejectedValueOnce(new Error('cat fail'))
    vi.spyOn(blogApi, 'getPublicPostsApi').mockRejectedValueOnce(new Error('post fail'))
    render(<PublicArticleList user={null} onNavigate={vi.fn()} />)
    await waitFor(() => {
      expect(toolsHelper.showErrorAlert).toHaveBeenCalledWith('Gagal Memuat Artikel', 'post fail')
      expect(screen.getByRole('button', { name: 'Teknologi' })).toBeInTheDocument()
    })
  })

  it('renders articles, filters by search & pill category, and handles CTA buttons', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    vi.spyOn(blogApi, 'getPublicCategoriesApi').mockResolvedValue(['Teknologi', 'Pendidikan'])
    vi.spyOn(blogApi, 'getPublicPostsApi')
      .mockResolvedValueOnce([
        {
          id: 1,
          title: 'Golang Gin Clean Arch',
          slug: 'golang-gin-clean-arch',
          category: 'Teknologi',
          excerpt: 'Panduan lengkap Gin',
          reading_time: 4,
          published_at: '2026-11-20T00:00:00Z',
          author_name: 'admin',
        },
        {
          id: 2,
          title: 'Artikel Tanpa Author',
          slug: 'tanpa-author',
          category: 'Pendidikan',
          excerpt: 'Ringkasan',
          reading_time: 1,
          created_at: '2026-11-21T00:00:00Z',
        },
      ])
      .mockResolvedValue(null)

    const { rerender } = render(<PublicArticleList user={null} onNavigate={onNavigate} />)

    await waitFor(() => expect(screen.getByText('Golang Gin Clean Arch')).toBeInTheDocument())

    await user.click(screen.getByText('Login Penulis'))
    expect(onNavigate).toHaveBeenCalledWith('/login')
    await user.click(screen.getByText('Daftar Gratis'))
    expect(onNavigate).toHaveBeenCalledWith('/register')

    await user.click(screen.getByText('Golang Gin Clean Arch'))
    expect(onNavigate).toHaveBeenCalledWith('/posts/golang-gin-clean-arch')

    await user.type(screen.getByLabelText('Cari artikel publik'), 'Gin')
    await user.click(screen.getByRole('button', { name: 'Teknologi' }))
    await waitFor(() => {
      expect(screen.getByText(/Belum ada artikel publik/)).toBeInTheDocument()
    })

    rerender(<PublicArticleList user={{ id: 1, username: 'member' }} onNavigate={onNavigate} />)
    await user.click(screen.getByRole('button', { name: 'Tulis Artikel' }))
    expect(onNavigate).toHaveBeenCalledWith('/author')
  })
})
