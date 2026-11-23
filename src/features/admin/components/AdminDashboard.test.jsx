import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminDashboard from './AdminDashboard'
import * as adminApi from '../api/adminApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showErrorAlert').mockResolvedValue({})
  })

  it('handles load failure and unmount cancellation', async () => {
    let res
    vi.spyOn(adminApi, 'getAdminUsersApi').mockReturnValueOnce(new Promise((r) => { res = r }))
    vi.spyOn(adminApi, 'getAdminPostsApi').mockResolvedValueOnce([])
    const { unmount } = render(<AdminDashboard onNavigate={vi.fn()} />)
    unmount()
    res([])

    let rej
    vi.spyOn(adminApi, 'getAdminUsersApi').mockReturnValueOnce(new Promise((_, j) => { rej = j }))
    vi.spyOn(adminApi, 'getAdminPostsApi').mockResolvedValueOnce([])
    const { unmount: unmount2 } = render(<AdminDashboard onNavigate={vi.fn()} />)
    unmount2()
    rej(new Error('ignored'))

    vi.spyOn(adminApi, 'getAdminUsersApi').mockRejectedValueOnce(new Error('Forbidden'))
    vi.spyOn(adminApi, 'getAdminPostsApi').mockResolvedValueOnce([])
    render(<AdminDashboard onNavigate={vi.fn()} />)
    await waitFor(() => {
      expect(toolsHelper.showErrorAlert).toHaveBeenCalledWith('Gagal Memuat Panel Admin', 'Forbidden')
    })
  })

  it('loads users & archive posts, inspects user posts, and navigates to published post', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    vi.spyOn(adminApi, 'getAdminUsersApi').mockResolvedValue([
      { id: 1, username: 'admin', email: 'admin@delcom.org', role: 'admin', total_articles: 2, total_published: 1 },
    ])
    vi.spyOn(adminApi, 'getAdminPostsApi').mockResolvedValue([
      {
        id: 10,
        title: 'Artikel Terbit',
        slug: 'artikel-terbit',
        category: 'Teknologi',
        is_published: true,
        reading_time: 3,
        published_at: '2026-11-20T00:00:00Z',
        author: { username: 'admin' },
      },
      {
        id: 11,
        title: 'Artikel Draf',
        slug: 'artikel-draf',
        category: 'Opini',
        is_published: false,
        reading_time: 1,
        created_at: '2026-11-21T00:00:00Z',
      },
    ])
    vi.spyOn(adminApi, 'getAdminUserPostsApi')
      .mockRejectedValueOnce(new Error('Load fail'))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce([
        { id: 10, title: 'Post 1', category: 'Teknologi', is_published: true, created_at: '2026-11-20' },
        { id: 11, title: 'Post 2', category: 'Opini', is_published: false, created_at: '2026-11-21' },
      ])

    render(<AdminDashboard onNavigate={onNavigate} />)
    await waitFor(() => expect(screen.getByText('admin@delcom.org')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Artikel Terbit' }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/artikel-terbit')
    expect(screen.getByText('Artikel Draf')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Lihat Artikel' }))
    await waitFor(() => {
      expect(toolsHelper.showErrorAlert).toHaveBeenCalledWith('Gagal Memuat Artikel Penulis', 'Load fail')
    })

    await user.click(screen.getByRole('button', { name: 'Lihat Artikel' }))
    await waitFor(() => {
      expect(screen.getByText('Penulis ini belum memiliki artikel.')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Lihat Artikel' }))
    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument()
      expect(screen.getByText('Post 2')).toBeInTheDocument()
    })

    vi.spyOn(adminApi, 'getAdminUsersApi').mockResolvedValueOnce(null)
    vi.spyOn(adminApi, 'getAdminPostsApi').mockResolvedValueOnce(null)
    render(<AdminDashboard onNavigate={onNavigate} />)
    await waitFor(() => expect(screen.queryByText('Memuat data administrasi...')).not.toBeInTheDocument())
  })
})
