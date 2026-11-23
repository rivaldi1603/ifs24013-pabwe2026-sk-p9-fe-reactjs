import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AiPostGeneratorModal from './AiPostGeneratorModal'
import * as blogApi from '../api/blogApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

describe('AiPostGeneratorModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(toolsHelper, 'showErrorAlert').mockResolvedValue({})
  })

  it('returns null when closed, generates article with search sources, and applies draft', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onApplyDraft = vi.fn()

    const { container, rerender } = render(
      <AiPostGeneratorModal isOpen={false} onClose={onClose} onApplyDraft={onApplyDraft} />,
    )
    expect(container.firstChild).toBeNull()

    vi.spyOn(blogApi, 'generateAiPostApi')
      .mockRejectedValueOnce(new Error('AI down'))
      .mockResolvedValueOnce({
        title: 'Tanpa Sumber',
        category: 'Teknologi',
        excerpt: 'Ex',
        content: '# Konten',
      })
      .mockResolvedValueOnce({
        title: 'AI 2026',
        category: 'Bisnis',
        excerpt: 'Ringkasan AI',
        content: '# AI 2026\nIsi dengan sitasi.',
        search_sources: [{ title: 'Delcom News', url: 'https://delcom.org', snippet: 'Berita AI' }],
      })

    rerender(<AiPostGeneratorModal isOpen={true} onClose={onClose} onApplyDraft={onApplyDraft} />)

    await user.type(screen.getByLabelText('Topik Artikel'), 'Tren AI 2026')
    await user.selectOptions(screen.getByLabelText('Kategori Artikel'), 'Bisnis')
    await user.click(screen.getByLabelText(/Aktifkan Penelusuran Mesin Pencari/))

    await user.click(screen.getByRole('button', { name: 'Generate Draf Artikel AI' }))
    await waitFor(() => {
      expect(toolsHelper.showErrorAlert).toHaveBeenCalledWith('AI Blog Generator Gagal', 'AI down')
    })

    await user.click(screen.getByRole('button', { name: 'Generate Draf Artikel AI' }))
    await waitFor(() => expect(screen.getByText('Tanpa Sumber')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Generate Draf Artikel AI' }))
    await waitFor(() => {
      expect(screen.getByText('AI 2026')).toBeInTheDocument()
      expect(screen.getByText('Delcom News')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Simpan & Terapkan ke Editor' }))
    expect(onApplyDraft).toHaveBeenCalledWith({
      title: 'AI 2026',
      category: 'Bisnis',
      excerpt: 'Ringkasan AI',
      content: '# AI 2026\nIsi dengan sitasi.',
      is_published: false,
    })
    expect(onClose).toHaveBeenCalled()
  })
})
