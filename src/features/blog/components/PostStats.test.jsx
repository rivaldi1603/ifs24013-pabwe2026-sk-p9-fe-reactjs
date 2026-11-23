import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostStats from './PostStats'

describe('PostStats', () => {
  it('renders 3 stat cards and triggers onSelectStatus on click', async () => {
    const user = userEvent.setup()
    const onSelectStatus = vi.fn()

    render(
      <PostStats
        stats={{ total_articles: 8, total_selesai: 5, belum_selesai: 3 }}
        activeStatus="published"
        onSelectStatus={onSelectStatus}
      />,
    )

    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    await user.click(screen.getByText('Total Artikel'))
    expect(onSelectStatus).toHaveBeenCalledWith('')

    await user.click(screen.getByText('Belum Selesai / Draf'))
    expect(onSelectStatus).toHaveBeenCalledWith('draft')
  })

  it('uses default stats when props are omitted', () => {
    render(<PostStats onSelectStatus={vi.fn()} />)
    expect(screen.getAllByText('0')).toHaveLength(3)
  })
})
