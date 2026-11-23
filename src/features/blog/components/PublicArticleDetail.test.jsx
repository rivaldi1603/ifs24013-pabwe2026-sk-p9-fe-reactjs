import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PublicArticleDetail from './PublicArticleDetail'
import * as blogApi from '../api/blogApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="mock-viewer">{content}</div>,
}))

describe('PublicArticleDetail', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showErrorAlert').mockResolvedValue({})
  })

  it('handles unmount cancellation, error, and not found state', async () => {
    let res
    vi.spyOn(blogApi, 'getPublicPostBySlugApi').mockReturnValueOnce(new Promise((r) => { res = r }))
    const { unmount } = render(<PublicArticleDetail slug="a" theme="light" onNavigate={vi.fn()} />)
    unmount()
    res({ title: 'A' })

    let rej
    vi.spyOn(blogApi, 'getPublicPostBySlugApi').mockReturnValueOnce(new Promise((_, j) => { rej = j }))
    const { unmount: unmount2 } = render(<PublicArticleDetail slug="b" theme="light" onNavigate={vi.fn()} />)
    unmount2()
    rej(new Error('ignored'))

    const user = userEvent.setup()
    const onNavigate = vi.fn()
    vi.spyOn(blogApi, 'getPublicPostBySlugApi').mockRejectedValueOnce(new Error('Not found'))
    render(<PublicArticleDetail slug="missing" theme="light" onNavigate={onNavigate} />)

    await waitFor(() => expect(screen.getByText(/Artikel tidak ditemukan/)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Kembali ke Beranda' }))
    expect(onNavigate).toHaveBeenCalledWith('/')
  })

  it('renders full article with cover image, author, reading time, and fallback metadata', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    vi.spyOn(blogApi, 'getPublicPostBySlugApi').mockResolvedValueOnce({
      title: 'Panduan Markdown',
      category: 'Teknologi',
      reading_time: 5,
      cover_image_path: 'https://example.com/cover.jpg',
      published_at: '2026-11-22T00:00:00Z',
      author_name: 'admin',
      content: '# Halo Dunia',
    })

    const { rerender } = render(<PublicArticleDetail slug="panduan-markdown" theme="dark" onNavigate={onNavigate} />)
    await waitFor(() => expect(screen.getByText('Panduan Markdown')).toBeInTheDocument())
    expect(screen.getByAltText('Panduan Markdown')).toBeInTheDocument()
    expect(screen.getByTestId('mock-viewer')).toHaveTextContent('# Halo Dunia')

    await user.click(screen.getByText('Kembali ke Galeri Artikel'))
    expect(onNavigate).toHaveBeenCalledWith('/')

    vi.spyOn(blogApi, 'getPublicPostBySlugApi').mockResolvedValueOnce({
      title: 'Artikel Minimal',
      category: 'Umum',
      reading_time: 1,
      created_at: '2026-11-22T00:00:00Z',
      content: 'Teks polos',
    })
    rerender(<PublicArticleDetail slug="artikel-minimal" theme="light" onNavigate={onNavigate} />)
    await waitFor(() => expect(screen.getByText('Delcom Author')).toBeInTheDocument())
  })
})
