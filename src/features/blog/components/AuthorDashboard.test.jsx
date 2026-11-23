import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthorDashboard from './AuthorDashboard'
import * as blogApi from '../api/blogApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../modals/PostModal', () => ({
  default: ({ isOpen, onClose, initialPost }) =>
    isOpen ? (
      <div data-testid="post-modal">
        <span>{initialPost ? initialPost.title : 'new-post'}</span>
        <button type="button" onClick={onClose}>ClosePostModal</button>
      </div>
    ) : null,
}))

vi.mock('../modals/AiPostGeneratorModal', () => ({
  default: ({ isOpen, onClose, onApplyDraft }) =>
    isOpen ? (
      <div data-testid="ai-post-modal">
        <button
          type="button"
          onClick={() => onApplyDraft({ title: 'AI Draft', category: 'Teknologi', content: '# AI' })}
        >
          ApplyDraftBtn
        </button>
        <button type="button" onClick={onClose}>CloseAiModal</button>
      </div>
    ) : null,
}))

describe('AuthorDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showSuccessAlert').mockResolvedValue({})
    vi.spyOn(toolsHelper, 'showErrorAlert').mockResolvedValue({})
  })

  it('handles load failure and empty state', async () => {
    vi.spyOn(blogApi, 'getAuthorPostsApi').mockRejectedValueOnce(new Error('Load err'))
    vi.spyOn(blogApi, 'getAuthorStatsApi').mockResolvedValue({ total_articles: 0, total_selesai: 0, belum_selesai: 0 })

    render(<AuthorDashboard theme="light" onNavigate={vi.fn()} />)
    await waitFor(() => {
      expect(toolsHelper.showErrorAlert).toHaveBeenCalledWith('Gagal Memuat Workspace Penulis', 'Load err')
    })

    vi.spyOn(blogApi, 'getAuthorPostsApi').mockResolvedValue(null)
    vi.spyOn(blogApi, 'getAuthorStatsApi').mockResolvedValue(null)
    render(<AuthorDashboard theme="light" onNavigate={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText(/Belum ada artikel/)).toBeInTheDocument()
    })
  })

  it('manages author posts, toggle publish, kebab menu, AI apply, and delete', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()

    vi.spyOn(blogApi, 'getAuthorPostsApi').mockResolvedValue([
      {
        id: 1,
        title: 'Artikel Terbit',
        slug: 'artikel-terbit',
        category: 'Teknologi',
        reading_time: 3,
        is_published: true,
        published_at: '2026-11-22T00:00:00Z',
      },
      {
        id: 2,
        title: 'Artikel Draf',
        slug: 'artikel-draf',
        category: 'Opini',
        reading_time: 1,
        is_published: false,
        created_at: '2026-11-21T00:00:00Z',
      },
    ])
    vi.spyOn(blogApi, 'getAuthorStatsApi').mockResolvedValue({ total_articles: 2, total_selesai: 1, belum_selesai: 1 })

    render(<AuthorDashboard theme="light" onNavigate={onNavigate} />)
    await waitFor(() => expect(screen.getByText('Artikel Terbit')).toBeInTheDocument())

    // Search & filter
    await user.type(screen.getByLabelText('Cari artikel saya'), 'Terbit')
    await user.selectOptions(screen.getByLabelText('Filter kategori penulis'), 'Teknologi')

    // Toggle publish (error + success)
    vi.spyOn(blogApi, 'togglePublishPostApi')
      .mockRejectedValueOnce(new Error('Toggle fail'))
      .mockResolvedValueOnce({})
    await user.click(screen.getByLabelText('Toggle publikasi Artikel Terbit'))
    await waitFor(() => expect(toolsHelper.showErrorAlert).toHaveBeenCalledWith('Gagal Mengubah Status Publikasi', 'Toggle fail'))
    await user.click(screen.getByLabelText('Toggle publikasi Artikel Draf'))
    await waitFor(() => expect(toolsHelper.showSuccessAlert).toHaveBeenCalledWith('Status Publikasi Diperbarui'))

    // Kebab menu open/close, Baca Publik, Ubah Artikel
    await user.click(screen.getByLabelText('Menu Artikel Terbit'))
    await user.click(screen.getByLabelText('Menu Artikel Terbit'))
    await user.click(screen.getByLabelText('Menu Artikel Terbit'))
    await user.click(screen.getByText('Baca Publik'))
    expect(onNavigate).toHaveBeenCalledWith('/posts/artikel-terbit')

    await user.click(screen.getByLabelText('Menu Artikel Draf'))
    await user.click(screen.getByText('Ubah Artikel'))
    expect(screen.getByTestId('post-modal')).toHaveTextContent('Artikel Draf')
    await user.click(screen.getByText('ClosePostModal'))

    // Tambah Artikel modal
    await user.click(screen.getByRole('button', { name: 'Tambah Artikel' }))
    expect(screen.getByTestId('post-modal')).toHaveTextContent('new-post')
    await user.click(screen.getByText('ClosePostModal'))

    // AI Generator modal -> apply draft directly to PostModal
    await user.click(screen.getByRole('button', { name: 'AI Generator' }))
    expect(screen.getByTestId('ai-post-modal')).toBeInTheDocument()
    await user.click(screen.getByText('ApplyDraftBtn'))
    expect(screen.getByTestId('post-modal')).toHaveTextContent('AI Draft')
    await user.click(screen.getByText('ClosePostModal'))
    await user.click(screen.getByText('CloseAiModal'))

    // Delete flows: cancel, error, success
    vi.spyOn(toolsHelper, 'showConfirmDialog')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
    vi.spyOn(blogApi, 'deletePostApi')
      .mockRejectedValueOnce(new Error('Delete err'))
      .mockResolvedValueOnce({})

    await user.click(screen.getByLabelText('Menu Artikel Terbit'))
    await user.click(screen.getByText('Hapus'))

    await user.click(screen.getByLabelText('Menu Artikel Terbit'))
    await user.click(screen.getByText('Hapus'))
    await waitFor(() => expect(toolsHelper.showErrorAlert).toHaveBeenCalledWith('Gagal Menghapus Artikel', 'Delete err'))

    await user.click(screen.getByLabelText('Menu Artikel Terbit'))
    await user.click(screen.getByText('Hapus'))
    await waitFor(() => expect(toolsHelper.showSuccessAlert).toHaveBeenCalledWith('Artikel Dihapus'))
  })
})
