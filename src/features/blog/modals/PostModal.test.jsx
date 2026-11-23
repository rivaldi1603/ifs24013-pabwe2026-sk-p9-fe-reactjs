import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostModal from './PostModal'
import * as blogApi from '../api/blogApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange }) => (
    <textarea
      aria-label="Konten Editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

describe('PostModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showSuccessAlert').mockResolvedValue({})
    vi.spyOn(toolsHelper, 'showErrorAlert').mockResolvedValue({})
  })

  it('returns null when closed and creates a new post', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSaved = vi.fn()

    const { container, rerender } = render(<PostModal isOpen={false} onClose={onClose} onSaved={onSaved} />)
    expect(container.firstChild).toBeNull()

    vi.spyOn(blogApi, 'createPostApi')
      .mockRejectedValueOnce(new Error('Validation fail'))
      .mockResolvedValueOnce({ id: 1 })

    rerender(<PostModal isOpen={true} onClose={onClose} onSaved={onSaved} />)

    await user.type(screen.getByLabelText('Judul Artikel'), 'Belajar Gin')
    await user.selectOptions(screen.getByLabelText('Kategori'), 'Pendidikan')
    await user.type(screen.getByLabelText('Ringkasan (Excerpt)'), 'Ringkas')
    await user.type(screen.getByLabelText('URL Gambar Sampul (Opsional)'), 'https://img.test/a.png')
    await user.click(screen.getByLabelText('Publikasikan langsung ke halaman publik'))
    await user.type(screen.getByLabelText('Konten Editor'), '# Hello')

    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => {
      expect(toolsHelper.showErrorAlert).toHaveBeenCalledWith('Gagal Menyimpan Artikel', 'Validation fail')
    })

    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => {
      expect(onSaved).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('edits existing post and handles empty draft prefill', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSaved = vi.fn()
    vi.spyOn(blogApi, 'updatePostApi').mockResolvedValue({ id: 5 })

    const { rerender } = render(
      <PostModal
        isOpen={true}
        onClose={onClose}
        onSaved={onSaved}
        initialPost={{
          id: 5,
          title: 'Edit Post',
          category: 'Bisnis',
          excerpt: 'Ex',
          cover_image_path: '/img.png',
          content: 'Body',
          is_published: true,
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => {
      expect(blogApi.updatePostApi).toHaveBeenCalledWith(5, expect.objectContaining({ title: 'Edit Post' }))
    })

    rerender(<PostModal isOpen={true} onClose={onClose} onSaved={onSaved} initialPost={{}} />)
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
  })
})
