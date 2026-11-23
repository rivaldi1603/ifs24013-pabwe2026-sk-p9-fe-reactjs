import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StickyNavbar from './StickyNavbar'

describe('StickyNavbar', () => {
  it('navigates for guest, toggles theme, and handles mobile menu', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onToggleTheme = vi.fn()
    const onLogout = vi.fn()

    render(
      <StickyNavbar
        user={null}
        theme="light"
        onToggleTheme={onToggleTheme}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />,
    )

    await user.click(screen.getByText('Delcom Blog'))
    expect(onNavigate).toHaveBeenCalledWith('/')

    await user.click(screen.getByText('Beranda Publik'))
    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(onNavigate).toHaveBeenCalledWith('/login')

    await user.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(onNavigate).toHaveBeenCalledWith('/register')

    await user.click(screen.getByLabelText('Toggle tema'))
    expect(onToggleTheme).toHaveBeenCalled()

    await user.click(screen.getByLabelText('Menu mobile'))
    await user.click(screen.getAllByText('Beranda Publik')[1])

    await user.click(screen.getByLabelText('Menu mobile'))
    await user.click(screen.getAllByText('Masuk')[1])

    await user.click(screen.getByLabelText('Menu mobile'))
    await user.click(screen.getAllByText('Daftar')[1])
  })

  it('shows author & admin navigation and logout in desktop and mobile views', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onLogout = vi.fn()

    render(
      <StickyNavbar
        user={{ id: 1, username: 'admin', role: 'admin' }}
        theme="dark"
        onToggleTheme={vi.fn()}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />,
    )

    await user.click(screen.getByText('Workspace Penulis'))
    expect(onNavigate).toHaveBeenCalledWith('/author')

    await user.click(screen.getByText('Admin Panel'))
    expect(onNavigate).toHaveBeenCalledWith('/admin')

    await user.click(screen.getByRole('button', { name: 'Keluar' }))
    expect(onLogout).toHaveBeenCalledTimes(1)

    await user.click(screen.getByLabelText('Menu mobile'))
    await user.click(screen.getAllByText('Workspace Penulis')[1])
    await user.click(screen.getByLabelText('Menu mobile'))
    await user.click(screen.getAllByText('Admin Panel')[1])
    await user.click(screen.getByLabelText('Menu mobile'))
    await user.click(screen.getAllByText('Keluar')[1])
    expect(onLogout).toHaveBeenCalledTimes(2)
  })
})
